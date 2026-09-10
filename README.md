# Hallyu

A K-drama fandom app: social feeds, drama/actor hubs, watching tracking,
discovery, communities, and a trust layer — built adapter-first, with no live
backend wired in yet.

## Layout

- `mobile/` — Expo (React Native + web) app. All backend access flows through
  `mobile/src/services/*`, which return `Result<T>` and honestly report
  "backend not linked" until adapters exist. No fake data, ever.
- `supabase/migrations/` — 12 migrations: the full relational spec (profiles,
  posts, dramas, discovery views, communities, trust).
- `docs/FIREBASE_BACKEND_PROMPT.md` — the AI-Studio prompt that builds the
  Firebase backend against the client's contracts.
- `blueprints/` — line-art UX blueprints the screens implement.

## Setup

```sh
cd mobile
npm ci
```

## Commands

```sh
npm run typecheck        # tsc --noEmit, must be 0
npm run lint             # eslint --max-warnings=0
npm test                 # jest (unit tests, jest-expo)
npm run seed:tmdb        # TMDB_API_KEY=... npm run seed:tmdb > seed.sql
EXPO_OFFLINE=1 npx expo export --platform web   # static web preview
python3 scripts/preview-server.py               # serves dist/ on :8130
```

> Expo must run with `EXPO_OFFLINE=1` in sandboxed environments. Never use
> `@testing-library/react-native` here — pure jest-expo unit tests.

## Gates (every phase)

Typecheck 0 · lint clean · tests green · web bundle serves HTTP 200.

## Build an APK

APKs build on EAS via a manual GitHub Action. See `docs/EAS_APK_BUILD.md`
for the one-time setup (`EXPO_TOKEN` secret + `eas build:configure`), then:
repo → **Actions** → **Build APK** → **Run workflow**.

## Backend status

No live backend is linked. Supabase migrations `0001–0012` define the schema
and RLS; `docs/FIREBASE_BACKEND_PROMPT.md` defines the Firebase build
(contracts, Firestore model, 21 security invariants, feed formulas,
server-side Gemini, gate tests per phase).
