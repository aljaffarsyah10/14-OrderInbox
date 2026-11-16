import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Radio,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MethodBadge } from "@/components/endpoints/method-badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-[#0b1120]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Radio className="size-4 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              OrderInbox
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                PRO
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Preview
            </a>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6 font-mono">
              <span className="flex size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sub-minute HTTP &amp; REST Monitoring
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Zero-Latency API Monitoring for Modern Engineering Teams
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Monitor HTTP/REST endpoints with custom headers, JSON assertions, and
              automated incident alerts. Get alerted before your customers notice.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-600/25"
              >
                <Link href="/register">
                  Start Monitoring Free
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-border/80 text-slate-300 hover:text-white hover:bg-slate-800/80 h-12 px-6"
              >
                <Link href="/dashboard">View Live Demo</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required &bull; 60-second setup &bull; Free tier included
            </p>

            {/* Terminal / Live Preview Container */}
            <div id="demo" className="mt-14 text-left">
              <div className="rounded-xl border border-slate-700/80 bg-[#111827] shadow-2xl overflow-hidden">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0f172a]">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500/80" />
                    <span className="size-3 rounded-full bg-amber-500/80" />
                    <span className="size-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      orderinbox-monitor ~ live-stream
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    99.99% Global Uptime
                  </div>
                </div>

                {/* Window body */}
                <div className="p-5 font-mono text-xs md:text-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0b1120] border border-slate-800">
                    <div className="flex items-center gap-3">
                      <MethodBadge method="POST" />
                      <span className="text-slate-200 font-medium">
                        https://api.orderinbox.dev/v1/orders
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> 200 OK
                      </span>
                      <span className="text-slate-400">112ms</span>
                      <span className="text-indigo-400">Assertion OK</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0b1120] border border-slate-800">
                    <div className="flex items-center gap-3">
                      <MethodBadge method="GET" />
                      <span className="text-slate-200 font-medium">
                        https://api.orderinbox.dev/health
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> 200 OK
                      </span>
                      <span className="text-slate-400">48ms</span>
                      <span className="text-indigo-400">SSL Valid (82d)</span>
                    </div>
                  </div>

                  {/* Latency Visualization Preview Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Recent 60 Checks (past 1 hour)</span>
                      <span className="text-emerald-400">100% Success Rate</span>
                    </div>
                    <div className="grid grid-cols-30 md:grid-cols-60 gap-1 h-6">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-full h-full rounded-xs bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
                          title={`Check #${i + 1}: 200 OK (Latency: ${Math.floor(
                            45 + (i % 7) * 8
                          )}ms)`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Section */}
        <section id="features" className="py-20 border-t border-border/60 bg-[#0d1424]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Engineered for High-Reliability Systems
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Everything you need to monitor, triage, and maintain SLA compliance
                for mission-critical endpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-xl border border-border/80 bg-card hover:border-slate-700 transition-colors">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <Clock className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sub-Minute Checks
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Run automated HTTP checks down to 60-second intervals with custom
                  timeout controls and configurable retry policies.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-xl border border-border/80 bg-card hover:border-slate-700 transition-colors">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <Shield className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Payload &amp; Status Assertions
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Verify expected HTTP status codes, check for required JSON response keys,
                  and attach custom secret headers with full encryption.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-xl border border-border/80 bg-card hover:border-slate-700 transition-colors">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <Zap className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Instant Incident Alerts
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Deliver downtime notifications directly via Email and Webhooks (Slack,
                  Discord, PagerDuty) the moment an endpoint degrades.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-[#090d16] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">OrderInbox</span>
            <span>&bull; Built for developers by developers. &copy; 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Create Account
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
