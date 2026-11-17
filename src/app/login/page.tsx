"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { signInWithEmail } from "@/lib/api/auth";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("alex@engineering.io");
  const [password, setPassword] = React.useState("password123");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmail({
        email: email.trim(),
        password,
        rememberMe,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500/20 selection:text-indigo-400">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-xl text-white group mb-3"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
              <Radio className="size-5 animate-pulse" />
            </div>
            <span>OrderInbox</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your credentials to access your monitors
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 md:p-8 bg-[#111827] border border-border/80 shadow-2xl">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="alex@engineering.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset is managed through your workspace administrator.");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-xs text-slate-400 select-none">
                Remember this device for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 mt-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In with Email
                  <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111827] px-2 text-slate-400 font-mono">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              // Inform user about social login status
              alert("GitHub OAuth is configured via workspace environment variables.");
            }}
            className="w-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 h-10 font-medium gap-2"
          >
            <GithubIcon className="size-4" />
            <span>Continue with GitHub</span>
          </Button>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
