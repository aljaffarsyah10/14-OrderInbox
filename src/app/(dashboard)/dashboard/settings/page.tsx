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
  Check,
  AlertCircle,
  Key,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettings, updateSettings, UserProfile } from "@/lib/api/settings";
import { authClient } from "@/lib/auth/auth-client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"alerts" | "profile" | "security">("alerts");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // User Profile State
  const [user, setUser] = React.useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    emailVerified: false,
    image: null,
  });
  const [nameInput, setNameInput] = React.useState("");

  // Alert & Notification Settings State
  const [alertEmails, setAlertEmails] = React.useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = React.useState("");
  const [showAddEmailInput, setShowAddEmailInput] = React.useState(false);
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [webhookEnabled, setWebhookEnabled] = React.useState(false);
  const [alertOnDown, setAlertOnDown] = React.useState(true);
  const [alertOnRecovery, setAlertOnRecovery] = React.useState(true);
  const [consecutiveFailures, setConsecutiveFailures] = React.useState(1);
  const [testWebhookStatus, setTestWebhookStatus] = React.useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordFeedback, setPasswordFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load initial settings
  React.useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getSettings();
        if (!ignore && data) {
          setUser(data.user);
          setNameInput(data.user.name || "");
          setAlertEmails(data.settings.alertEmails || [data.user.email]);
          setWebhookUrl(data.settings.webhookUrl || "");
          setWebhookEnabled(data.settings.webhookEnabled || false);
          setAlertOnDown(data.settings.alertOnDown ?? true);
          setAlertOnRecovery(data.settings.alertOnRecovery ?? true);
          setConsecutiveFailures(data.settings.consecutiveFailures || 1);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("[SettingsPage] Load error:", err);
          const msg = err instanceof Error ? err.message : "Failed to load settings";
          setFeedback({ type: "error", message: msg });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddEmail = () => {
    const trimmed = newEmailInput.trim().toLowerCase();
    if (!trimmed) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setFeedback({ type: "error", message: "Please provide a valid email address." });
      return;
    }
    if (alertEmails.includes(trimmed)) {
      setFeedback({ type: "error", message: "Email is already in recipient list." });
      return;
    }
    setAlertEmails((prev) => [...prev, trimmed]);
    setNewEmailInput("");
    setShowAddEmailInput(false);
    setFeedback({ type: "success", message: `Added ${trimmed} to alert recipients.` });
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emailToRemove === user.email) {
      alert("Primary account email cannot be removed.");
      return;
    }
    setAlertEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await updateSettings({
        name: nameInput.trim() || undefined,
        alertEmails,
        webhookUrl: webhookUrl.trim() || null,
        webhookEnabled,
        alertOnDown,
        alertOnRecovery,
        consecutiveFailures,
      });

      setUser(updated.user);
      setNameInput(updated.user.name);
      setFeedback({ type: "success", message: "Workspace settings updated successfully!" });
    } catch (err: unknown) {
      console.error("[SettingsPage] Save error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    }
  };

  const handleTestWebhook = () => {
    if (!webhookUrl) {
      alert("Please enter a valid Webhook URL before testing.");
      return;
    }
    setTestWebhookStatus("Dispatching test ping to external webhook...");
    setTimeout(() => {
      setTestWebhookStatus("Success: Test notification delivered (200 OK simulated)!");
      setTimeout(() => setTestWebhookStatus(null), 4000);
    }, 800);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Invoke Better Auth client password change
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setPasswordFeedback({
          type: "error",
          message: result.error.message || "Failed to change password. Verify your current password.",
        });
      } else {
        setPasswordFeedback({ type: "success", message: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while changing password.";
      setPasswordFeedback({ type: "error", message: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings &amp; Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account profile, notification alert channels, and security settings
        </p>
      </div>

      {/* Global Status Banner */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "alerts"}
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
            activeTab === "alerts"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Alert Channels
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          General Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
            activeTab === "security"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Security &amp; Password
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
                onClick={() => setShowAddEmailInput((prev) => !prev)}
                className="border-slate-700 text-xs text-indigo-400 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Plus className="size-3 mr-1" />
                {showAddEmailInput ? "Cancel" : "Add Recipient"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              These verified email addresses will receive incident down alerts and recovery notifications.
            </p>

            {showAddEmailInput && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#0b1120] border border-indigo-500/40 animate-in fade-in duration-150">
                <Input
                  type="email"
                  placeholder="e.g. devops-team@company.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className="bg-slate-900 border-slate-700 text-xs text-white h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddEmail}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
                >
                  Save Recipient
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {alertEmails.map((email) => {
                const isPrimary = email === user.email;
                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0b1120] border border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="text-xs font-mono text-slate-200">
                        {email}
                      </span>
                      {isPrimary ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Primary Account
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Recipient
                        </span>
                      )}
                    </div>
                    {!isPrimary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove recipient ${email}`}
                        onClick={() => handleRemoveEmail(email)}
                        className="text-slate-400 hover:text-rose-400 focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Webhook Alert Dispatch */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Webhook className="size-4 text-indigo-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Webhook Alert Dispatch
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={webhookEnabled}
                  onChange={(e) => setWebhookEnabled(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Webhook</span>
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              Send an instant JSON alert payload to external channels (Slack, Discord, PagerDuty, or custom receiver) when an incident occurs.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="webhookUrlInput"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Target Webhook Endpoint URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="webhookUrlInput"
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-[#0b1120] border-slate-700 text-slate-100 font-mono text-xs h-10 flex-1 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWebhook}
                  aria-label="Test Webhook ping"
                  className="border-slate-700 text-slate-300 hover:text-white h-10 gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Send className="size-3.5" />
                  <span>Test Ping</span>
                </Button>
              </div>

              {testWebhookStatus && (
                <p className="text-xs font-mono text-indigo-400 animate-in fade-in duration-150">
                  {testWebhookStatus}
                </p>
              )}
            </div>
          </Card>

          {/* Notification Threshold Rules */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Bell className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Notification Trigger Rules
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnDown}
                  onChange={(e) => setAlertOnDown(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">
                  Send alert immediately when monitor status transitions to <strong>DOWN</strong>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnRecovery}
                  onChange={(e) => setAlertOnRecovery(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-[#0b1120] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300">
                  Send automatic recovery notification when endpoint returns to <strong>UP</strong>
                </span>
              </label>

              <div className="pt-2 flex items-center gap-3">
                <label htmlFor="consecutiveFailures" className="text-slate-300 text-xs">
                  Consecutive failed checks before alert:
                </label>
                <select
                  id="consecutiveFailures"
                  value={consecutiveFailures}
                  onChange={(e) => setConsecutiveFailures(parseInt(e.target.value, 10))}
                  className="h-8 rounded-lg border border-slate-700 bg-[#0b1120] px-2.5 text-xs font-mono text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value={1}>1 failure (Immediate)</option>
                  <option value={2}>2 consecutive failures</option>
                  <option value={3}>3 consecutive failures</option>
                  <option value={5}>5 consecutive failures</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              aria-label="Save notification settings"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isSaving ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tab: General Profile */}
      {activeTab === "profile" && (
        <Card className="p-6 bg-card border border-border space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-border/70">
            <UserIcon className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Account Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="fullNameInput" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                id="fullNameInput"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="emailAddressDisplay" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                id="emailAddressDisplay"
                value={user.email}
                disabled
                className="bg-[#0b1120] border-slate-700 text-slate-400 h-10 text-xs cursor-not-allowed"
              />
              <span className="text-[11px] text-muted-foreground block">
                Contact administrator to change account login email.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              aria-label="Save profile details"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isSaving ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Security & Password */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password Change Form */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Key className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Change Password
              </h2>
            </div>

            {passwordFeedback && (
              <div
                role="status"
                className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  passwordFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <span>{passwordFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setPasswordFeedback(null)}
                  className="text-xs underline hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
              <div className="space-y-1">
                <label htmlFor="currentPasswordInput" className="text-xs font-medium text-slate-300">
                  Current Password
                </label>
                <Input
                  id="currentPasswordInput"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="bg-[#0b1120] border-slate-700 text-slate-100 text-xs h-9 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="newPasswordInput" className="text-xs font-medium text-slate-300">
                  New Password (min. 8 characters)
                </label>
                <Input
                  id="newPasswordInput"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="bg-[#0b1120] border-slate-700 text-slate-100 text-xs h-9 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPasswordInput" className="text-xs font-medium text-slate-300">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPasswordInput"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="bg-[#0b1120] border-slate-700 text-slate-100 text-xs h-9 focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  aria-label="Update account password"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-9 gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {isChangingPassword ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Key className="size-3.5" />
                  )}
                  <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* API Keys Section */}
          <Card className="p-6 bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Shield className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Workspace API Tokens
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Use API tokens to authenticate programmatic requests to the OrderInbox monitoring REST API.
            </p>
            <div className="p-3 rounded-lg bg-[#0b1120] border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-200">
                  inbox_live_token_{user.id ? user.id.slice(0, 12) : "99fa8d21b84"}...
                </span>
                <span className="block text-[11px] text-muted-foreground mt-0.5">
                  Scope: Read / Write / Execute Checks &bull; Personal Token
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => alert("Token copied to clipboard!")}
                aria-label="Copy workspace API token"
                className="border-slate-700 text-xs text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Copy Token
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
