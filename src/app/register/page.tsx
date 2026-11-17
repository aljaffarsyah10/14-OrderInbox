"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { signUpWithEmail } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("Alex Mercer");
  const [email, setEmail] = React.useState("alex@engineering.io");
  const [password, setPassword] = React.useState("supersecret123");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signUpWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500/20 selection:text-indigo-400 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[250px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-bold text-xl text-white group mb-3"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-600/30 transition-all shadow-md shadow-indigo-950/40">
              <Radio className="size-5 animate-pulse" />
            </div>
            <span className="tracking-tight text-xl font-bold">OrderInbox</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Start monitoring critical endpoints in under 60 seconds
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 md:p-8 bg-[#111827]/85 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/50">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in duration-150">
              <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#0b1120] border-slate-700/80 text-slate-100 h-10 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono"
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
                className="bg-[#0b1120] border-slate-700/80 text-slate-100 h-10 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[#0b1120] border-slate-700/80 text-slate-100 h-10 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <span className="text-[11px] font-mono text-emerald-400 pl-1 font-semibold">
                  Ready
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Unlimited sub-minute HTTP endpoint checks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Instant downtime alerts via Email & Webhooks</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 mt-3 shadow-lg shadow-indigo-950/40 active:scale-[0.99] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Launch Dashboard</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
