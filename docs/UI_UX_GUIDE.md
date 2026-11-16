# OrderInbox — UI/UX Specification & Design System Guide

> **Document Version:** 1.0.0  
> **Status:** Approved Architecture Standard  
> **Target Release:** Phase 3 Deliverable (Foundation for Phase 4 & Phase 5)  
> **Design Philosophy:** Premium Developer SaaS, Dark-Mode First, High Information Density with Clean Hierarchy  

---

## 1. Executive Summary & Design Principles

OrderInbox adalah platform monitoring uptime dan keandalan API yang dirancang untuk developer, DevOps engineer, dan tech lead. Antarmuka OrderInbox harus menyampaikan kesan **presisi, kecepatan, dan ketenangan** (calm & confident). Setiap milidetik keterlambatan atau kegagalan API harus dapat diidentifikasi dalam hitungan detik tanpa gangguan visual.

### 1.1 Core Design Principles

1. **Information Density without Cognitive Clutter**
   Developer menyukai data padat (status code, latency ms, timestamps, error payloads), namun hierarki visual harus membimbing mata secara alami dari level makro (Health Score sistem) ke level mikro (stack trace / JSON error response).

2. **Instant Status Recognition (3-Second Rule)**
   Pengguna harus dapat memahami status kesehatan endpoint dalam 3 detik pertama setelah membuka halaman dashboard melalui sinyal warna, pulse dot, dan uptime sparkline.

3. **Developer Ergonomics & Keyboard First**
   Semua alur kerja kritis (pencarian endpoint, navigasi menu, konfirmasi manual check) mendukung navigasi keyboard, shortcut standar, dan copy-paste ramah developer (misal tombol 1-klik untuk copy curl, copy URL, atau copy token).

4. **Honest & Functional Aesthetics**
   Tidak ada animasi dekoratif yang memperlambat alur kerja. Micro-interaction (hover, modal transition, loading shimmer) dirancang halus (150ms–200ms) menggunakan kurva `ease-out`.

---

## 2. Visual Direction & Theme

### 2.1 Aesthetic Archetype: Premium Developer SaaS
Inspirasi visual menggabungkan ketajaman tipografi **Linear**, kesederhanaan monokromatik **Vercel**, dan presisi metrik **Datadog / Better Stack**:
- **Dark-Mode First**: Latar belakang bernuansa deep obsidian slate (`#0b1120`), bukan pitch black murni (`#000000`), untuk mempertahankan kontras lembut dan mengurangi kelelahan mata.
- **Surface Elevation via Subtle Borders**: Menggunakan border semitransparan (`rgba(255, 255, 255, 0.08)` hingga `0.12`) alih-alih bayangan gelap yang berat, menciptakan batas kartu yang tegas dan modern.
- **Accents of Vibrant Indigo & Emerald**: Aksen warna fungsional: Indigo (`#6366f1`) untuk aksi primer / interaktif, Emerald (`#10b981`) untuk status sehat (UP), Crimson Red (`#ef4444`) untuk insiden (DOWN), dan Amber (`#f59e0b`) untuk peringatan / status PAUSED.

---

## 3. Color Palette & Design Tokens

### 3.1 Primitive Color Palette

| Token Name | HEX Value | OKLCH Equivalent | Semantic Purpose |
|------------|-----------|------------------|------------------|
| `--bg-canvas` | `#0b1120` | `oklch(0.14 0.03 260)` | Main body background (deep slate) |
| `--surface-card` | `#111827` | `oklch(0.18 0.03 260)` | Primary container cards, sidebar |
| `--surface-elevated` | `#1e293b` | `oklch(0.24 0.03 260)` | Hover states, modals, popovers, dropdowns |
| `--surface-subtle` | `#0f172a` | `oklch(0.16 0.03 260)` | Table alternating rows, code block containers |
| `--border-subtle` | `#1e293b` | `oklch(0.24 0.03 260)` | Inner dividers, passive container outlines |
| `--border-default` | `#334155` | `oklch(0.32 0.03 260)` | Standard component borders (inputs, cards) |
| `--border-focus` | `#6366f1` | `oklch(0.58 0.23 277)` | Interactive focus rings, active tab borders |
| `--primary-indigo` | `#6366f1` | `oklch(0.58 0.23 277)` | Brand accent, primary buttons, active links |
| `--primary-hover` | `#4f46e5` | `oklch(0.51 0.23 277)` | Hover state for primary buttons |
| `--status-up` | `#10b981` | `oklch(0.69 0.17 162)` | Healthy API endpoint, 2xx HTTP, 100% uptime |
| `--status-up-subtle` | `rgba(16, 185, 129, 0.12)` | - | Pill background for UP badge |
| `--status-down` | `#ef4444` | `oklch(0.63 0.24 29)` | Incident, 5xx/4xx error, timeout, DNS failure |
| `--status-down-subtle`| `rgba(239, 68, 68, 0.12)` | - | Pill background for DOWN badge |
| `--status-warn` | `#f59e0b` | `oklch(0.75 0.18 75)` | High latency (>1500ms), paused check, SSL expiring |
| `--status-warn-subtle`| `rgba(245, 158, 11, 0.12)` | - | Pill background for PAUSED/WARNING badge |
| `--text-primary` | `#f8fafc` | `oklch(0.98 0.01 260)` | Main headings, table text, primary values |
| `--text-secondary` | `#94a3b8` | `oklch(0.70 0.03 260)` | Supporting descriptions, timestamps, labels |
| `--text-muted` | `#64748b` | `oklch(0.55 0.04 260)` | Placeholders, disabled text, table footers |

### 3.2 Shadcn/ui & Tailwind CSS Mapping

Konfigurasi token dipetakan langsung ke struktur CSS variables shadcn/ui untuk memastikan kompatibilitas penuh dengan komponen `@/components/ui/*`:

```css
/* src/app/globals.css Dark Mode Mapping */
.dark {
  --background: oklch(0.14 0.03 260);          /* #0b1120 */
  --foreground: oklch(0.98 0.01 260);          /* #f8fafc */
  --card: oklch(0.18 0.03 260);                /* #111827 */
  --card-foreground: oklch(0.98 0.01 260);     /* #f8fafc */
  --popover: oklch(0.24 0.03 260);             /* #1e293b */
  --popover-foreground: oklch(0.98 0.01 260);  /* #f8fafc */
  --primary: oklch(0.58 0.23 277);             /* #6366f1 */
  --primary-foreground: oklch(0.98 0.01 260);  /* #ffffff */
  --secondary: oklch(0.24 0.03 260);           /* #1e293b */
  --secondary-foreground: oklch(0.98 0.01 260);/* #f8fafc */
  --muted: oklch(0.20 0.03 260);               /* #172033 */
  --muted-foreground: oklch(0.70 0.03 260);    /* #94a3b8 */
  --accent: oklch(0.24 0.03 260);              /* #1e293b */
  --accent-foreground: oklch(0.98 0.01 260);   /* #f8fafc */
  --destructive: oklch(0.63 0.24 29);          /* #ef4444 */
  --destructive-foreground: oklch(0.98 0.01 260);
  --border: oklch(0.32 0.03 260);              /* #334155 */
  --input: oklch(0.32 0.03 260);               /* #334155 */
  --ring: oklch(0.58 0.23 277);                /* #6366f1 */
  --radius: 0.5rem;                            /* 8px base border radius */
  
  /* Sidebar Specific Tokens */
  --sidebar: oklch(0.16 0.03 260);             /* #0f172a */
  --sidebar-foreground: oklch(0.98 0.01 260);
  --sidebar-primary: oklch(0.58 0.23 277);
  --sidebar-primary-foreground: oklch(0.98 0.01 260);
  --sidebar-accent: oklch(0.24 0.03 260);
  --sidebar-accent-foreground: oklch(0.98 0.01 260);
  --sidebar-border: oklch(0.24 0.03 260);
  --sidebar-ring: oklch(0.58 0.23 277);
}
```

---

## 4. Typography System

### 4.1 Typeface Families
- **Primary Sans / Headings / UI Body:** `Geist Sans` (fallback: `Inter`, system `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
- **Code / Monospace / Numeric Metrics:** `Geist Mono` (fallback: `JetBrains Mono`, `Consolas`, monospace)
- *Catatan teknis:* Seluruh nilai angka pada metrik (ms latency, persentase uptime, HTTP status code) wajib menggunakan kelas Tailwind `font-mono tabular-nums` untuk mencegah flickering visual saat data ter-refresh secara real-time.

### 4.2 Type Scale Hierarchy

| Level | Size (px / rem) | Line Height | Weight | Tracking | Usage Example |
|-------|-----------------|-------------|--------|----------|---------------|
| **Display** | `32px / 2.0rem` | `1.2` (38px) | Bold (700) | `-0.025em` | Hero section landing page |
| **Page Title (H1)** | `24px / 1.5rem` | `1.3` (32px) | SemiBold (600) | `-0.02em` | Page header (e.g. "Endpoints", "Dashboard") |
| **Section Title (H2)** | `20px / 1.25rem` | `1.4` (28px) | SemiBold (600) | `-0.015em` | Card titles, modal headers, major sections |
| **Subheading (H3)** | `16px / 1.0rem` | `1.4` (24px) | Medium (500) | `-0.01em` | Table group headers, form step titles |
| **Body Large** | `15px / 0.9375rem` | `1.5` (24px) | Regular (400) | `normal` | Hero lead text, empty state descriptions |
| **Body Regular** | `14px / 0.875rem` | `1.5` (21px) | Regular (400) | `normal` | Standard inputs, table cells, paragraph body |
| **Body Small** | `13px / 0.8125rem` | `1.4` (18px) | Regular (400) | `normal` | Secondary table metadata, helper labels |
| **Caption / Badge** | `12px / 0.75rem` | `1.3` (16px) | Medium (500) | `+0.01em` | Status badges, timestamps, tags |
| **Micro / Sparkline** | `11px / 0.6875rem` | `1.2` (14px) | Regular (400) | `+0.02em` | Chart axis labels, tiny subtext |
| **Numeric KPI** | `28px / 1.75rem` | `1.1` (32px) | Bold (700) | `-0.02em` | Metric Card values (e.g. `99.98%`, `124ms`) |
| **Code Inline** | `13px / 0.8125rem` | `1.4` (18px) | Regular (400) | `0` | URL paths, cURL snippets, JSON keys |

---

## 5. Spacing, Elevation & Grid System

### 5.1 Base 4px Spacing Scale

Komponen menggunakan kelipatan 4px standar Tailwind CSS:
- `gap-1` / `p-1` (4px): Micro spacing (jarak antara status dot dan teks status)
- `gap-2` / `p-2` (8px): Compact element spacing (jarak icon dan text button, padding badge)
- `gap-3` / `p-3` (12px): Standard form element padding vertikal/horizontal
- `gap-4` / `p-4` (16px): Card internal padding, dialog inner gap
- `gap-6` / `p-6` (24px): Standard grid gap antar kartu KPI, section margins
- `gap-8` / `p-8` (32px): Major layout margins, page header to content spacing
- `p-12` (48px) – `p-16` (64px): Hero section padding pada landing page

### 5.2 Elevation & Border Hierarchy

OrderInbox memprioritaskan "Border Architecture" di atas drop shadow tebal:
1. **Level 0 (Canvas):** Flat `#0b1120`.
2. **Level 1 (Card & Containers):** Background `#111827`, Border `1px solid #1e293b`.
3. **Level 2 (Dropdowns, Popovers, Hover Cards):** Background `#1e293b`, Border `1px solid #334155`, Shadow `0 10px 15px -3px rgba(0, 0, 0, 0.5)`.
4. **Level 3 (Modal Dialogs):** Background `#111827`, Border `1px solid #334155`, Backdrop blur `backdrop-blur-sm bg-black/70`.

---

## 6. Layout Architecture & App Shell

Struktur antarmuka aplikasi dibagi menjadi 3 zona utama:
1. **Collapsible Sidebar (Desktop: 240px, Mobile: Drawer / Sheet)**
   - Logo + Brand Identifier
   - Main Navigation Group (Dashboard, Endpoints, Incidents, Alert Channels, Settings)
   - Bottom Workspace / User Profile Widget with Sign Out
2. **Sticky Header / Topbar (h-14 / 56px)**
   - Left: Mobile hamburger menu trigger + Dynamic Breadcrumbs
   - Right: Quick System Health Status Pill ("All Systems Normal" / "1 Incident Active"), Quick Add Endpoint button (`+ New Check`), Profile Avatar dropdown
3. **Main Content Container**
   - Max width: `max-w-7xl` (`1280px`) terpusat
   - Padding responsif: `px-4 py-6` (mobile) hingga `px-8 py-8` (desktop)
   - Scrollable area vertikal dengan custom slim dark scrollbar

```
+-----------------------------------------------------------------------------------+
|  [Logo] OrderInbox     | Breadcrumb > Endpoints > API V1      | [● All Up] [New+] | (Topbar h-14)
+------------------------+----------------------------------------------------------+
|  [Dashboard]           |                                                          |
|  [Endpoints] (Active)  |  Page Header (Title + Primary Action Buttons)           |
|  [Incidents]           |  ------------------------------------------------------  |
|  [Alert Settings]      |  KPI Summary Cards (4 cols on desktop)                  |
|                        |  ------------------------------------------------------  |
|                        |  Main Data Table / Charts / Content Area                 |
|                        |                                                          |
|  --------------------  |                                                          |
|  [User: dev@org.io]    |                                                          |
+------------------------+----------------------------------------------------------+
  (Sidebar w-60)           (Main Content Area max-w-7xl)
```

---

## 7. Navigation Structure & Information Architecture

### 7.1 Site Map & Route Hierarchy

```
/ (Landing Page - Public)
├── /login (Authentication)
├── /register (Authentication)
└── /(dashboard)/ [Protected Layout]
    ├── /dashboard (System Overview, Global Health, Recent Incidents)
    ├── /endpoints (All Monitored Endpoints Table & Filter Bar)
    │   ├── /new (Create Monitored Endpoint Form)
    │   └── /[id] (Endpoint Detailed Deep Dive)
    │       └── /edit (Endpoint Configuration Editor)
    └── /settings (Account Profile, Notification Channels & Webhooks)
```

### 7.2 Breadcrumb Navigation Logic
- `/dashboard` → `Dashboard`
- `/endpoints` → `Endpoints`
- `/endpoints/new` → `Endpoints > New Monitor`
- `/endpoints/e_9182` → `Endpoints > Checkout API (/api/v1/checkout)`
- `/endpoints/e_9182/edit` → `Endpoints > Checkout API > Settings`
- `/settings` → `Workspace Settings`

---

## 8. Page Specifications & ASCII Wireframes

Berikut adalah spesifikasi mendalam dan wireframe layout untuk 9 halaman inti platform OrderInbox.

---

### Page 1: Landing Page (`/`)
*Tujuan:* Menjelaskan nilai produk (instant API uptime monitoring, zero-friction setup, developer-grade latency insights) dan mengarahkan visitor untuk mendaftar.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox             Features   Pricing   Docs   Status       [Sign In] [Get Started] |
+------------------------------------------------------------------------------------+
|                                                                                    |
|                Zero-Latency API Monitoring for Modern Engineering Teams            |
|       Monitor HTTP/REST endpoints with custom headers, JSON assertions, and        |
|               sub-minute checks. Get alerted before your customers notice.         |
|                                                                                    |
|                   [ Start Monitoring Free ]     [ View Live Demo ]                 |
|                   * No credit card required  •  5-minute setup                     |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | [Terminal/Dashboard Preview Window: Dark Slate Container with Mac Dots]       |  |
|  |  POST https://api.orderinbox.dev/v1/orders   [200 OK]  •  112ms  •  99.99%   |  |
|  |  +------------------------------------------------------------------------+  |  |
|  |  | [Interactive Latency Line Chart with glowing emerald pulse data-points]|  |  |
|  |  +------------------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  --------------------------------------------------------------------------------  |
|  [Feature Bento Grid: 3 Columns]                                                   |
|  +------------------------+ +------------------------+ +------------------------+  |
|  | ⏱️ Sub-Minute Checks   | | 🛡️ Payload Assertions  | | ⚡ Instant Alerts      |  |
|  | Run checks down to 60s | | Validate HTTP status,  | | Email notifications    |  |
|  | intervals with timeout | | JSON body keys, and    | | with automated incident|  |
|  | & retry policies.      | | custom secret headers. | | triage & resolve logs. |  |
|  +------------------------+ +------------------------+ +------------------------+  |
|                                                                                    |
|  --------------------------------------------------------------------------------  |
|  Footer: © 2026 OrderInbox. Built for developers by developers.   [Privacy] [Terms]|
+------------------------------------------------------------------------------------+
```

---

### Page 2: Login Page (`/login`)
*Tujuan:* Akses masuk pengguna terdaftar secara cepat dan aman melalui Better Auth.

```text
+------------------------------------------------------------------------------------+
|                                                                                    |
|                                [Logo Icon OrderInbox]                              |
|                                 Welcome back to OrderInbox                         |
|                         Enter your credentials to access your monitors             |
|                                                                                    |
|                         +----------------------------------------+                 |
|                         | Email Address                          |                 |
|                         | [ alex@engineering.io                ] |                 |
|                         |                                        |                 |
|                         | Password             [Forgot password?] |                 |
|                         | [ ••••••••••••••••••••••••••       👁️ ] |                 |
|                         |                                        |                 |
|                         | [x] Remember this device for 30 days   |                 |
|                         |                                        |                 |
|                         | [        Sign In with Email          ] |                 |
|                         |                                        |                 |
|                         | ------------------ OR ---------------- |                 |
|                         |                                        |                 |
|                         | [ G  Continue with GitHub / Google   ] |                 |
|                         +----------------------------------------+                 |
|                                                                                    |
|                         Don't have an account? [Create an account]                 |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

---

### Page 3: Register Page (`/register`)
*Tujuan:* Pendaftaran pengguna baru dengan validasi password dan konfirmasi instan.

```text
+------------------------------------------------------------------------------------+
|                                                                                    |
|                                [Logo Icon OrderInbox]                              |
|                               Create your developer account                        |
|                        Start monitoring your critical endpoints in 60s             |
|                                                                                    |
|                         +----------------------------------------+                 |
|                         | Full Name                              |                 |
|                         | [ Alex Mercer                        ] |                 |
|                         |                                        |                 |
|                         | Work Email                             |                 |
|                         | [ alex@engineering.io                ] |                 |
|                         |                                        |                 |
|                         | Password                               |                 |
|                         | [ ••••••••••••••••••••••••••       👁️ ] |                 |
|                         | [====                 ] Min. 8 chars   |                 |
|                         |                                        |                 |
|                         | [ Create Account & Launch Dashboard  ] |                 |
|                         +----------------------------------------+                 |
|                                                                                    |
|               By continuing, you agree to our [Terms] and [Privacy Policy].        |
|                         Already have an account? [Sign In]                         |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

---

### Page 4: Dashboard Overview (`/dashboard`)
*Tujuan:* Memberikan rangkuman status kesehatan seluruh sistem, metrik agregat 24 jam, dan insiden terkini.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Dashboard                                 [● All Systems Up]  |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  Dashboard Overview                      [+ New Endpoint CTA] |
|                    |  Real-time health status across all active monitoring jobs    |
|  • Dashboard (act) |                                                               |
|  • Endpoints       |  +-------------+ +-------------+ +-------------+ +-------------+ |
|  • Incidents       |  | Total Mon.  | | Avg. Uptime | | Avg. Latency| | Active Inc. | |
|  • Settings        |  | 14 Active   | | 99.94% (24h)| | 142ms       | | 0 Critical  | |
|                    |  | +2 this wk  | | ↑ 0.02%     | | ↓ 12ms opt. | | All clear   | |
|                    |  +-------------+ +-------------+ +-------------+ +-------------+ |
|                    |                                                               |
|                    |  [Active Incidents Alert Banner - Only shown when down]       |
|                    |  (Hidden or "🎉 All monitored endpoints are responding normally")|
|                    |                                                               |
|                    |  Recently Monitored Endpoints                  [View All ->]  |
|                    |  +----------------------------------------------------------+ |
|                    |  | Name / URL            | Method | Latency | 24h Trend| Stat| |
|                    |  |-----------------------|--------|---------|----------|-----| |
|                    |  | Checkout API Service  | POST   | 185ms   | [|||||||]| UP  | |
|                    |  | User Auth Gateway     | GET    | 88ms    | [|||||||]| UP  | |
|                    |  | Stripe Webhook Relay  | POST   | 240ms   | [|||||||]| UP  | |
|                    |  | Inventory Sync Cron   | PUT    | 510ms   | [|||||||]| UP  | |
|                    |  +----------------------------------------------------------+ |
+--------------------+---------------------------------------------------------------+
```

---

### Page 5: Endpoint List (`/endpoints`)
*Tujuan:* Manajemen katalog endpoint monitoring dengan filtering status, pencarian instan, dan aksi cepat.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Endpoints                                 [+ Create Endpoint] |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  Monitored Endpoints                                          |
|                    |  Manage, configure, and inspect all HTTP monitoring targets   |
|  • Dashboard       |                                                               |
|  • Endpoints (act) |  +----------------------------------------------------------+ |
|  • Incidents       |  | [🔍 Search endpoint name or URL...]                      | |
|  • Settings        |  | Filter: [All Statuses ▾]  [All Methods ▾]  Sort: [Name ▾]| |
|                    |  +----------------------------------------------------------+ |
|                    |                                                               |
|                    |  +----------------------------------------------------------+ |
|                    |  | STATUS | ENDPOINT NAME & URL      | METHOD | LATENCY | ACTIONS |
|                    |  |--------|--------------------------|--------|---------|---------|
|                    |  | [● UP] | Production API           | [GET]  | 94ms    | [▶][⋮]  |
|                    |  |        | https://api.store.com/v1 | Int:60s| 99.98%  |         |
|                    |  |--------|--------------------------|--------|---------|---------|
|                    |  | [● UP] | Stripe Webhook Listener  | [POST] | 182ms   | [▶][⋮]  |
|                    |  |        | https://hook.store.com/in| Int:60s| 100%    |         |
|                    |  |--------|--------------------------|--------|---------|---------|
|                    |  | [● DN] | Legacy Inventory Sync    | [POST] | TIMEOUT | [▶][⋮]  |
|                    |  |        | https://inv.internal.net | Int:5m | 82.40%  |         |
|                    |  |--------|--------------------------|--------|---------|---------|
|                    |  | [● PA] | Experimental Staging Ping| [HEAD] | --      | [▶][⋮]  |
|                    |  |        | https://stage.store.com  | PAUSED | --      |         |
|                    |  +----------------------------------------------------------+ |
|                    |  Showing 4 of 4 endpoints          Page 1 of 1                |
+--------------------+---------------------------------------------------------------+
```

---

### Page 6: Create Endpoint Form (`/endpoints/new`)
*Tujuan:* Form pembuatan monitor baru dengan validasi schema Zod, custom headers, dan assertion rules.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Endpoints > New Endpoint                                      |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  Create New Monitor                                           |
|                    |  Configure HTTP endpoint targets, intervals, and health rules |
|                    |                                                               |
|                    |  +----------------------------------------------------------+ |
|                    |  | 1. General Information                                   | |
|                    |  | Friendly Monitor Name *                                  | |
|                    |  | [ Checkout API Gateway                                 ] | |
|                    |  | HTTP Method & Destination URL *                          | |
|                    |  | [POST ▾] [ https://api.mystore.com/v1/checkout         ] | |
|                    |  +----------------------------------------------------------+ |
|                    |  | 2. Execution Schedule & Performance                      | |
|                    |  | Check Interval           | Request Timeout (ms)          | |
|                    |  | [ 60 seconds (1 min) ▾ ] | [ 10000 (10 seconds)        ] | |
|                    |  +----------------------------------------------------------+ |
|                    |  | 3. Request Headers & Payload (Optional)                 | |
|                    |  | Custom Request Headers:                                  | |
|                    |  | Key: [ Authorization     ] Value: [ Bearer sec_***   ] [-] | |
|                    |  | Key: [ Content-Type      ] Value: [ application/json ] [-] | |
|                    |  | [+ Add Another Header]                                   | |
|                    |  | JSON Request Body:                                       | |
|                    |  | +------------------------------------------------------+ | |
|                    |  | | { "check_mode": "ping", "test_item_id": 991 }        | | |
|                    |  | +------------------------------------------------------+ | |
|                    |  +----------------------------------------------------------+ |
|                    |  | 4. Health Validation & Assertion Rules                   | |
|                    |  | Expected HTTP Status Codes (comma separated)             | |
|                    |  | [ 200, 201                                             ] | |
|                    |  | Response Body Assertion (Key contains / Regex)           | |
|                    |  | [ "status": "ok"                                       ] | |
|                    |  +----------------------------------------------------------+ |
|                    |                                                               |
|                    |  [ Cancel ]              [ Test Request Now ] [ Save Monitor ]|
+--------------------+---------------------------------------------------------------+
```

---

### Page 7: Edit Endpoint Form (`/endpoints/[id]/edit`)
*Tujuan:* Modifikasi parameter endpoint yang sudah ada, pengaturan pause/resume, dan Danger Zone (penghapusan).

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Endpoints > Checkout API > Settings                           |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  Edit Monitor: Checkout API Gateway                           |
|                    |  Created 14 days ago • Last checked: 12 seconds ago           |
|                    |                                                               |
|                    |  +----------------------------------------------------------+ |
|                    |  | Active Monitoring Status                                 | |
|                    |  | [ Toggle: ● ACTIVE (Checks running every 60s) ] [Pause]  | |
|                    |  +----------------------------------------------------------+ |
|                    |  | [ Form fields identical to Page 6 pre-filled with data ] | |
|                    |  | ...                                                      | |
|                    |  | [ Save Changes ]                     [ Discard Changes ] | |
|                    |  +----------------------------------------------------------+ |
|                    |                                                               |
|                    |  +----------------------------------------------------------+ |
|                    |  | ⚠️ Danger Zone                                           | |
|                    |  | Pause Monitoring                                         | |
|                    |  | Temporarily halt automated HTTP checks and alerts        | |
|                    |  |                                          [ Pause Monitor ]|
|                    |  | Delete Monitor                                           | |
|                    |  | Permanently delete this monitor and all history records  | |
|                    |  |                                         [ Delete Monitor ]|
|                    |  +----------------------------------------------------------+ |
+--------------------+---------------------------------------------------------------+
```

---

### Page 8: Endpoint Details View (`/endpoints/[id]`)
*Tujuan:* Tampilan komprehensif metrik performa: grafik latensi interaktif, bar uptime 90 hari, log eksekusi, dan detail kegagalan.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Endpoints > Checkout API Gateway                              |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  [● UP] Checkout API Gateway            [⚙️ Edit] [▶ Test Now]|
|                    |  POST https://api.mystore.com/v1/checkout (Checked 10s ago)   |
|                    |                                                               |
|                    |  +-------------+ +-------------+ +-------------+ +-------------+ |
|                    |  | Current Lat.| | 24h Uptime  | | Last Status | | SSL Valid   | |
|                    |  | 142ms       | | 99.98%      | | 200 OK      | | 82 days rem.| |
|                    |  | Fast (<200) | | 1 degraded  | | Clean body  | | Let's Encrypt |
|                    |  +-------------+ +-------------+ +-------------+ +-------------+ |
|                    |                                                               |
|                    |  Latency & Performance History (Past 24 Hours)     [24h|7d|30d]|
|                    |  +----------------------------------------------------------+ |
|                    |  | 400ms|                                                   | |
|                    |  | 200ms|       /\_     /\                                  | |
|                    |  |   0ms|______/   \___/  \_______________________________  | |
|                    |  |      00:00    04:00    08:00    12:00    16:00    20:00  | |
|                    |  +----------------------------------------------------------+ |
|                    |                                                               |
|                    |  Uptime Sparkline (Last 90 Days)                     99.98%   |
|                    |  [||||||||||||||||||||||||||||||||||||||||||||||||||||||||||] |
|                    |  90 days ago                                            Today |
|                    |                                                               |
|                    |  Recent Check Execution History                               |
|                    |  +----------------------------------------------------------+ |
|                    |  | TIMESTAMP       | STATUS | CODE | LATENCY | REASON / MSG | |
|                    |  |-----------------|--------|------|---------|--------------| |
|                    |  | 2026-11-17 10:12| [● UP] | 200  | 142ms   | Assertion OK | |
|                    |  | 2026-11-17 10:11| [● UP] | 200  | 138ms   | Assertion OK | |
|                    |  | 2026-11-17 10:10| [● UP] | 200  | 145ms   | Assertion OK | |
|                    |  | 2026-11-17 10:09| [● DN] | 504  | 10000ms | Timeout >10s | |
|                    |  +----------------------------------------------------------+ |
+--------------------+---------------------------------------------------------------+
```

---

### Page 9: Settings & Alert Channels (`/settings`)
*Tujuan:* Konfigurasi akun personal, kanal notifikasi alert (Email & Webhook), dan preferensi global.

```text
+------------------------------------------------------------------------------------+
| [Logo] OrderInbox  | Settings                                                      |
+--------------------+---------------------------------------------------------------+
|                    |                                                               |
|  [Sidebar]         |  Settings & Integrations                                      |
|                    |  Manage your account, notification channels, and global rules |
|                    |                                                               |
|                    |  [ Tabs: (General Profile)  |  *(Alert Channels)*  |  (Security) ]
|                    |                                                               |
|                    |  Email Alert Notification Channels                            |
|                    |  Receive critical downtime alerts and incident recovery pings |
|                    |  +----------------------------------------------------------+ |
|                    |  | Primary Email: alex@engineering.io [Verified]    [Default] | |
|                    |  | DevOps On-Call: ops-pager@engineering.io         [Remove]  | |
|                    |  +----------------------------------------------------------+ |
|                    |  | [+ Add Additional Alert Email]                           | |
|                    |                                                               |
|                    |  Webhook Alert Dispatch (Discord / Slack / PagerDuty)        |
|                    |  Send JSON payload immediately when an incident is detected   |
|                    |  +----------------------------------------------------------+ |
|                    |  | Webhook Target URL:                                      | |
|                    |  | [ https://hooks.slack.com/services/T00/B00/X00        ] | |
|                    |  | [ Test Webhook Ping ]                 [ Save Webhook URL ] | |
|                    |  +----------------------------------------------------------+ |
|                    |                                                               |
|                    |  Notification Threshold Rules                                 |
|                    |  [x] Alert immediately on first failure                       |
|                    |  [ ] Wait for 2 consecutive failures before firing alert      |
|                    |  [x] Send recovery email when endpoint comes back UP          |
|                    |                                                               |
|                    |  [ Save Settings ]                                            |
+--------------------+---------------------------------------------------------------+
```

---

## 9. Component Inventory & Design Specifications

Berikut spesifikasi komponen reusable yang akan dibangun di `src/components/ui/*` dan `src/components/*`:

### 9.1 Button Component (`src/components/ui/button.tsx`)
- **Variants:**
  - `default` (Primary): `bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors`
  - `secondary`: `bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700`
  - `outline`: `bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700`
  - `ghost`: `hover:bg-slate-800 text-slate-300 hover:text-white`
  - `destructive`: `bg-red-600 hover:bg-red-500 text-white font-medium`
- **Sizes:** `sm` (h-8 px-3 text-xs), `default` (h-9 px-4 text-sm), `lg` (h-11 px-6 text-base), `icon` (h-9 w-9)
- **Loading State:** Otomatis menampilkan animated spinner icon (`animate-spin`) dan disable klik (`pointer-events-none opacity-70`).

### 9.2 Status Indicator & Badge (`src/components/ui/status-badge.tsx`)
- Digunakan untuk status UP, DOWN, PAUSED, PENDING:
  - **UP:** Background `rgba(16, 185, 129, 0.1)`, Text `#10b981`, Dot `#10b981` dengan optional subtle pulse.
  - **DOWN:** Background `rgba(239, 68, 68, 0.1)`, Text `#ef4444`, Dot `#ef4444` dengan active ping ring (`animate-ping`).
  - **PAUSED:** Background `rgba(245, 158, 11, 0.1)`, Text `#f59e0b`, Dot `#f59e0b`.
  - **PENDING:** Background `rgba(148, 163, 184, 0.1)`, Text `#94a3b8`, Dot `#94a3b8`.

### 9.3 HTTP Method Badges (`src/components/endpoints/method-badge.tsx`)
Badge metode dengan styling warna spesifik untuk memudahkan scanning visual:
- `GET`: `bg-sky-500/10 text-sky-400 border border-sky-500/20`
- `POST`: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
- `PUT`: `bg-amber-500/10 text-amber-400 border border-amber-500/20`
- `PATCH`: `bg-purple-500/10 text-purple-400 border border-purple-500/20`
- `DELETE`: `bg-rose-500/10 text-rose-400 border border-rose-500/20`
- `HEAD`: `bg-slate-500/10 text-slate-400 border border-slate-500/20`

### 9.4 Metric KPI Card (`src/components/dashboard/metric-card.tsx`)
- Container: `#111827`, border `#1e293b`, hover border `#334155`.
- Layout:
  - Header: Label kecil (`text-xs font-medium text-slate-400 uppercase tracking-wider`) + Icon pojok kanan.
  - Value: Angka besar (`text-2xl font-bold font-mono text-slate-50 tabular-nums`).
  - Footer: Trend delta pill (`text-xs text-emerald-400` atau `text-rose-400` disertai panah ↑ / ↓).

### 9.5 Uptime Bar / Status Sparkline (`src/components/endpoints/uptime-bar.tsx`)
- Kumpulan 60–90 bar/segmen vertikal tipis (lebar 3px–4px, tinggi 24px, gap 2px).
- Warna per bar:
  - Hijau (`#10b981`): 100% checks sukses.
  - Kuning (`#f59e0b`): 1–2 kegagalan parsial / degradasi.
  - Merah (`#ef4444`): Downtime terkonfirmasi.
  - Abu-abu (`#334155`): No data / monitor paused.
- Interaksi: Hover pada bar menampilkan tooltip rich: tanggal spesifik, uptime %, jumlah checks, dan average response time.

### 9.6 Latency Chart Container (`src/components/endpoints/latency-chart.tsx`)
- Menggunakan Recharts ResponsiveContainer.
- Gradient fill area di bawah garis latensi: `linear-gradient(to bottom, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.0))`.
- Stroke garis: `#6366f1` (2px thickness).
- Custom Tooltip: Glassmorphic dark card (`bg-slate-900/90 border border-slate-700 p-2 text-xs font-mono`).

### 9.7 Key-Value Header Editor (`src/components/endpoints/header-editor.tsx`)
- Komponen input dinamis 2 kolom (Header Key + Header Value).
- Dukungan tambah baris (`+ Add Header`) dan hapus baris (icon tong sampah).
- Masking otomatis untuk header sensitif (Authorization, X-Api-Key) dengan ikon mata untuk reveal.

---

## 10. Responsive Rules & Breakpoints

OrderInbox mengadopsi standar breakpoint Tailwind CSS:

| Breakpoint | Viewport Width | Layout Behavior |
|------------|----------------|-----------------|
| **Mobile (`< 768px`)** | `320px - 767px` | Sidebar ditransformasikan menjadi Sliding Sheet/Drawer via hamburger icon. Metric cards ditata 1 kolom. Tabel endpoint beralih ke format Card-based atau horizontal scroll container dengan touch-swipe. Form inputs menggunakan `text-base` untuk mencegah auto-zoom di iOS Safari. |
| **Tablet (`md: 768px - 1023px`)** | `768px - 1023px` | Metric cards ditata 2 kolom. Tabel endpoint menampilkan kolom esensial (Name, Status, Latency, Actions) dan menyembunyikan kolom sekunder (SSL expiry, full URL). |
| **Laptop / Desktop (`lg: 1024px - 1279px`)** | `1024px - 1279px` | Sidebar permanen (lebar 240px). Metric cards ditata 4 kolom sejajar. Data table menampilkan seluruh kolom secara penuh. |
| **Wide Desktop (`xl: >= 1280px`)** | `1280px+` | Konten dibatasi dalam `max-w-7xl` (`1280px`) terpusat untuk menjaga jarak pandang mata yang optimal (menghindari baris tabel yang terlalu lebar dan sulit dibaca). |

---

## 11. Comprehensive UI States Matrix

Setiap komponen dan halaman harus menangani 7 kondisi status secara eksplisit:

```
+---------------------------------------------------------------------------------------+
|  STATE       | VISUAL REPRESENTATION              | ACTIONABLE USER FEEDBACK          |
|--------------|------------------------------------|-----------------------------------|
|  LOADING     | Shimmer skeleton bars              | Content preserved, no layout shift|
|  EMPTY       | Illustration + Friendly copy       | Clear primary CTA button          |
|  ERROR       | Red banner / inline field red      | Specific error reason + Retry CTA |
|  SUCCESS     | Green toast / checkmark anim       | Auto-dismiss 3s or undo action    |
|  DISABLED    | Opacity 50% + cursor-not-allowed   | Tooltip explaining reason         |
|  PAUSED      | Amber badge + italicized stats     | Prominent "Resume Monitoring" CTA |
|  CHECKING    | Subtle blue border pulse           | "Testing target..." live feedback |
+---------------------------------------------------------------------------------------+
```

### 11.1 Loading States
- **Skeleton Shimmer:** Menggunakan komponen `Skeleton` dengan background `bg-slate-800/60 animate-pulse` yang meniru dimensi presisi teks atau kartu yang sedang dimuat, mencegah Cumulative Layout Shift (CLS).
- **Inline Action Spinners:** Tombol seperti `[ Test Request Now ]` berubah menjadi `[ Testing... ]` dengan ikon spinner berputar dan atribut `disabled`.

### 11.2 Empty States
- Ketika pengguna belum memiliki endpoint:
  - Tampilan ilustrasi grafis server bergaris minimalis.
  - Judul: *"No Monitored Endpoints Yet"*
  - Deskripsi: *"Add your first API endpoint to start receiving real-time uptime telemetry and downtime alerts."*
  - CTA Utama: `[ + Create First Monitor ]` yang membuka `/endpoints/new`.

### 11.3 Error States
- **Form Field Errors:** Border input berubah menjadi `border-red-500`, pesan error muncul di bawah field dengan teks merah `text-xs text-red-400` dan icon alert kecil.
- **Server API Failures:** Toast alert muncul di pojok kanan bawah dengan opsi `Retry` atau informasi detail kendala jaringan.

### 11.4 Paused State
- Endpoint yang di-pause menampilkan status badge `PAUSED` (warna amber).
- Tombol aksi cepat menampilkan ikon `Play` untuk melanjutkan penjadwalan.

---

## 12. Accessibility (a11y) & Usability Guidelines

1. **Color Contrast Compliance:**
   - Semua teks utama (`#f8fafc`) di atas canvas (`#0b1120`) memiliki contrast ratio `15.8:1` (jauh melampaui standar WCAG AAA `7:1`).
   - Teks sekunder (`#94a3b8`) memiliki contrast ratio `6.2:1` (memenuhi standar WCAG AA).
   - Status badge tidak hanya mengandalkan warna hijau/merah, tetapi juga menyertakan label teks eksplisit (`UP`, `DOWN`, `PAUSED`) dan icon pembeda untuk pengguna dengan defisiensi penglihatan warna (color blindness).

2. **Keyboard Navigation & Focus Management:**
   - Seluruh elemen interaktif memiliki focus ring yang jelas dan tegas: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`.
   - Urutan Tab logis mengalir dari kiri-ke-kanan dan atas-ke-bawah.
   - Tombol modal dialog otomatis menangkap focus (`focus trapping`) dan dapat ditutup menggunakan tombol `Escape`.

3. **Screen Reader Optimization (ARIA):**
   - Live updates metrik dan status badge dilengkapi atribut `aria-live="polite"`.
   - Tombol tanpa teks (seperti tombol icon edit, delete, copy) wajib memiliki atribut `aria-label` yang deskriptif (misal `aria-label="Delete Endpoint Checkout API"`).

4. **Reduced Motion Support:**
   - Animasi ping dan pulse mematuhi preferensi pengguna sistem operasi:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```

---

## 13. Summary & Next Phase Transition

Dokumen ini menjadi acuan tunggal (*single source of truth*) bagi pengembangan tampilan OrderInbox. Seluruh spesifikasi token, komponen, layout, dan wireframe di atas siap diimplementasikan secara langsung pada:
- **Phase 4:** Frontend Foundation & Application Shell (Root Layout, Sidebar, Topbar, Auth Shell).
- **Phase 5:** Core Frontend Feature Development (Dashboard, Endpoints Table, Forms, Charts).
