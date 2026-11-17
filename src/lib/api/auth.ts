/**
 * Better Auth Client Wrapper for OrderInbox
 * Provides client-side authentication utilities: signIn, signUp, signOut, and session hooks.
 */

import { authClient, signIn, signUp, signOut, useSession } from "@/lib/auth/auth-client";

export { authClient, signIn, signUp, signOut, useSession };

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign in using email and password
 */
export async function signInWithEmail({ email, password, rememberMe = true }: SignInCredentials) {
  const result = await authClient.signIn.email({
    email,
    password,
    rememberMe,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to sign in. Please verify your credentials.");
  }

  return result.data;
}

/**
 * Sign up a new user with name, email, and password
 */
export async function signUpWithEmail({ email, password, name }: SignUpCredentials) {
  const result = await authClient.signUp.email({
    email,
    password,
    name,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to create account. Please try again.");
  }

  return result.data;
}

/**
 * Sign out current authenticated user session
 */
export async function signOutUser() {
  const result = await authClient.signOut();
  if (result.error) {
    throw new Error(result.error.message || "Failed to sign out.");
  }
  return true;
}

/**
 * Get active session
 */
export async function getCurrentSession() {
  const result = await authClient.getSession();
  return result.data;
}
