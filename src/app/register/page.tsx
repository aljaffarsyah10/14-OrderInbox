"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static mockup navigation without backend auth logic
    router.push("/dashboard");
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
            Create your account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Start monitoring critical endpoints in under 60 seconds
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 md:p-8 bg-[#111827] border border-border/80 shadow-2xl">
          <form onSubmit={handleMockSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Mercer"
                defaultValue="Alex Mercer"
                required
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 focus-visible:ring-indigo-500"
              />
            </div>

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
                defaultValue="alex@engineering.io"
                required
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                defaultValue="supersecret123"
                required
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 focus-visible:ring-indigo-500"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-slate-700" />
                <span className="text-[11px] font-mono text-emerald-400 pl-1">
                  Strong
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>Unlimited sub-minute HTTP endpoint checks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>Instant downtime alerts via Email & Webhooks</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 mt-3 shadow-sm"
            >
              Create Account & Launch Dashboard
              <ArrowRight className="size-4 ml-1.5" />
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
