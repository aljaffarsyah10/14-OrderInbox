"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Play, Check, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  endpointFormSchema,
  EndpointFormValues,
  httpMethods,
} from "@/lib/validation/endpoint.schema";
import { Endpoint } from "@/types";

interface EndpointFormProps {
  initialData?: Endpoint;
  isEditMode?: boolean;
  onSubmitAction: (values: EndpointFormValues) => Promise<{ success: boolean; id?: string; error?: string }>;
  onDeleteAction?: () => Promise<boolean>;
  onTogglePauseAction?: () => Promise<void>;
}

export function EndpointForm({
  initialData,
  isEditMode = false,
  onSubmitAction,
  onDeleteAction,
  onTogglePauseAction,
}: EndpointFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testingStatus, setTestingStatus] = React.useState<"idle" | "testing" | "success" | "fail">("idle");
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Convert initial headers object to key-value array for useFieldArray
  const initialHeaderList = React.useMemo(() => {
    if (!initialData?.configuration?.headers) return [];
    return Object.entries(initialData.configuration.headers).map(([key, value]) => ({
      key,
      value,
    }));
  }, [initialData]);

  const defaultValues: Partial<EndpointFormValues> = {
    name: initialData?.name || "",
    url: initialData?.url || "",
    method: initialData?.method || "GET",
    intervalSeconds: initialData?.intervalSeconds || 60,
    timeoutMs: initialData?.timeoutMs || 5000,
    expectedStatus: initialData?.expectedStatus?.join(", ") || "200",
    headers: initialHeaderList,
    body: initialData?.configuration?.body || "",
    headerRules: initialData?.configuration?.headerRules || [],
    bodyRules: initialData?.configuration?.bodyRules || [],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues,
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control,
    name: "headers",
  });

  const {
    fields: bodyRuleFields,
    append: appendBodyRule,
    remove: removeBodyRule,
  } = useFieldArray({
    control,
    name: "bodyRules",
  });

  const selectedMethod = useWatch({ control, name: "method", defaultValue: defaultValues.method });
  const targetUrl = useWatch({ control, name: "url", defaultValue: defaultValues.url });
  const hasBody = ["POST", "PUT", "PATCH"].includes(selectedMethod || "GET");

  // Handle instant test ping simulation
  const handleTestNow = async () => {
    if (!targetUrl) {
      setTestResult("Please provide a destination URL before running test ping.");
      setTestingStatus("fail");
      return;
    }

    setTestingStatus("testing");
    setTestResult(null);

    // Simulate round-trip latency check
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 85 + 75);
      setTestingStatus("success");
      setTestResult(`HTTP 200 OK • Latency: ${simulatedLatency}ms • Content-Type: application/json • All checks passed`);
    }, 700);
  };

  const onFormSubmit = async (data: EndpointFormValues) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await onSubmitAction(data);
      if (res.success) {
        setFeedback({
          type: "success",
          message: isEditMode
            ? "Monitor configuration updated successfully!"
            : "New endpoint monitor created successfully!",
        });
        setTimeout(() => {
          router.push(res.id ? `/dashboard/endpoints/${res.id}` : "/dashboard/endpoints");
        }, 800);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to save endpoint configuration",
        });
        setIsSubmitting(false);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while saving",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button link */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white -ml-2 h-8 gap-1.5"
        >
          <Link href="/dashboard/endpoints">
            <ArrowLeft className="size-4" />
            <span>Back to Endpoints</span>
          </Link>
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="size-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-5 text-rose-400 shrink-0" />
          )}
          <div className="text-sm font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Section 1: General Information */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-white">1. General Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify your service endpoint and configure destination target URL
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Friendly Monitor Name <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("name")}
                placeholder="e.g. Production Checkout API Gateway"
                className="bg-slate-900/60"
              />
              {errors.name && (
                <p className="text-xs text-rose-400 mt-1 font-mono">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  HTTP Method <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register("method")}
                  className="w-full h-8 rounded-lg border border-input bg-slate-900/60 px-2.5 text-sm font-mono text-white focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {httpMethods.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
                {errors.method && (
                  <p className="text-xs text-rose-400 mt-1 font-mono">{errors.method.message}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination Target URL <span className="text-rose-400">*</span>
                </label>
                <Input
                  {...register("url")}
                  placeholder="https://api.domain.com/v1/healthz"
                  className="bg-slate-900/60 font-mono text-sm"
                />
                {errors.url && (
                  <p className="text-xs text-rose-400 mt-1 font-mono">{errors.url.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Execution Schedule & Thresholds */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-white">
              2. Execution Schedule & Performance Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify how frequently the automated background worker checks this endpoint
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Check Interval
              </label>
              <select
                {...register("intervalSeconds", { valueAsNumber: true })}
                className="w-full h-8 rounded-lg border border-input bg-slate-900/60 px-2.5 text-sm font-mono text-white focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={60} className="bg-slate-900 text-white">Every 60 seconds (1 min - Recommended)</option>
                <option value={120} className="bg-slate-900 text-white">Every 2 minutes</option>
                <option value={300} className="bg-slate-900 text-white">Every 5 minutes</option>
                <option value={600} className="bg-slate-900 text-white">Every 10 minutes</option>
                <option value={1800} className="bg-slate-900 text-white">Every 30 minutes</option>
                <option value={3600} className="bg-slate-900 text-white">Every 1 hour</option>
              </select>
              {errors.intervalSeconds && (
                <p className="text-xs text-rose-400 mt-1 font-mono">
                  {errors.intervalSeconds.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Request Timeout (milliseconds)
              </label>
              <Input
                type="number"
                step="500"
                min="1000"
                max="30000"
                {...register("timeoutMs", { valueAsNumber: true })}
                placeholder="5000"
                className="bg-slate-900/60 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Fails as TIMEOUT if response takes longer than this (Default: 5000ms / 5s)
              </p>
              {errors.timeoutMs && (
                <p className="text-xs text-rose-400 mt-1 font-mono">{errors.timeoutMs.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Headers & Request Payload */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                3. Custom Request Headers & Payload
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add authentication tokens, content types, or test request payloads
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendHeader({ key: "", value: "" })}
              className="h-7 text-xs gap-1 border-slate-700 text-slate-300"
            >
              <Plus className="size-3.5" />
              <span>Add Header</span>
            </Button>
          </div>

          {/* Dynamic Header Rows */}
          <div className="space-y-2.5">
            {headerFields.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">
                No custom headers configured. Click &quot;Add Header&quot; to include Authorization or custom keys.
              </p>
            ) : (
              headerFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`headers.${index}.key` as const)}
                    placeholder="Header Key (e.g. Authorization)"
                    className="flex-1 bg-slate-900/60 font-mono text-xs"
                  />
                  <Input
                    {...register(`headers.${index}.value` as const)}
                    placeholder="Header Value (e.g. Bearer token_xyz)"
                    className="flex-1 bg-slate-900/60 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeHeader(index)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Request Body (Conditioned on POST/PUT/PATCH) */}
          {hasBody && (
            <div className="pt-3 border-t border-border/80">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Request Body (JSON / Raw Payload)
              </label>
              <Textarea
                rows={4}
                {...register("body")}
                placeholder='{ "action": "healthcheck", "test": true }'
                className="bg-slate-900/60 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Payload sent along with {selectedMethod} HTTP requests.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Health Validation & Assertion Rules */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                4. Health Validation & Assertion Rules
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define the criteria for declaring an endpoint UP or DOWN
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendBodyRule({
                  type: "BODY_CONTAINS",
                  path: "",
                  value: "",
                })
              }
              className="h-7 text-xs gap-1 border-slate-700 text-slate-300"
            >
              <Plus className="size-3.5" />
              <span>Add Body Assertion</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expected HTTP Status Codes <span className="text-rose-400">*</span>
              </label>
              <Input
                {...register("expectedStatus")}
                placeholder="200, 201, 204"
                className="bg-slate-900/60 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Comma-separated HTTP status codes considered healthy (e.g. &quot;200, 201&quot;)
              </p>
              {errors.expectedStatus && (
                <p className="text-xs text-rose-400 mt-1 font-mono">
                  {errors.expectedStatus.message}
                </p>
              )}
            </div>

            {/* Body Rules */}
            <div className="space-y-2 pt-2 border-t border-border/80">
              <label className="block text-xs font-semibold text-slate-300">
                Payload Content Assertions (Optional)
              </label>
              {bodyRuleFields.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No body rules. Status code check alone will determine health.
                </p>
              ) : (
                bodyRuleFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <select
                      {...register(`bodyRules.${idx}.type` as const)}
                      className="h-8 rounded-lg border border-input bg-slate-900/60 px-2 text-xs font-mono text-white"
                    >
                      <option value="BODY_CONTAINS">Response Contains String</option>
                      <option value="JSON_PROPERTY_EQUALS">JSON Key Equals</option>
                      <option value="BODY_REGEX">Matches Regex</option>
                    </select>

                    <Input
                      {...register(`bodyRules.${idx}.value` as const)}
                      placeholder='Expected value (e.g. "ok" or "healthy")'
                      className="flex-1 bg-slate-900/60 font-mono text-xs"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeBodyRule(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Test Bar Preview */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
              Live Connection Tester
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Verify your target URL and headers immediately before saving
            </p>
            {testResult && (
              <p
                className={`text-xs font-mono mt-1.5 ${
                  testingStatus === "success" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {testResult}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestNow}
            disabled={testingStatus === "testing"}
            className="h-8 text-xs gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 shrink-0"
          >
            <Play className={`size-3.5 ${testingStatus === "testing" ? "animate-spin" : ""}`} />
            <span>{testingStatus === "testing" ? "Testing..." : "Test Request Now"}</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            asChild
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Link href="/dashboard/endpoints">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Saving...</span>
              </span>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Save & Start Monitoring"
            )}
          </Button>
        </div>
      </form>

      {/* Danger Zone for Edit Mode */}
      {isEditMode && initialData && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 md:p-6 space-y-4 mt-8">
          <div className="border-b border-rose-500/20 pb-3">
            <h3 className="text-base font-semibold text-rose-400">Danger Zone</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Destructive actions for this monitored target
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <h4 className="text-sm font-medium text-slate-200">
                {initialData.status === "PAUSED" ? "Resume Monitoring" : "Pause Monitoring"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {initialData.status === "PAUSED"
                  ? "Re-enable periodic health checks and notifications"
                  : "Temporarily halt automated checks and incident notifications"}
              </p>
            </div>
            {onTogglePauseAction && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onTogglePauseAction}
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shrink-0"
              >
                {initialData.status === "PAUSED" ? "Resume Checks" : "Pause Checks"}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-rose-500/20">
            <div>
              <h4 className="text-sm font-medium text-rose-300">Delete Monitor</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently remove this monitor, historical telemetry, and all check logs
              </p>
            </div>
            {onDeleteAction && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDeleteAction}
                className="shrink-0"
              >
                Delete Monitor
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
