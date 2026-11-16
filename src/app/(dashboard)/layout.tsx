import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | OrderInbox",
    template: "%s | OrderInbox",
  },
  description: "Real-time API uptime telemetry, latency charts, and incident alerts.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
