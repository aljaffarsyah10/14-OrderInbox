"use client";

import * as React from "react";
import {
  Bell,
  Mail,
  Webhook,
  Shield,
  Save,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"alerts" | "profile" | "security">("alerts");
  const [emails, setEmails] = React.useState([
    { id: "1", email: "alex@engineering.io", isDefault: true, verified: true },
    { id: "2", email: "ops-pager@engineering.io", isDefault: false, verified: true },
  ]);

  const addEmail = () => {
    const newEmail = prompt("Enter additional alert recipient email:");
    if (newEmail) {
      setEmails((prev) => [
        ...prev,
        { id: Date.now().toString(), email: newEmail, isDefault: false, verified: false },
      ]);
    }
  };

  const removeEmail = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings &amp; Integrations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage workspace settings, notification channels, and global alert dispatch rules
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "alerts"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Alert Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          General Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Security &amp; API Keys
        </button>
      </div>

      {/* Tab: Alert Channels */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Email Notification Channels */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-indigo-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Email Alert Recipients
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={addEmail}
                className="border-slate-700 text-xs text-indigo-400 hover:text-white"
              >
                <Plus className="size-3 mr-1" />
                Add Recipient
              </Button>
            </div>

            <div className="space-y-2">
              {emails.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b1120] border border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-slate-200">
                      {e.email}
                    </span>
                    {e.verified && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                    {e.isDefault && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Default
                      </span>
                    )}
                  </div>
                  {!e.isDefault && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeEmail(e.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Webhook Alert Dispatch */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Webhook className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Webhook Alert Dispatch (Slack / Discord / PagerDuty)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Send an instant JSON alert payload to external channels when an incident is opened or resolved.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="webhookUrl"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Webhook Target URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  placeholder="https://hooks.slack.com/services/..."
                  defaultValue="https://hooks.slack.com/services/T00/B00/X00"
                  className="bg-[#0b1120] border-slate-700 text-slate-100 font-mono text-xs h-10 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:text-white h-10 gap-1.5 text-xs"
                  onClick={() => alert("Mock webhook ping dispatched!")}
                >
                  <Send className="size-3.5" />
                  <span>Test Ping</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Threshold Rules */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Bell className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Notification Threshold Rules
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">
                  Alert immediately on the very first detected failure
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">
                  Wait for 2 consecutive failed checks before escalating incident
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">
                  Send automatic recovery notification when endpoint returns to UP
                </span>
              </label>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => alert("Settings saved successfully (visual mock).")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5"
            >
              <Save className="size-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tab: General Profile */}
      {activeTab === "profile" && (
        <Card className="p-6 bg-card border border-border space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Account Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                defaultValue="Alex Mercer"
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                defaultValue="alex@engineering.io"
                disabled
                className="bg-[#0b1120] border-slate-700 text-slate-400 h-10 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/70">
            <Shield className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              API Keys &amp; Workspace Security
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage personal access tokens and service accounts for programmatic access.
          </p>
          <div className="p-3 rounded-lg bg-[#0b1120] border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-200">
                live_key_99fa8d21...b84
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Created on Nov 14, 2026 &bull; Full Access
              </span>
            </div>
            <Button
              variant="outline"
              size="xs"
              className="border-slate-700 text-xs text-slate-300"
            >
              Revoke
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
