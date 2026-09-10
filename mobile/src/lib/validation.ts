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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type WatchingInput = z.infer<typeof watchingSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check your input and try again';
}
