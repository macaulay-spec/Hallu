import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';

export type ReportTargetType = 'post' | 'comment' | 'user' | 'community';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'spoiler-abuse'
  | 'misinformation'
  | 'explicit'
  | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface MyReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  status: ReportStatus;
  createdAt: string;
}

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  details?: string,
): Promise<Result<null>> {
  void targetType;
  void targetId;
  void reason;
  void details;
  return notConfigured<null>('Submit report');
}

export async function listMyReports(params: PageParams): Promise<Result<Page<MyReport>>> {
  void params;
  return notConfigured<Page<MyReport>>('My reports');
}
