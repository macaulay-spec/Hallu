import type { CommunityRole } from '@/services/communities';

// Client-side community permission checks. These only decide which controls
// render; every action is re-authorized server-side by migration 0011 RLS.
// Community roles NEVER imply platform powers (firebase invariant).

export function canModerate(role: CommunityRole | null): boolean {
  return role === 'moderator' || role === 'owner';
}

export function canPin(role: CommunityRole | null): boolean {
  return canModerate(role);
}

export function canRemovePosts(role: CommunityRole | null): boolean {
  return canModerate(role);
}

export function canBan(role: CommunityRole | null): boolean {
  return canModerate(role);
}

export function canEditRules(role: CommunityRole | null): boolean {
  return canModerate(role);
}

export function canReviewRequests(role: CommunityRole | null): boolean {
  return canModerate(role);
}

export function canManageRoles(role: CommunityRole | null): boolean {
  return role === 'owner';
}

export function isMember(role: CommunityRole | null): boolean {
  return role !== null;
}
