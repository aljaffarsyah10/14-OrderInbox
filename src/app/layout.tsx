import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "OrderInbox — Developer-grade API Monitoring & Uptime Alerts",
    template: "%s | OrderInbox",
  },
  description:
    "Zero-latency HTTP/REST API uptime monitoring, payload assertions, and incident alerts for engineering teams.",
  keywords: [
    "API monitoring",
    "uptime monitor",
    "synthetic monitoring",
    "REST API test",
    "health check",
    "latency telemetry",
    "incident alert",
    "devops",
  ],
  authors: [{ name: "OrderInbox Engineering Team" }],
  creator: "OrderInbox",
  openGraph: {
    title: "OrderInbox — Developer-grade API Monitoring & Uptime Alerts",
    description:
      "Zero-latency HTTP/REST API uptime monitoring, payload assertions, and incident alerts for modern engineering teams.",
    url: "/",
    siteName: "OrderInbox",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrderInbox — Developer-grade API Monitoring & Uptime Alerts",
    description:
      "Zero-latency HTTP/REST API uptime monitoring, payload assertions, and incident alerts for modern engineering teams.",
    creator: "@orderinbox",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
