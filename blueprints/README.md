# Hallyu — UI Blueprint Set

This folder contains the visual blueprints for the **Hallyu** K-drama social
platform, matched to the product rules in the repo-root master spec
`Hallyu_Final_Integrated_Master_Build_Specification.md`.

There are **28 screens**, each shown in two styles.

## Folder map

- `premium/` — **Apple-level high-fidelity mockups.** One iPhone-style phone per
  screen on a dark studio backdrop. Uses `#4A1C6E → #2D6CDF` brand gradient,
  `#0F0F0F` dark surfaces, `#FF6B6B` accent. Filenames `NN-name.png`
  (1408×768).
  - `00-master-overview.png` — six key screens on one board.
- `line-art/` — **Technical blueprints.** Vector wireframes on a navy grid, each
  with 3 numbered callouts. Available as `.svg` (crisp/editable) and `.png`
  (1200×800 viewBox, rasterized at 1600px wide).
  - All annotation text is hand-authored in the SVG, so labels stay accurate.

## Screen list (28)

| # | Screen | Premium | Line-art |
|---|--------|---------|----------|
| 00 | Master overview board | `premium/00` | — |
| 01 | Splash / Brand | `premium/01-splash` | `line-art/01-splash` |
| 02 | Welcome / Get Started | `premium/02-welcome` | `line-art/02-welcome` |
| 03 | Sign Up / Log In | `premium/03-signup-login` | `line-art/03-auth` |
| 04 | Onboarding · Interests | `premium/04-onboarding-interests` | `line-art/04-onboarding-interests` |
| 05 | Onboarding · Follows | `premium/05-onboarding-follows` | `line-art/05-onboarding-follows` |
| 06 | Home · For You | `premium/06-home-foryou` | `line-art/06-home-foryou` |
| 07 | Home · Following | `premium/07-home-following` | `line-art/07-home-following` |
| 08 | Explore | `premium/08-explore` | `line-art/08-explore` |
| 09 | Create Composer | `premium/09-create-composer` | `line-art/09-create` |
| 10 | Notifications | `premium/10-notifications` | `line-art/10-notifications` |
| 11 | Profile | `premium/11-profile` | `line-art/11-profile` |
| 12 | Drama Hub | `premium/12-drama-hub` | `line-art/12-drama-hub` |
| 13 | Episode Discussion | `premium/13-episode-discussion` | `line-art/13-episode` |
| 14 | Post Detail + Comments | `premium/14-post-detail` | `line-art/14-post-detail` |
| 15 | Community Page | `premium/15-community-page` | `line-art/15-community` |
| 16 | Search Results | `premium/16-search-results` | `line-art/16-search` |
| 17 | Account Recovery | `premium/17-account-recovery` | `line-art/17-account-recovery` |
| 18 | Onboarding · Actors | `premium/18-onboarding-actors` | `line-art/18-onboarding-actors` |
| 19 | Onboarding · Communities | `premium/19-onboarding-communities` | `line-art/19-onboarding-communities` |
| 20 | Onboarding · Completion | `premium/20-onboarding-completion` | `line-art/20-onboarding-completion` |
| 21 | Actor Page | `premium/21-actor-page` | `line-art/21-actor-page` |
| 22 | Hashtag Page | `premium/22-hashtag-page` | `line-art/22-hashtag-page` |
| 23 | Saved / Bookmarks | `premium/23-saved` | `line-art/23-saved` |
| 24 | Followers | `premium/24-followers` | `line-art/24-followers` |
| 25 | Settings | `premium/25-settings` | `line-art/25-settings` |
| 26 | Moderation Queue | `premium/26-moderation-queue` | `line-art/26-moderation` |
| 27 | Following List | `premium/27-following` (next) | `line-art/27-following` |
| 28 | Currently Watching | `premium/28-currently-watching` (next) | `line-art/28-currently-watching` |

> Note: premium files `27` and `28` are generated in the next batch (image
> generator is capped at 10 per turn). Their **line-art** counterparts are
> already committed and are the reference for those screens.

## How to regenerate the line-art

```bash
pip install --user cairosvg   # not needed if you just recreate PNGs
node blueprints/render_lineart.js   # regenerates all line-art PNGs from SVGs
```

Actually, the PNGs are produced reproducibly from the SVGs via
`@resvg/resvg-js`. To edit a wireframe, edit `blueprints/make_lineart.py`
(screen functions + `SCREENS` table), then run:

```bash
python3 blueprints/make_lineart.py
npm run render
```

## How to use this with a build agent

Point the builder at:
- `blueprints/` for the visual target (each screen + annotations),
- `HALLYU_BUILD_PROMPT.md` (repo root) for the build instructions,
- `Hallyu_Final_Integrated_Master_Build_Specification.md` for product rules,
  data model, permissions, phases, and definition of done.
