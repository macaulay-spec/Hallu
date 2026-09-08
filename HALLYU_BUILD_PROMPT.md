# HALLYU — Build Prompt for a Future Coding Agent

> Use this prompt together with the blueprint images in `blueprints/` and the master
> spec `Hallyu_Final_Integrated_Master_Build_Specification.md`. The images define the
> visual target. The spec defines the product rules. Match both.

---

## One-line task

Build **Hallyu**, a production-quality, mobile-first social platform for K-drama
fandom (working tagline: **"Where the Wave Lives"**), matching the 28-screen
blueprint set in `blueprints/` and the product rules in the master spec.

## Read these first

1. `Hallyu_Final_Integrated_Master_Build_Specification.md` — the source of truth
   for features, scope, permissions, data model, and rules. It is a built spec,
   not a suggestion: do **not** silently add streaming, monetization, messaging,
   web app, or other out-of-MVP features.
2. `blueprints/premium/` — high-fidelity rendered UI targets (Apple-level style).
3. `blueprints/line-art/` — exact layout/component wireframes with numbered
   annotations. If a premium mockup is missing for a screen, use its line-art.
4. `blueprints/README.md` — file map, naming, and how to regenerate the vectors.

## Non-negotiable product rules (from the spec)

- Mobile-first. Design for touch, thumb reach, intermittent networks, deep links,
  push notifications.
- **Community is the product.** Drama/episode metadata exists to give the
  community context. Drama hubs must feel alive, not like database pages.
- **Episode-first social model.** A drama has episodes; an episode has a
  discussion; discussions contain posts; posts have reactions/comments.
- **Spoiler safety.** Track "watched through episode X". Gate discussion content
  by spoiler level per user. Provide reveal/hide, mute drama, preferences.
- **Five-destination navigation only:** Home · Explore · Create ·
  Notifications · Profile.
- Real backend (Supabase/PostgreSQL), real auth, real RLS, real loading / empty /
  error states. **No fake JSON pretending to be a finished feature.** No
  hard-coded fake counts in production UI. No placeholder buttons that go nowhere.
- Do not build: streaming, downloading, monetization, AR, video editor, DMs
  (v1.1), web app.
- Accessibility toward WCAG 2.1 AA: screen readers, dynamic type, contrast,
  touch targets, reduced motion.

## Visual baseline (must match the images)

- **Mode:** dark-first, cinematic, premium. Base surface `#0F0F0F`.
- **Brand gradient:** `#4A1C6E → #2D6CDF` (purple→blue). Use as identity accent,
  not on every surface.
- **Accent:** `#FF6B6B` (used sparingly for alerts, likes, highlights).
- **Typography:** Inter or equivalent modern sans-serif; strong weight for
  headings, responsive scaling.
- **Cards:** ~12px radius, restrained elevation, ~16px internal padding,
  generous breathing room.
- **Motion:** fluid, subtle, cinematic. No heavy/bouncy animations.
- **Device frame:** every mockup is an iPhone-style phone. Build is React Native +
  Expo (per spec), tuned to look like the iOS-style frames shown while remaining
  accessible.

## Screen inventory (28 screens, grouped)

### Auth & onboarding
1. **Splash** — wave mark, HALLYU wordmark, Korean subtitle, tagline.
2. **Welcome / Get Started** — cinematic hero, brand promise, primary CTA,
   community avatar teaser, "Already have an account".
3. **Sign Up / Log In** — email + password, Continue, Google + Apple, terms note.
4. **Onboarding · Interests** — genre chip grid, multi-select, progress dots.
5. **Onboarding · Follows** — drama poster cards with follow buttons, community
   suggestions, Join rows, Continue.
6. **Onboarding · Actors** — circular actor portrait grid, check badges, progress.
7. **Onboarding · Communities & Official accounts** — Join rows, verified
   official cards, Continue.
8. **Onboarding · Completion** — success wave/checkmark, "Your wave is ready",
   Start exploring.
9. **Account Recovery** — Forgot password, email field, Send reset link, back to
   sign in.

### Main tabs
10. **Home · For You** — segmented control (For You / Following), update rings,
    feed cards with avatar, handle, timestamp, drama/episode chip, text, media,
    spoiler overlay, action row (like/comment/repost/bookmark).
11. **Home · Following** — chronological feed from followed users, dramas,
    actors, communities, official accounts; episode-release event cards.
12. **Explore** — search field, trending topic pills, "Current Wave" airing
    carousel, Trending Now grid, Popular Communities, official accounts.
13. **Create Composer** — text area, drama/episode tag, hashtags, spoiler toggle,
    media grid, category pills (Reaction, Discussion, Theory, Meme), Preview &
    Publish.
14. **Notifications** — filter chips, priority episode-release card, event rows
    (reply, mention, community announcement, actor update), deep links, empty
    state.
15. **Profile** — cover gradient, avatar, handle/bio, stats (Following /
    Followers / Likes), Currently Watching rail, tabs (Posts/Saved/Watchlist/
    Communities), posts, follow button.
16. **Settings** — grouped list: account & security, notifications toggles,
    spoiler preferences, privacy & blocks, appearance, accessibility, log out.

### Content & graph
17. **Drama Hub** — full-bleed backdrop, title + Korean title, genres, status,
    Follow + watching status, cast carousel, episode list with live discussion
    counts, community tabs (Discussions / Theories / Memes / Edits / Official).
18. **Episode Discussion** — episode hero, number/title/air time, spoiler gate
    prompt ("You've watched through Ep X — safe to discuss"), live reactions,
    thread list, join discussion composer.
19. **Post Detail + Comments** — full post, drama/episode context, 3-level nested
    replies, reactions, reply composer.
20. **Actor Page** — cinematic portrait, name, verified check, follower/follow
    buttons, bio, Known For row, Filmography list.
21. **Hashtag Page** — topic header, post count/follow, description, feed,
    related topic chips.
22. **Community Page** — banner, avatar, name, description, member/rules,
    Join button, member avatars, pinned announcement, feed, composer.
23. **Search Results** — search bar, filter chips (All/Dramas/Actors/Users/
    Communities/Posts), unified result sections, end-of-results state.
24. **Currently Watching** — tracked drama rows with episode progress,
    "Add a new drama" entry.
25. **Followers / Following** — segmented toggle, search, rows with follow
    buttons.
26. **Saved / Bookmarks** — filter chips, bookmarked cards, empty hint.

### Trust & moderation
27. **Moderation Queue** (permission-gated, internal): summary cards (Pending /
    Resolved / Actioned), severity filters, report rows with severity badges and
    Approve / Remove / Dismiss actions, audit hint.
28. **(Admin/Moderator internal)** permission-gated — route-level guard so
    ordinary users never see it.

## Deliverables

Produce the app in defined phases from the spec (Foundation → Core social →
K-drama graph → Discovery → Communities → Trust & retention → Hardening).
Run type checks, lint, tests, and validation after each major phase. A feature is
done only when UI + DB + permissions + loading/error/empty states + real
end-to-end flow work. A beautiful screen backed by fake JSON is not done.

## Definition of done

A K-drama fan can: sign up → pick interests → see a relevant feed → discover a
drama → follow it → see episodes → enter an episode discussion safely → post a
reaction → get replies → follow a creator/community → get an episode update →
manage spoilers → return for the next episode. The app looks and feels like the
28 blueprint screens.
