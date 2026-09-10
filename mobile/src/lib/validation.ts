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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetInput = z.infer<typeof resetSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check your input and try again';
}
