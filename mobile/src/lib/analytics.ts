// Typed analytics events (spec §33). Transport is a dev log until a
// provider is configured; analytics must never block core flows (§30 rules).

export type AnalyticsEvent =
  | 'app_opened'
  | 'onboarding_completed'
  | 'drama_viewed'
  | 'drama_followed'
  | 'episode_opened'
  | 'episode_discussion_opened'
  | 'post_created'
  | 'comment_created'
  | 'reaction_added'
  | 'repost_created'
  | 'bookmark_created'
  | 'community_joined'
  | 'user_followed'
  | 'notification_opened'
  | 'search_performed'
  | 'post_shared';

export type AnalyticsProps = Record<string, string | number | boolean>;

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, props ?? {});
  }
}
