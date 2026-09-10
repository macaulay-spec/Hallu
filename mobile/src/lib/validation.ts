import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetSchema = z.object({
  email: emailSchema,
});

export const postSchema = z.object({
  text: z.string().trim().min(1, 'Write something first').max(5000, 'Posts are limited to 5000 characters'),
  category: z.enum([
    'Reaction',
    'Discussion',
    'Theory',
    'Recommendation',
    'Meme',
    'News',
    'Question',
    'Fan content',
  ]),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, 'Name is required').max(50, 'Names are limited to 50 characters'),
  bio: z.string().trim().max(160, 'Bios are limited to 160 characters'),
});

export const commentSchema = z.object({
  text: z.string().trim().min(1, 'Write a reply first').max(2000, 'Replies are limited to 2000 characters'),
});

export const watchingSchema = z.object({
  dramaId: z.string().min(1, 'Pick a drama first'),
  episode: z.number().int().min(0, 'Episode cannot be negative'),
});

export const communitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Names need at least 3 characters')
    .max(30, 'Names are limited to 30 characters')
    .regex(/^[A-Za-z0-9_ -]+$/, 'Letters, numbers, spaces, _ and - only'),
  description: z.string().trim().max(280, 'Descriptions are limited to 280 characters'),
  visibility: z.enum(['public', 'private']),
});

export const ruleSchema = z.object({
  text: z.string().trim().min(1, 'Write the rule first').max(280, 'Rules are limited to 280 characters'),
});

export const reportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user', 'community']),
  targetId: z.string().min(1, 'Nothing to report'),
  reason: z.enum(['spam', 'harassment', 'spoiler-abuse', 'misinformation', 'explicit', 'other']),
  details: z.string().trim().max(500, 'Details are limited to 500 characters').optional(),
});

export const verificationSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  displayName: z.string().trim().min(2, 'Add the account name').max(60, 'Names are limited to 60 characters'),
  proofDetails: z
    .string()
    .trim()
    .min(10, 'Add links or references that prove this account is official')
    .max(1000, 'Proof is limited to 1000 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type WatchingInput = z.infer<typeof watchingSchema>;
export type CommunityInput = z.infer<typeof communitySchema>;
export type RuleInput = z.infer<typeof ruleSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check your input and try again';
}
