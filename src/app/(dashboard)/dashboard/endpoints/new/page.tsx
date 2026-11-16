"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Clock,
  Shield,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderField {
  id: string;
  key: string;
  value: string;
}

export default function CreateEndpointPage() {
  const router = useRouter();

  const [method, setMethod] = React.useState("GET");
  const [headers, setHeaders] = React.useState<HeaderField[]>([
    { id: "1", key: "User-Agent", value: "OrderInbox-Telemetry/1.0" },
  ]);

  const addHeader = () => {
    setHeaders((prev) => [
      ...prev,
      { id: Date.now().toString(), key: "", value: "" },
    ]);
  };

  const removeHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  const updateHeader = (
    id: string,
    field: "key" | "value",
    val: string
  ) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static mockup navigation without backend logic
    router.push("/dashboard/endpoints");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon-xs"
          className="border-border text-slate-400 hover:text-white"
        >
          <Link href="/dashboard/endpoints">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create New Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure HTTP endpoint target, check frequency, and assertion validation rules
          </p>
        </div>
      </div>

      <form onSubmit={handleMockSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/70">
            <Code2 className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              1. General Information
            </h2>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-medium text-slate-300 uppercase tracking-wider"
            >
              Friendly Monitor Name *
            </label>
            <Input
              id="name"
              placeholder="e.g. Checkout API Gateway"
              defaultValue="Checkout API Gateway"
              required
              className="bg-[#0b1120] border-slate-700 text-slate-100 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              HTTP Method &amp; Destination Target URL *
            </label>
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <Select value={method} onValueChange={(val) => setMethod(val ?? "GET")}>
                  <SelectTrigger className="w-full bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-slate-700 text-slate-200">
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="url"
                placeholder="https://api.yourdomain.com/v1/endpoint"
                defaultValue="https://api.mystore.com/v1/checkout"
                required
                className="flex-1 bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Execution Schedule & Performance */}
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/70">
            <Clock className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              2. Execution Schedule &amp; Timeout
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Check Interval
              </label>
              <Select defaultValue="60">
                <SelectTrigger className="w-full bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-slate-700 text-slate-200">
                  <SelectItem value="60">60 seconds (1 minute)</SelectItem>
                  <SelectItem value="120">120 seconds (2 minutes)</SelectItem>
                  <SelectItem value="300">300 seconds (5 minutes)</SelectItem>
                  <SelectItem value="600">600 seconds (10 minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="timeout"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Request Timeout (ms)
              </label>
              <Input
                id="timeout"
                type="number"
                placeholder="10000"
                defaultValue="10000"
                min="1000"
                max="30000"
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Headers & Payload */}
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                3. Headers &amp; Request Body (Optional)
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={addHeader}
              className="border-slate-700 text-xs text-indigo-400 hover:text-white"
            >
              <Plus className="size-3 mr-1" />
              Add Header
            </Button>
          </div>

          <div className="space-y-2">
            {headers.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <Input
                  placeholder="Header Name (e.g. Authorization)"
                  value={h.key}
                  onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                  className="bg-[#0b1120] border-slate-700 text-slate-100 h-9 font-mono text-xs flex-1"
                />
                <Input
                  placeholder="Header Value"
                  value={h.value}
                  onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                  className="bg-[#0b1120] border-slate-700 text-slate-100 h-9 font-mono text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeHeader(h.id)}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {method !== "GET" && method !== "HEAD" && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                JSON Request Body Payload
              </label>
              <textarea
                rows={4}
                defaultValue={`{\n  "check_mode": "ping",\n  "test_item_id": 991\n}`}
                className="w-full rounded-lg bg-[#0b1120] border border-slate-700 p-3 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </Card>

        {/* Section 4: Health Validation & Assertion Rules */}
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/70">
            <Shield className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              4. Health Validation &amp; Assertion Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="expectedStatuses"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Expected HTTP Status Codes
              </label>
              <Input
                id="expectedStatuses"
                placeholder="200, 201"
                defaultValue="200, 201"
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Comma-separated HTTP status codes considered healthy
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bodyAssertion"
                className="text-xs font-medium text-slate-300 uppercase tracking-wider"
              >
                Response Body Assertion (Optional)
              </label>
              <Input
                id="bodyAssertion"
                placeholder='e.g. "status":"ok"'
                defaultValue='"status": "ok"'
                className="bg-[#0b1120] border-slate-700 text-slate-100 h-10 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Substring pattern that must exist in response body
              </p>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            <Link href="/dashboard/endpoints">Cancel</Link>
          </Button>

          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-1.5"
          >
            <Save className="size-4" />
            <span>Save Monitor</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
