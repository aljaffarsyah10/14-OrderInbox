import Link from "next/link";
import { IncidentAlert } from "@/types";
import { AlertCircle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncidentFeedProps {
  incidents: IncidentAlert[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  const activeDownIncidents = incidents.filter((i) => i.type === "DOWN");

  return (
    <div className="space-y-3">
      {/* Dynamic Status Banner */}
      {activeDownIncidents.length > 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="size-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-200">
                {activeDownIncidents.length} Active Incident Detected
              </h4>
              <p className="text-xs text-rose-400/90 mt-0.5">
                Target endpoint failure: {activeDownIncidents[0].endpointName} is failing health assertions.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-rose-500/40 text-rose-200 hover:bg-rose-500/20 self-start sm:self-auto h-8 text-xs font-medium"
          >
            <Link href={`/dashboard/endpoints/${activeDownIncidents[0].endpointId}`}>
              Inspect Incident
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                All monitored endpoints are operating normally
              </h4>
              <p className="text-xs text-emerald-400/80">
                No failed assertions, HTTP timeouts, or DNS anomalies detected in the past 24 hours.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-mono text-emerald-400">
            Global SLA: 99.98%
          </div>
        </div>
      )}

      {/* Incident Log Feed */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border/80 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent System Incident Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated detection & recovery telemetry</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Past 24 Hours</span>
        </div>

        <div className="space-y-2.5">
          {incidents.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No recent incidents recorded.</p>
          ) : (
            incidents.map((incident) => {
              const isDown = incident.type === "DOWN";
              return (
                <div
                  key={incident.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-2.5 rounded-full mt-1.5 shrink-0 ${
                        isDown ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/endpoints/${incident.endpointId}`}
                          className="text-xs font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                        >
                          {incident.endpointName}
                        </Link>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            isDown
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {incident.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {incident.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ml-5 sm:ml-0">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(incident.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-xs"
                      className="text-slate-400 hover:text-white"
                    >
                      <Link href={`/dashboard/endpoints/${incident.endpointId}`}>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
