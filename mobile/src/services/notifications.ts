import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';

export type NotificationKind =
  | 'reaction'
  | 'comment'
  | 'repost'
  | 'follow'
  | 'mention'
  | 'community'
  | 'system';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  actor: ProfileSummary | null;
  text: string;
  postId: string | null;
  communityId: string | null;
  read: boolean;
  createdAt: string;
}

export async function listNotifications(
  params: PageParams,
): Promise<Result<Page<NotificationItem>>> {
  void params;
  return notConfigured<Page<NotificationItem>>('Notifications');
}

export async function getUnreadCount(): Promise<Result<{ count: number }>> {
  return notConfigured<{ count: number }>('Unread count');
}

export async function markNotificationRead(notificationId: string): Promise<Result<null>> {
  void notificationId;
  return notConfigured<null>('Mark read');
}

export async function markAllNotificationsRead(): Promise<Result<null>> {
  return notConfigured<null>('Mark all read');
}
