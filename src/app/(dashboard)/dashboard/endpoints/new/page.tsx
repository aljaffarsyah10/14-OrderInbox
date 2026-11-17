"use client";

import * as React from "react";
import { EndpointForm } from "@/components/endpoints/endpoint-form";
import { createEndpoint } from "@/lib/api/endpoints";
import { EndpointFormValues } from "@/lib/validation/endpoint.schema";

export default function CreateEndpointPage() {
  const handleCreate = async (values: EndpointFormValues) => {
    try {
      // Parse expectedStatus string to number array
      const expectedStatusArray = values.expectedStatus
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      // Convert header array to key-value object
      const headerMap: Record<string, string> = {};
      if (values.headers && values.headers.length > 0) {
        for (const h of values.headers) {
          if (h.key.trim()) {
            headerMap[h.key.trim()] = h.value;
          }
        }
      }

      const created = await createEndpoint({
        name: values.name.trim(),
        url: values.url.trim(),
        method: values.method,
        intervalSeconds: values.intervalSeconds,
        timeoutMs: values.timeoutMs,
        expectedStatus: expectedStatusArray,
        headers: Object.keys(headerMap).length > 0 ? headerMap : undefined,
        body: values.body ? values.body : undefined,
        headerRules: values.headerRules && values.headerRules.length > 0 ? values.headerRules : undefined,
        bodyRules: values.bodyRules && values.bodyRules.length > 0 ? values.bodyRules : undefined,
      });

      return { success: true, id: created.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create monitor";
      return { success: false, error: message };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create New Monitor
          </h1>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Live Queue Dispatch
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Configure HTTP endpoint targets, intervals, custom secret headers, and health rules
        </p>
      </div>

      <EndpointForm isEditMode={false} onSubmitAction={handleCreate} />
    </div>
  );
}
