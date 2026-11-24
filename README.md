# Polski · Crnogorski · English · עברית – פולנית, מונטנגרית, אנגלית ועברית

A mobile-first PWA for learning **Polish** or **Montenegrin** from zero, for **Hebrew** speakers (RTL, vocalized Hebrew transcription) and **English** speakers (LTR, English respelling) – **everyday English** for Hebrew, Polish and Montenegrin speakers, and **Hebrew from zero** for English, Polish and Montenegrin speakers.

Live: https://hanan87.github.io/learn/

### Courses

- **Polish** – the full course below.
- **Montenegrin** (starter course) – 4 units, 52 items (sounds č/ć, dž/đ, lj/nj, vowel r and ije; politeness with Vi/ti; numbers, directions and time; café and restaurant), a Sound Lab with 4 minimal-pair groups, a café roleplay in Kotor, hands-free mode, Speed Blitz and the Montenegrin keyboard. Montenegrin has no dedicated speech engines, so recognition uses Croatian (`hr-HR`, same Latin Ijekavian spelling) and the voices are Bosnian / Croatian / Serbian.
- **Everyday English** (for Hebrew speakers, taught in Hebrew only) – 6 units, 77 items for learners who already know a little: the sounds Hebrew lacks (th, w vs v, the American r, ship vs sheep, bad vs bed, word stress), small talk, café and restaurant, directions and transport, shopping, hotel, flights and the phone; a Sound Lab with 4 minimal-pair groups, 3 roleplays (a New York coffee shop, a hotel check-in, asking the way) and American voices (Jenny / Guy) with `en-US` recognition. English spelling does not show pronunciation, so every word has a hand-written entry – syllables and vocalized Hebrew letters (`data/en/lexicon.ts`, `lib/enPhonetics.ts`); inflected forms are derived and other words get a rule-based approximation. `LEARN_COURSE=en npx tsx scripts/en-lexicon-check.ts` lists course words missing from the lexicon.
- The course is picked on the welcome screen, on the map or in Settings; each course keeps its own progress (`lib/course.ts`).
- **Hebrew from zero** (for English, Polish and Montenegrin speakers) – an **Alef-Bet** unit first (`data/he/alphabet.ts`): 8 lessons teach the 22 letters, their dotted and final forms and the vowel signs on cards (shape, name, sound, a word with the letter highlighted), quiz each sound, then read, hear and write 4 real words built only from the letters learned so far; a chart of all letters sits in the unit. Then 6 units, 79 items: greetings, introductions, café and food, the market and numbers, getting around, family and holidays; a Sound Lab with 3 minimal-pair groups (ח / ה, ח / כּ · ק, צ / ס), 3 roleplays (a Tel Aviv café, the Carmel Market, a Shabbat dinner) and Israeli voices (Hila / Avri) with `he-IL` recognition. Phrases are shown vocalized and right to left; every word is split into syllables by hand in `data/he/lexicon.ts`, and `lib/hePhonetics.ts` reads the Latin transcription off the niqqud (sha·LOM), which Polish and Montenegrin speakers see in their own letters (sza·LOM, ša·LOM – `lib/latinRespell.ts`). Writing exercises get a Hebrew alphabet keyboard; speech is scored without niqqud, and digits the recognizer writes are read as number words.
- **How do I say…?** tab: type a word or sentence in Hebrew / English (or in the course language) – it is translated (course phrases first, then MyMemory machine translation, then Chrome's on-device translator), spoken normally and slowly, shown with syllables, stress, transcription and a word-by-word breakdown; you repeat it and get an honest score, and can save it to your dictionary (`lib/translate.ts`, `views/SayIt.tsx`).

### Polish course

- 8 units, 104 items: pronunciation, politeness (Pan/Pani vs ty), numbers & time, restaurant, shopping, transport, emergencies, small talk
- Stressed-syllable highlighting, articulation tips, backchaining (units 5–8 hand-checked syllables and transcriptions)
- Speaker gender + first name: gendered phrases (Zgubiłem / Zgubiłam, gotowy / gotowa, Chciałbym / Chciałabym) and roleplays adapt, with a note showing the other form
- Hands-free audio mode (driving / walking): meaning → slow → normal → you repeat, auto-scored, Wake Lock keeps the screen on
- 4 mini stories with tap-to-inspect words, an ending decoder (kawa → kawę) and comprehension questions
- 60-second Speed Blitz with combos and a saved personal record; optional haptic feedback
- Speech engine: Polish TTS (normal / 0.6× / backchaining), recording + speech recognition, voice comparison, Levenshtein scoring
- Natural neural voices (Azure AI Speech): pre-recorded clips for all course content (`npm run voice`), plus an optional live cloud voice for everything else, including free-typed "How do I say…?" phrases – the learner stores their own free Azure key on the device (Settings → Teacher voice); it never enters the site, the repository or a backup
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

Natural-voice clips for all course content (1,758 phrases, about 41,000 characters for both courses). The clips are committed into `public/audio`, so they keep working for good, offline too:

```bash
# Free – no account, key or card: Microsoft Edge's online neural voices (unofficial edge-tts package)
pip install edge-tts
npm run voice:free       # synthesize missing clips into public/audio

# Or with your own Azure AI Speech key – .env.local (git-ignored): AZURE_SPEECH_KEY=…  AZURE_SPEECH_REGION=westeurope
npm run voice

npm run voice -- --dry   # count phrases and characters
```

```bash
npm test          # unit + data-integrity tests (Vitest)
npm run test:e2e  # end-to-end QA in installed Chrome with a fake microphone (Playwright)
```

`npm run build` type-checks, builds the standalone single-file app and then the PWA into `dist/`. Pushing to `main` deploys to GitHub Pages.
