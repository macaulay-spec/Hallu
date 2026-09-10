import type { Page, PageParams, Result } from './core';
import { notConfigured } from './core';
import type { ProfileSummary } from './profiles';

export type VerificationState = 'none' | 'pending' | 'verified' | 'rejected';

export interface VerificationRequestInput {
  accountType: 'individual' | 'organization';
  displayName: string;
  proofDetails: string;
}

export async function getVerificationStatus(): Promise<Result<{ status: VerificationState }>> {
  return notConfigured<{ status: VerificationState }>('Verification status');
}

export async function requestVerification(
  input: VerificationRequestInput,
): Promise<Result<null>> {
  void input;
  return notConfigured<null>('Request verification');
}

export async function listOfficialAccounts(
  params: PageParams,
): Promise<Result<Page<ProfileSummary>>> {
  void params;
  return notConfigured<Page<ProfileSummary>>('Official accounts');
}
