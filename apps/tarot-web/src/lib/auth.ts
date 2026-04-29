/**
 * Auth server functions for Guia da Roda.
 * Magic link authentication with HTTP-only session cookies.
 */

import { createHash, randomUUID } from "node:crypto";
import process from "node:process";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { authSessions, magicLinkTokens, users } from "@webdrops/tarot-db";
import { eq } from "drizzle-orm";
import { getDb } from "./db.server";

const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME ?? "webdrops_auth";
const MAGIC_LINK_TTL_MINUTES = parseInt(
  process.env.AUTH_MAGIC_LINK_TTL_MINUTES ?? "15",
  10,
);
const SESSION_TTL_DAYS = parseInt(
  process.env.AUTH_SESSION_TTL_DAYS ?? "30",
  10,
);
const EMAIL_FROM =
  process.env.AUTH_EMAIL_FROM ?? "Webdrops Auth <login@example.com>";
const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === "true";

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Email is required");

  const [local, domain, ...rest] = normalized.split("@");
  if (!local || !domain || rest.length > 0 || !domain.includes(".")) {
    throw new Error("Email format is invalid");
  }

  return normalized;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return expiresAt <= new Date();
}

async function findOrCreateUser(normalizedEmail: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.normalizedEmail, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const inserted = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      normalizedEmail,
    })
    .returning();

  return inserted[0];
}

async function sendMagicLinkEmail(
  recipientEmail: string,
  magicLink: string,
  tokenId: string,
): Promise<"resend" | "dev-log"> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const subject = "Seu link de acesso";
    const html = `<p>Use o link abaixo para entrar na sua conta.</p><p><a href="${magicLink}">Entrar agora</a></p><p>Se voce nao solicitou este acesso, ignore esta mensagem.</p>`;
    const text = `Use este link para entrar na sua conta: ${magicLink}\n\nSe voce nao solicitou este acesso, ignore esta mensagem.`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [recipientEmail],
        subject,
        html,
        text,
        idempotencyKey: `magic-link/${tokenId}`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to send magic link email with Resend (${response.status}): ${body}`,
      );
    }

    return "resend";
  }

  console.log(
    `[dev-magic-link] recipient=${recipientEmail} link=${magicLink} sender=${EMAIL_FROM}`,
  );
  return "dev-log";
}

function getBaseUrl(): string {
  const request = getRequest();
  const headers = request.headers;

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) {
    const envBase = process.env.AUTH_MAGIC_LINK_BASE_URL;
    if (envBase) return envBase.trim().replace(/\/$/, "");
    throw new Error(
      "AUTH_MAGIC_LINK_BASE_URL is not set and Host header is unavailable",
    );
  }

  const proto =
    headers.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}

function setSessionCookie(sessionToken: string): void {
  const maxAge = SESSION_TTL_DAYS * 24 * 60 * 60;
  const securePart = COOKIE_SECURE ? "; Secure" : "";
  const cookieValue = `${SESSION_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${securePart}`;
  setResponseHeader("Set-Cookie", cookieValue);
}

function clearSessionCookie(): void {
  const cookieValue = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  setResponseHeader("Set-Cookie", cookieValue);
}

function getSessionToken(): string | null {
  const request = getRequest();
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const fragment of cookieHeader.split(";")) {
    const trimmed = fragment.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const name = trimmed.slice(0, eqIndex);
    if (name === SESSION_COOKIE_NAME) {
      return trimmed.slice(eqIndex + 1);
    }
  }

  return null;
}

export const requestMagicLink = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const normalizedEmail = normalizeEmail(data.email);
    const db = getDb();

    const user = await findOrCreateUser(normalizedEmail);

    const tokenId = randomUUID();
    const rawToken = randomUUID();
    const tokenHash = hashSecret(rawToken);
    const now = new Date();
    const expiresAt = addMinutes(now, MAGIC_LINK_TTL_MINUTES);

    await db.insert(magicLinkTokens).values({
      id: tokenId,
      userId: user.id,
      normalizedEmail,
      tokenHash,
      expiresAt,
    });

    const baseUrl = getBaseUrl();
    const magicLink = `${baseUrl.replace(/\/$/, "")}/auth/callback?token=${rawToken}`;

    const deliveryMode = await sendMagicLinkEmail(
      normalizedEmail,
      magicLink,
      tokenId,
    );

    return {
      email: normalizedEmail,
      expiresAt: expiresAt.toISOString(),
      deliveryMode,
    };
  });

export const consumeMagicLink = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const token = data.token?.trim();
    if (!token) throw new Error("Magic link token is required");

    const db = getDb();
    const tokenHash = hashSecret(token);

    const storedTokens = await db
      .select()
      .from(magicLinkTokens)
      .where(eq(magicLinkTokens.tokenHash, tokenHash))
      .limit(1);

    if (storedTokens.length === 0) {
      throw new Error("Magic link is invalid or expired");
    }

    const storedToken = storedTokens[0];

    if (storedToken.consumedAt) {
      throw new Error("Magic link has already been used");
    }

    if (isExpired(storedToken.expiresAt)) {
      throw new Error("Magic link has expired");
    }

    const now = new Date();

    await db
      .update(magicLinkTokens)
      .set({ consumedAt: now })
      .where(eq(magicLinkTokens.id, storedToken.id));

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (userRecords.length === 0) {
      throw new Error("Auth user for magic link was not found");
    }

    const user = userRecords[0];

    if (!user.emailVerifiedAt) {
      await db
        .update(users)
        .set({ emailVerifiedAt: now, updatedAt: now })
        .where(eq(users.id, user.id));
    }

    const sessionToken = randomUUID();
    const sessionHash = hashSecret(sessionToken);
    const sessionId = randomUUID();
    const sessionExpiresAt = addDays(new Date(), SESSION_TTL_DAYS);

    await db.insert(authSessions).values({
      id: sessionId,
      userId: user.id,
      sessionHash,
      expiresAt: sessionExpiresAt,
    });

    setSessionCookie(sessionToken);

    const refreshedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const needsProfileCompletion = !refreshedUser[0]?.displayName;

    return {
      user: refreshedUser[0],
      needsProfileCompletion,
    };
  });

export const getAuthStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      return { user: null, needsProfileCompletion: false };
    }

    const db = getDb();
    const sessionHash = hashSecret(sessionToken);

    try {
      const sessionResults = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.sessionHash, sessionHash))
        .limit(1);

      if (sessionResults.length === 0) {
        clearSessionCookie();
        return { user: null, needsProfileCompletion: false };
      }

      const session = sessionResults[0];

      if (session.revokedAt || isExpired(session.expiresAt)) {
        clearSessionCookie();
        return { user: null, needsProfileCompletion: false };
      }

      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (userRecords.length === 0) {
        clearSessionCookie();
        return { user: null, needsProfileCompletion: false };
      }

      const user = userRecords[0];
      const needsProfileCompletion = !user.displayName;

      return { user, needsProfileCompletion };
    } catch (error) {
      console.error(
        "get_auth_status: failed to load auth session, clearing cookie:",
        error,
      );
      clearSessionCookie();
      return { user: null, needsProfileCompletion: false };
    }
  },
);

export const completeAuthProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { displayName: string }) => data)
  .handler(async ({ data }) => {
    const displayName = data.displayName.trim();
    if (!displayName) throw new Error("Display name is required");

    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error("Not authenticated");

    const db = getDb();
    const sessionHash = hashSecret(sessionToken);

    const sessionResults = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.sessionHash, sessionHash))
      .limit(1);

    if (sessionResults.length === 0) {
      throw new Error("Not authenticated");
    }

    const session = sessionResults[0];

    if (session.revokedAt || isExpired(session.expiresAt)) {
      clearSessionCookie();
      throw new Error("Authenticated session has expired");
    }

    const now = new Date();
    await db
      .update(users)
      .set({ displayName, updatedAt: now })
      .where(eq(users.id, session.userId));

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return userRecords[0];
  });

export const logoutAuth = createServerFn({ method: "POST" }).handler(
  async () => {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      const db = getDb();
      const sessionHash = hashSecret(sessionToken);

      const sessionResults = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.sessionHash, sessionHash))
        .limit(1);

      if (sessionResults.length > 0) {
        await db
          .update(authSessions)
          .set({ revokedAt: new Date() })
          .where(eq(authSessions.id, sessionResults[0].id));
      }
    }

    clearSessionCookie();
  },
);

export async function requireAuthenticatedUser() {
  const status = await getAuthStatus();
  if (!status.user) throw new Error("Not authenticated");
  return status.user;
}
