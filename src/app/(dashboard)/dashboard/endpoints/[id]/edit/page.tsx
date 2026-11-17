"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { EndpointForm } from "@/components/endpoints/endpoint-form";
import { getEndpoint, updateEndpoint, deleteEndpoint, togglePauseEndpoint } from "@/lib/api/endpoints";
import { Endpoint } from "@/types";
import { EndpointFormValues } from "@/lib/validation/endpoint.schema";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditEndpointPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [endpoint, setEndpoint] = React.useState<Endpoint | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshEndpoint = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getEndpoint(id);
      setEndpoint(data);
    } catch (err) {
      console.error("[EditEndpointPage] Fetch error:", err);
      setEndpoint(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    let ignore = false;

    async function loadInitial() {
      try {
        const data = await getEndpoint(id);
        if (!ignore) {
          setEndpoint(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("[EditEndpointPage] Initial load error:", err);
          setEndpoint(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdate = async (values: EndpointFormValues) => {
    try {
      const expectedStatusArray = values.expectedStatus
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      const headerMap: Record<string, string> = {};
      if (values.headers && values.headers.length > 0) {
        for (const h of values.headers) {
          if (h.key.trim()) {
            headerMap[h.key.trim()] = h.value;
          }
        }
      }

      const updated = await updateEndpoint(id, {
        name: values.name.trim(),
        url: values.url.trim(),
        method: values.method,
        intervalSeconds: values.intervalSeconds,
        timeoutMs: values.timeoutMs,
        expectedStatus: expectedStatusArray,
        headers: headerMap,
        body: values.body ? values.body : undefined,
        headerRules: values.headerRules,
        bodyRules: values.bodyRules,
      });

      if (!updated) {
        return { success: false, error: "Monitor not found or failed to update" };
      }

      return { success: true, id: updated.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update monitor";
      return { success: false, error: msg };
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this monitor and all history?")) {
      try {
        await deleteEndpoint(id);
        router.push("/dashboard/endpoints");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete monitor";
        alert(msg);
        return false;
      }
    }
    return false;
  };

  const handleTogglePause = async () => {
    try {
      await togglePauseEndpoint(id);
      await refreshEndpoint();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle pause status";
      alert(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="py-12">
        <EmptyState
          title="Monitor Not Found"
          description={`The requested monitor with ID "${id}" could not be located.`}
          action={
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/dashboard/endpoints">Return to Endpoints</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Edit Monitor: {endpoint.name}
          </h1>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            Live Configuration
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Modify monitoring intervals, custom request headers, timeouts, and assertion rules
        </p>
      </div>

      <EndpointForm
        initialData={endpoint}
        isEditMode={true}
        onSubmitAction={handleUpdate}
        onDeleteAction={handleDelete}
        onTogglePauseAction={handleTogglePause}
      />
    </div>
  );
}
