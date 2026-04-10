# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Start Expo dev server (Metro bundler)
npm run web            # Start with web target
npm run ios            # Start with iOS simulator
npm run android        # Start with Android emulator
npm run build:web      # Export static web build (expo export --platform web)
npm run clear          # Start with cleared cache
```

No test suite is configured.

## Architecture

This is a single-file React Native / Expo app (`App.js`) targeting iOS, Android, and web via `react-native-web`. There are no separate screens, components, or navigation libraries — everything lives in one file.

**Screen state machine** (`screen` state): `'surah-select'` → `'quiz'` → `'final'`. Transitions are driven by `initGame()`, `handleNext()`, and `handleRestart()`.

**Data flow:**
1. On mount, `loadSurahs()` fetches surah metadata from `https://quran-proxy.zuha.dev` (a proxy wrapping the alquran.cloud API).
2. When a surah is selected, `initGame(number)` fetches ayahs from `https://surah-proxy.zuha.dev/?number={n}`, then generates one fill-in-the-blank question per ayah. The blank word is chosen randomly; 3 wrong choices are drawn from the pool of all unique words in the surah.
3. Duplicate choices are prevented by normalizing Arabic words with `normalizeWord()` (strips zero-width characters) and tracking via a `Set`.

**Theming:** `DARK`/`LIGHT` color objects are passed to `getStyles(C)` which returns a `StyleSheet`. Styles are memoized on `theme` state changes.

**Arabic fonts:** `SCRIPTS` array maps script ids (`uthmani`, `naskh`, `system`) to Google Fonts family names. Fonts are injected via a `<link>` tag for web; on native, the system Arabic font is used as fallback.

**`legacy/index.html`** — the original plain HTML/JS version of the app, kept for reference. It calls the alquran.cloud API directly (no proxy). Not used in production.

**Deployment:** EAS Build is configured (`eas.json`) with `development`, `preview`, and `production` profiles.
