/**
 * Generates the natural-voice clips into public/audio/ and writes public/audio/manifest.json.
 * Two engines produce the same neural voices (Vesna, Goran, Zofia, Marek, Hila, Jenny):
 *
 *   npm run voice:free       # free, no account or key: Edge's online voices (pip install edge-tts once)
 *
 *   .env.local:  AZURE_SPEECH_KEY=…   AZURE_SPEECH_REGION=westeurope
 *   npm run voice            # Azure AI Speech with your own key (it never leaves this machine or enters git)
 *
 *   npm run voice -- --dry   # only count phrases and characters
 *
 * Clips are content-addressed (hash of voice + speed + text), so re-running after a content change
 * only synthesizes new phrases. Stale files are removed with --prune.
 * Every course is included: the course data is built per page load, so each course's catalog is
 * produced in its own process (scripts/dump-catalog.ts with LEARN_COURSE) and the lists are merged.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ClipRequest } from '../src/lib/clipCatalog';
import { COURSES, type CourseId } from '../src/lib/course';
import { AZURE_OUTPUT_FORMAT, AZURE_VOICES, azureTtsUrl, buildSsml, clipFileName, prosodyRate } from './voice-lib';

const OUT = 'public/audio';
const args = new Set(process.argv.slice(2));
const dry = args.has('--dry');
const prune = args.has('--prune');
const edge = args.has('--edge');

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...env, ...(process.env as Record<string, string>) };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function synthesize(key: string, region: string, ssml: string): Promise<Buffer> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(azureTtsUrl(region), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': AZURE_OUTPUT_FORMAT,
        'User-Agent': 'polish-learn-app-voice-generator',
      },
      body: ssml,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 1500 * 2 ** attempt;
      await sleep(wait);
      continue;
    }
    throw new Error(`Azure TTS ${res.status}: ${await res.text()}`);
  }
  throw new Error('Azure TTS: too many retries');
}

function courseCatalog(course: CourseId): ClipRequest[] {
  const json = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/dump-catalog.ts'], {
    env: { ...process.env, LEARN_COURSE: course },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(json) as ClipRequest[];
}

async function main() {
  const merged = new Map<string, ClipRequest>();
  for (const id of Object.keys(COURSES) as CourseId[]) {
    const list = courseCatalog(id);
    console.log(`${COURSES[id].name.en}: ${list.length} phrases`);
    for (const c of list) merged.set(c.key, c);
  }
  const catalog = [...merged.values()];
  const chars = catalog.reduce((n, c) => n + c.text.length, 0);
  console.log(`${catalog.length} phrases, ${chars} characters (Azure free tier: 500,000 / month).`);
  if (dry) return;

  mkdirSync(OUT, { recursive: true });
  const clips: Record<string, string> = {};
  const todo = catalog.filter((c) => {
    const file = clipFileName(c.key);
    clips[c.key] = file;
    return !existsSync(join(OUT, file));
  });
  console.log(`${todo.length} new clips to synthesize${edge ? ' (free Edge voices)' : ''}.`);

  const failed = edge ? synthesizeWithEdge(todo, clips) : await synthesizeWithAzure(todo, clips);
  writeManifest(clips, failed);
}

/** Free engine: hands the job list to scripts/edge-voice.py (edge-tts). Returns the number of failures. */
function synthesizeWithEdge(todo: ClipRequest[], clips: Record<string, string>): number {
  if (!todo.length) return 0;
  const jobs = todo.map((c) => ({ text: c.text, voice: AZURE_VOICES[c.voice].name, rate: prosodyRate(c.voice, c.speed), out: join(OUT, clips[c.key]) }));
  const jobFile = join(tmpdir(), `learn-voice-jobs-${process.pid}.json`);
  writeFileSync(jobFile, JSON.stringify(jobs));
  const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const run = spawnSync(python, ['scripts/edge-voice.py', jobFile], { stdio: 'inherit' });
  unlinkSync(jobFile);
  if (run.error || run.status === 2) {
    console.error(run.error ? `Could not start ${python}: ${run.error.message}` : 'Install the free engine once with:  pip install edge-tts');
    process.exit(1);
  }
  return todo.filter((c) => !existsSync(join(OUT, clips[c.key]))).length;
}

/** Azure engine: the learner's own key from .env.local. Returns the number of failures. */
async function synthesizeWithAzure(todo: ClipRequest[], clips: Record<string, string>): Promise<number> {
  const env = loadEnv();
  const key = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION || 'westeurope';
  if (!key) {
    console.error('Missing AZURE_SPEECH_KEY (put it in .env.local), or use the free engine: npm run voice:free');
    process.exit(1);
  }

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  // Two parallel requests stay inside the free tier's rate limit; 429s back off automatically.
  const worker = async () => {
    while (queue.length) {
      const c = queue.shift()!;
      try {
        const mp3 = await synthesize(key, region, buildSsml(c.voice, c.speed, c.text));
        writeFileSync(join(OUT, clips[c.key]), mp3);
      } catch (err) {
        failed++;
        delete clips[c.key];
        console.error(`\n✗ ${c.key}: ${(err as Error).message}`);
        if (/401|403/.test((err as Error).message)) process.exit(1);
      }
      done++;
      if (done % 20 === 0 || done === todo.length) process.stdout.write(`\r${done}/${todo.length}`);
    }
  };
  await Promise.all([worker(), worker()]);
  console.log('');
  return failed;
}

function writeManifest(clips: Record<string, string>, failed: number): void {
  // Only clips that exist on disk go into the manifest.
  for (const [k, f] of Object.entries(clips)) if (!existsSync(join(OUT, f))) delete clips[k];
  const voices = Object.fromEntries(Object.entries(AZURE_VOICES).map(([k, v]) => [k, v.name]));
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), voices, clips }));
  console.log(`manifest: ${Object.keys(clips).length} clips${failed ? `, ${failed} failed (re-run to retry)` : ''}.`);

  if (prune) {
    const keep = new Set(Object.values(clips));
    let removed = 0;
    for (const f of readdirSync(OUT)) {
      if (f.endsWith('.mp3') && !keep.has(f)) {
        unlinkSync(join(OUT, f));
        removed++;
      }
    }
    console.log(`pruned ${removed} stale clips.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
