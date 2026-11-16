"use client";

import * as React from "react";
import { EndpointForm } from "@/components/endpoints/endpoint-form";
import { endpointMockService } from "@/features/endpoints/mocks/endpoint-mock-service";
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

      const created = await endpointMockService.create({
        name: values.name,
        url: values.url,
        method: values.method,
        intervalSeconds: values.intervalSeconds,
        timeoutMs: values.timeoutMs,
        expectedStatus: expectedStatusArray,
        headers: headerMap,
        body: values.body,
        bodyRules: values.bodyRules,
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
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            Form Validation
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
