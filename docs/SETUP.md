# Hallyu Setup

## Prerequisites

- Node 22, npm 10
- No backend required to run the client: the app is adapter-first and shows
  honest "backend not linked" states until Supabase (later Firebase) is linked.

## Install

```sh
cd mobile
npm ci
```

If `node_modules` ever vanishes (sandbox resets), re-run `npm ci` before
trusting any gate.

## Run

```sh
cd mobile
EXPO_OFFLINE=1 npx expo start        # dev server (offline mode for sandboxes)
EXPO_OFFLINE=1 npx expo start --web  # web preview
```

Web bundle:

```sh
cd mobile
npm run export:web                   # outputs to mobile/dist/
npx serve dist                       # or any static server
```

## Environment

Copy `mobile/.env.example` to `mobile/.env`. Until `EXPO_PUBLIC_SUPABASE_URL`
and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, every service returns
`{ ok: false, error: { kind: 'notConfigured' } }` and screens say so.
Never put service-role keys in the mobile bundle.

## Preview mode

On the Welcome screen, "Explore the interface (preview, no backend)" opens
navigation-only preview: all screens reachable, every data area honestly
reports the missing backend. Nothing is persisted and nothing is faked.

## Gates

```sh
cd mobile
npm run typecheck   # must be 0 errors
npm run lint        # must be clean (max-warnings=0)
npm run test:ci     # jest-expo unit tests, must be green
npm run export:web  # web bundle must build; served index returns HTTP 200
```

## Backend artifacts

- `supabase/migrations/*.sql` — schema + RLS behavioral spec (12 migrations).
- `docs/FIREBASE_BACKEND_PROMPT.md` — prompt for building the Firebase backend.
