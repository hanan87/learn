# Polski · Crnogorski od zera – פולנית ומונטנגרית מאפס

A mobile-first PWA for learning **Polish** or **Montenegrin** from zero, for **Hebrew** speakers (RTL, vocalized Hebrew transcription) and **English** speakers (LTR, English respelling).

Live: https://hanan87.github.io/learn/

### Courses

- **Polish** – the full course below.
- **Montenegrin** (starter course) – 4 units, 52 items (sounds č/ć, dž/đ, lj/nj, vowel r and ije; politeness with Vi/ti; numbers, directions and time; café and restaurant), a Sound Lab with 4 minimal-pair groups, a café roleplay in Kotor, hands-free mode, Speed Blitz and the Montenegrin keyboard. Montenegrin has no dedicated speech engines, so recognition uses Croatian (`hr-HR`, same Latin Ijekavian spelling) and the voices are Bosnian / Croatian / Serbian.
- The course is picked on the welcome screen, on the map or in Settings; each course keeps its own progress (`lib/course.ts`).

### Polish course

- 8 units, 104 items: pronunciation, politeness (Pan/Pani vs ty), numbers & time, restaurant, shopping, transport, emergencies, small talk
- Stressed-syllable highlighting, articulation tips, backchaining (units 5–8 hand-checked syllables and transcriptions)
- Speaker gender + first name: gendered phrases (Zgubiłem / Zgubiłam, gotowy / gotowa, Chciałbym / Chciałabym) and roleplays adapt, with a note showing the other form
- Hands-free audio mode (driving / walking): meaning → slow → normal → you repeat, auto-scored, Wake Lock keeps the screen on
- 4 mini stories with tap-to-inspect words, an ending decoder (kawa → kawę) and comprehension questions
- 60-second Speed Blitz with combos and a saved personal record; optional haptic feedback
- Speech engine: Polish TTS (normal / 0.6× / backchaining), recording + speech recognition, voice comparison, Levenshtein scoring
- Lesson engine with 5 skill stages: learn & shadow, listening & minimal pairs, reading, writing with a Polish keyboard, active-recall speaking
- Spaced repetition, per-word and per-sound weakness tracking, personalized 8-exercise reinforcement, personal dictionary
- Voice roleplay: 4 real-life scenarios
- Standalone single-file `index.html` download and JSON backup/restore
- Light / dark / device theme; built-in microphone diagnostic in Settings

## Development

```bash
npm install
npm run dev
npm run build
```

```bash
npm test          # unit + data-integrity tests (Vitest)
npm run test:e2e  # end-to-end QA in installed Chrome with a fake microphone (Playwright)
```

`npm run build` type-checks, builds the standalone single-file app and then the PWA into `dist/`. Pushing to `main` deploys to GitHub Pages.
