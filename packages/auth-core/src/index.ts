import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  email: z.email(),
  displayName: z.string().trim().min(1).optional(),
  emailVerifiedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuthSessionSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  userId: z.string().min(1),
  expiresAt: z.string().datetime(),
  revokedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const MagicLinkRequestSchema = z.object({
  email: z.email(),
});

export const MagicLinkIssueResultSchema = z.object({
  email: z.email(),
  expiresAt: z.string().datetime(),
  deliveryMode: z.enum(["resend", "dev-log", "disabled"]),
});

export const CompleteProfileInputSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type MagicLinkRequest = z.infer<typeof MagicLinkRequestSchema>;
export type MagicLinkIssueResult = z.infer<typeof MagicLinkIssueResultSchema>;
export type CompleteProfileInput = z.infer<typeof CompleteProfileInputSchema>;

export interface AuthUserRepository {
  findByEmail(normalizedEmail: string): Promise<AuthUser | undefined>;
  findById(id: string): Promise<AuthUser | undefined>;
}

export interface AuthSessionRepository {
  findByTokenHash(sessionHash: string): Promise<AuthSession | undefined>;
}
