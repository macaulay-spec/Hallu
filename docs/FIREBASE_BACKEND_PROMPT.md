# Hallyu Firebase Backend — AI Studio Build Prompt

> Paste this whole document into AI Studio (or any backend agent) to build the
> Firebase backend the Hallyu mobile client is already coded against. The
> client is **adapter-first**: every screen calls `mobile/src/services/*`,
> which today return honest `notConfigured` results. Your job is to make those
> adapters real — **without changing the client's public contracts**.

## 1. Mission

Build a Firebase backend (Auth + Firestore + Storage + Cloud Functions +
optional FCM) for Hallyu, a K-drama fandom app with feeds, discovery,
dramas/actors/watching, communities, and a trust layer. Match the Supabase
reference schema in `supabase/migrations/0001–0012` behavior-for-behavior;
where Firestore cannot express something (joins, RLS predicates), implement it
in Cloud Functions and document the mapping.

Non-goals: changing any client service signature, inventing new error shapes,
client-side secrets, or fake/seeded user content in production.

## 2. Client services contract (DO NOT BREAK)

Every client service returns `Result<T> = { ok: true; data: T } |
{ ok: false; error: ServiceError }` where `ServiceError.kind` is one of
`notConfigured | network | notFound | unknown`. Map backend outcomes as:

| Backend outcome        | Client kind   | Client UX                        |
| ---------------------- | ------------- | -------------------------------- |
| Endpoint missing       | notConfigured | Honest "backend not linked" card |
| Transport/5xx/timeout  | network       | Retryable error state            |
| Missing doc/no access  | notFound      | Empty/404 state                  |
| Validation/permission  | unknown       | Inline message (`error.message`) |

Pagination: cursor-based everywhere. Requests send `{ cursor?, limit? }`;
responses return `{ items, nextCursor: string | null }`. Cursors must be
opaque, stable under inserts, and expire safely (treat unknown cursors as
"start over", never 500).

The 24 client services and their backend mapping:

| # | Client service (`mobile/src/services`) | Backend surface |
| - | -------------------------------------- | --------------- |
| 1 | `auth.ts` | Firebase Auth (email + OAuth providers); session claims carry `username` |
| 2 | `profiles.ts` | `profiles` docs + `updateProfile` function (validates handle/bio/avatar) |
| 3 | `follows.ts` | `follows` subcollection + counters via function |
| 4 | `posts.ts` | `posts` collection; `createPost` function (attaches drama/episode/community links) |
| 5 | `comments.ts` | `comments` subcollection under posts; tree resolved client-side from `parentId` |
| 6 | `reactions.ts` | `postReactions` / `commentReactions` subcollections; counts denormalized on parents |
| 7 | `reposts.ts` | `reposts` collection + `repostCount` |
| 8 | `bookmarks.ts` | `bookmarks` subcollection under users |
| 9 | `hashtags.ts` | `hashtags/{tag}` aggregates + `hashtagPosts` index collection |
| 10 | `dramas.ts` | `dramas` collection (+ `dramaFollows`) |
| 11 | `episodes.ts` | `episodes` subcollection under dramas |
| 12 | `actors.ts` | `actors` + `cast` subcollections (+ `actorFollows`) |
| 13 | `watching.ts` | `watching` per-user subcollection |
| 14 | `discovery.ts` | `getForYou`, `getFollowingFeed`, `getTrendingPosts`, `getTrendingHashtags` functions (Section 7) |
| 15 | `search.ts` | `unifiedSearch` function (prefix indexes per entity, Section 6.14) |
| 16 | `onboarding.ts` | `saveInterests`, `completeOnboarding` functions |
| 17 | `communities.ts` | `communities` + `members`/`rules`/`bans`/`joinRequests`/`communityPosts` subcollections |
| 18 | `notifications.ts` | `notifications` per-user subcollection + `unreadCount` aggregate |
| 19 | `blocks.ts` | `blocks` + `mutes` private subcollections |
| 20 | `reports.ts` | `reports` collection (reporter-scoped reads) |
| 21 | `verification.ts` | `verificationRequests` + `verified` flag (server-only write) |
| 22 | `media.ts` | Firebase Storage uploads with signed URLs |
| 23 | `ai.ts` | `remixMeme`, `postRemix`, `getRecommendations` functions (Section 8, Gemini server-side only) |
| 24 | `core.ts` | Transport conventions only — no backend surface |

## 3. Firestore data model

Collections (document IDs in code font). All timestamps are server timestamps;
all counters update transactionally. Mirror the Supabase column constraints
(lengths, enums, uniqueness) in Functions validation — Firestore rules cannot
check everything, so **rules are the last line, not the only line**.

- `profiles/{uid}`: `username` (unique via `usernames/{lower}`), `displayName`,
  `bio` (≤160), `avatarUrl`, `verified` (**server-only**, invariant 1),
  `onboardingCompleted`, counters: `followerCount`, `followingCount`,
  `likesCount`.
- `usernames/{lower}`: `{ uid }` — uniqueness + lookup.
- `follows/{followerUid}/following/{targetUid}` + mirror
  `followers/{targetUid}/followers/{followerUid}`: `{ createdAt }`.
- `posts/{postId}`: `authorId`, `text` (1–5000), `mediaUrls[]` (≤4),
  `category` (enum of 8), `dramaId?`, `episodeId?`, `communityId?`,
  `spoiler` (bool), `spoilerEpisode?`, `hashtags[]`, counters
  (`reactionCounts{}`, `commentCount`, `repostCount`), `deletedAt?`.
- `comments/{commentId}` (root collection, `postId` field for queries):
  `postId`, `authorId`, `parentId?`, `text` (≤1000), `likeCount`,
  `deletedAt?`.
- `postReactions/{postId}/reactions/{uid}`, `commentReactions/...`: `{ kind }`.
- `reposts/{repostId}`: `postId`, `userId`.
- `users/{uid}/bookmarks/{postId}`, `users/{uid}/interests/{genreSlug}`.
- `hashtags/{tag}`: `postCount`, `participantCount`, `description?`;
  `hashtagPosts/{tag}/posts/{postId}`: `{ authorId, createdAt }`.
- `dramas/{dramaId}`: TMDB-backed metadata (`tmdbId` unique), `title`,
  `synopsis`, `posterUrl`, `status` (airing|completed|upcoming), `genres[]`,
  `episodeCount`, `followerCount`.
- `dramas/{dramaId}/episodes/{number}`: `title?`, `synopsis?`, `airDate?`, stills.
- `actors/{actorId}`: `name`, `portraitUrl`, `verified` (server-only),
  `followerCount`; `dramas/{dramaId}/cast/{actorId}`: `{ role }`.
- `genres/{slug}`: seeded (8 rows, same slugs as migration 0008).
- `users/{uid}/watching/{dramaId}`: `status`, `episode`, `updatedAt`.
- `communities/{communityId}`: `name` (unique, 3–30), `description` (≤280),
  `avatarUrl?`, `bannerUrl?`, `visibility` (public|private), `ownerId`,
  `memberCount`, `rulesCount`.
- `communities/{id}/members/{uid}`: `{ role: member|moderator }` (owner is
  implicit from `ownerId`, never a member row).
- `communities/{id}/rules/{ruleId}`: `{ position, text }`.
- `communities/{id}/bans/{uid}`: `{ reason }`.
- `communities/{id}/joinRequests/{uid}`: `{ status, createdAt }`.
- `communityPosts/{communityId}/posts/{postId}`: `{ pinnedAt? }`.
- `users/{uid}/notifications/{notificationId}`: `kind` (7-enum), `actorId?`,
  `text` (≤280), `postId?`, `communityId?`, `read`, `createdAt`;
  `users/{uid}/meta/counters`: `{ unreadCount }`.
- `users/{uid}/blocks/{targetUid}`, `users/{uid}/mutes/{targetUid}`.
- `reports/{reportId}`: `reporterId`, `targetType` (4-enum), `targetId`,
  `reason` (6-enum), `details` (≤500), `status`, `createdAt`.
- `modActions/{actionId}`: audit log — **no client read/write at all**.
- `platformRoles/{uid}`: `{ role: moderator|admin }` — **self-read only,
  service-only write**.
- `verificationRequests/{uid}`: `{ accountType, displayName, proof, status,
  reviewedBy? }`.
- `counters/{name}`: sharded counters where write rates demand it.

Required composite indexes: posts by `(authorId, createdAt desc)` and
`(createdAt desc)` with `deletedAt == null`; comments by `(postId, createdAt)`;
hashtag posts by `(tag, createdAt desc)`; community posts by
`(communityId, createdAt desc)`; notifications by `(userId, createdAt desc)`;
search prefixes per entity (see 6.14).

## 4. Storage layout

- `avatars/{uid}/{file}` — owner-write, public-read, ≤5 MB, image/* only.
- `posts/{uid}/{postId}/{file}` — owner-write, public-read, ≤10 MB each.
- `communities/{communityId}/{file}` — moderator-write, visibility-gated read.
- `remixes/{uid}/{file}` — function-write only, public-read.
Validate content type + size in rules AND re-validate on the function that
attaches URLs to docs (invariant 16).

## 5. Auth

Firebase Auth with email + Apple/Google OAuth. On signup a function creates
`profiles/{uid}` + reserves `usernames/{lower}` transactionally (handle rules:
3–20 chars, letters/numbers/underscore). Custom claim `username` set at the
same time. Deleting the auth user must cascade (function) to profile,
follows, reactions, bookmarks, watching, notifications, blocks/mutes, and
anonymize posts/comments (keep content, null author) unless the user chose
full erase.

## 6. Security invariants (MUST ALL HOLD)

1. `verified` (profiles, actors) is writable only by service functions —
   never by the owning user, never by community moderators.
2. Community roles NEVER imply platform powers: no function may consult
   community membership when deciding moderation, verification, or safety
   actions.
3. The spoiler gate is enforced server-side (functions + rules): a gated post
   or comment body is never returned to a viewer who fails
   `post_visible_to(viewer, author, drama, spoiler)`; see invariant 20.
4. Blocks are bidirectional and silent: no read path may leak the existence
   or direction of a block to the blocked party.
5. Mutes are unilateral and silent: muted users are never told, and mute
   rows are readable only by their owner.
6. Private communities are invisible to non-members: not in search, trending,
   recommendations, notifications, or member counts — no existence leak.
7. Banned community members read as strangers: ban checks run before
   membership checks on every community path.
8. Only owners change member roles; moderators may ban, pin, remove posts,
   edit rules, and decide join requests — nothing else.
9. Join requests expose only to moderators of that community plus the
   requester (own row only).
10. Reports are reporter-private: reporters read only their own rows and
    status; triage state transitions happen only in service functions.
11. `modActions` has no client principal at all — service-only read/write,
    append-only, every platform moderation action writes one row first.
12. Notifications are fanned out by functions only; clients may only read
    and mark-read their own rows. Fan-out must respect blocks/mutes/private
    visibility at write time.
13. Counters (`reactionCounts`, `followerCount`, `memberCount`, `unreadCount`)
    update only in transactions/functions, never by direct client writes.
14. Search indexes store prefixes, never full private payloads; private
    community names and blocked/muted users are excluded from every index.
15. Gemini features run server-side only: API keys, prompts, and raw model
    output never reach the client; only validated final artifacts do (8).
16. Uploaded media is re-validated (type, size, dimensions) before any URL is
    persisted to a document; URLs never accept `..` or non-app buckets.
17. Rate limits (per uid, silently shed load, never error-burst the client):
    posts 20/hr, comments 60/hr, reactions 300/hr, follows 100/hr, reports
    20/hr, remix 10/day, search 600/hr.
18. Cursors are opaque and forgiving: unknown/expired cursors restart the
    listing; listings are stable under concurrent writes.
19. Deletes cascade or anonymize: deleting a post removes its comments,
    reactions, reposts, bookmarks, hashtag links, and community links;
    deleting a user follows Section 5.
20. Spoiler predicate (`post_visible_to`): visible if not spoiler, OR viewer
    is author, OR viewer is caught up (`watching.episode >= spoilerEpisode`
    for the tagged drama), AND viewer is not blocked by / blocking the
    author, AND the post is not deleted/hidden by moderation. Comments inherit
    their post's gate plus their own spoiler flag.

Write Firestore rules + function validators so each invariant has at least
one automated test in `functions/test/invariants.test.ts`.

## 7. Feed formulas (EXACT — implement verbatim)

Server is the authority; the client mirrors these in `mobile/src/lib/feed.ts`
for optimistic display only. `h` = age in hours (`now - createdAt`); future
timestamps score `null` (excluded).

**For You** (`getForYou`, 90-day window, exclude `null` scores):

```text
score = 0
score += 40  if viewer follows the author
score += 30  if viewer follows the post's drama
score += 15  if viewer is watching the post's drama
score += 10  if any post genre matches viewer interests
momentum = (reactions + 2 * comments + 3 * reposts) / (h + 2) ^ 0.5
score += momentum
```

Then apply, in order: blocks/mutes filter → spoiler gate → private-community
filter → moderation-hidden filter → dedupe → cursor pagination. Log the
winning signals per impression for tuning (retention ≤30 days).

**Following** (`getFollowingFeed`): strict reverse-chronological over the
followed graph (authors + dramas + communities), same filters, no scoring.

**Trending posts** (`getTrendingPosts`, 14-day window):

```text
score = (3 * reactions + 4 * comments + 5 * reposts + 2 * bookmarks) / (h + 2) ^ 1.5
```

**Trending hashtags** (`getTrendingHashtags`, top 8, minimum 2 posts):

```text
score = (3 * participants + posts) / (h + 2)   // h from latest post
```

Precompute trending + hashtag aggregates on a 5-minute schedule; feeds are
computed per request with a 60-second per-user cache.

## 8. Gemini features (server-side only)

1. **Meme Remix** (`remixMeme`, `postRemix`): takes a Meme-category post (+
   optional direction), calls the image model with a fixed safety-reviewed
   system prompt, stores the result in `remixes/`, returns a signed URL.
   Safety filter runs on input meme + direction + output; refusals return a
   typed error the client shows inline. `postRemix` re-validates the remix
   URL belongs to the caller, then creates the post (category Meme, links
   `sourcePostId`).
2. **Recommendations** (`getRecommendations`): candidate dramas from follows,
   watching, interests, and community co-membership; Gemini ranks with
   explanations logged server-side only; the client receives ordered
   `DramaSummary[]` with NO explanations (prompt-injection surface).
3. Quotas: remix 10/day/uid, recommendations cached 24h/uid. All model I/O is
   logged without PII for abuse review, retention ≤30 days.

## 9. Cloud Functions checklist

Auth triggers: `onSignup`, `onUserDelete`. Firestore triggers:
`fanoutNotification` (reactions/comments/reposts/follows/mentions/community),
`updateCounters` (follows/reactions/members), `indexHashtag`,
`indexSearchPrefixes`, `cascadePostDelete`. Scheduled: `computeTrending`
(5 min), `refreshRecommendations` (hourly), `purgeLogs` (daily). Callable/HTTPS:
`createPost`, `updateProfile`, `getForYou`, `getFollowingFeed`,
`getTrendingPosts`, `getTrendingHashtags`, `unifiedSearch`, `saveInterests`,
`completeOnboarding`, `joinCommunity` (+request/decide), `pinPost`,
`removeCommunityPost`, `setMemberRole`, `banMember`, `remixMeme`,
`postRemix`, `getRecommendations`, `submitReport`, `requestVerification`.

## 10. Gate tests per phase (acceptance)

Mirror the client's gates: typecheck 0, lint clean, tests green. Then, per
phase, these black-box checks must pass against the emulator AND staging:

- **Phase 0 (shell/auth):** signup → profile + username reservation atomic;
  duplicate handle rejected; delete cascades per Section 5.
- **Phase 1 (social):** post→comment→reaction→repost→bookmark round trip;
  counts exact under 50 concurrent writers; hashtag aggregates correct.
- **Phase 2 (dramas):** TMDB import idempotent (re-run = no dupes);
  episode/watching writes owner-only; spoiler predicate matches 0009
  fixtures, including the caught-up edge (`episode == spoilerEpisode`
  visible, `episode == spoilerEpisode - 1` gated).
- **Phase 3 (discovery):** feed formula fixtures score exactly (golden
  values in `functions/test/feeds.test.ts`, mirrored from
  `mobile/src/__tests__/feed.test.ts`); 90d/14d windows enforced;
  blocked/muted/private content absent from every feed and search.
- **Phase 4 (communities):** private community invisible to strangers
  (get/list/search/notifications); join/request/approve/leave flows; role
  escalation attempts rejected; banned reads as stranger.
- **Phase 5 (trust):** notification fan-out respects blocks/mutes/private;
  unread counts exact; reports reporter-private; verification flips
  `verified` with audit row; `modActions` unreachable from client SDK.
- **Phase 6 (AI):** remix round trip with safety refusal fixture; quota
  enforced; recommendations exclude blocked/private; no key/prompt leakage
  in any response or log.

Ship a `functions/test/` suite covering every invariant in Section 6 plus
these gates, runnable with `firebase emulators:exec 'npm test'`.

## 11. Notes

- Genre slugs, category enums, reason enums, and role names must match the
  client constants byte-for-byte (`mobile/src/lib/constants.ts`,
  `mobile/src/lib/validation.ts`).
- Time is UTC ISO-8601 everywhere; ages computed server-side.
- When in doubt, the Supabase migrations are the behavioral spec — port
  their RLS predicates into rules + function checks, and call out any
  Firestore-impossible predicate with its function-side replacement.
