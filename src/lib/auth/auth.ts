import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "orderinbox-super-secret-key-32-chars-minimum-prod-grade",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * Server-side helper to retrieve the authenticated session from request headers.
 */
export async function getSession(customHeaders?: Headers) {
  const reqHeaders = customHeaders || (await headers());
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Server-side helper that enforces an authenticated user in API route handlers.
 * Returns the user object if authenticated, or null.
 */
export async function requireAuth(req?: Request) {
  const reqHeaders = req ? req.headers : await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    return null;
  }

  return session;
}
