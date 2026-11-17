# ORDERINBOX — PLAYBOOK v1.1 SUBAGENT EXECUTION GOALS
## Master Execution Blueprint for AI Coding Assistant / Subagent

> **Document Version:** 1.1.0  
> **Source Playbook:** `Playbook version 1.1.md`  
> **Base PRD & Playbook:** `PRD and Playbook.md`  
> **Codebase Target:** OrderInbox (Next.js 16 App Router, TypeScript 5, Tailwind CSS v4, Prisma 7, PostgreSQL 17, Redis 7, BullMQ, Better Auth, Caddy 2.9)

---

## 📋 Execution Rules & Operating Directives

1. **Single-Phase Execution**: Jalankan **hanya satu phase** dalam satu prompt/turn. Jangan pernah mengeksekusi multi-phase sekaligus.
2. **Preserve Working Features**: Jangan menghapus atau merusak 106+ unit/integration tests dan fitur yang sudah berjalan di v1.0.
3. **Real Code Implementation**: Implementasikan kode nyata, skema database, komponen, dan test suite — bukan sekadar komentar TODO atau boilerplate.
4. **Mandatory Verification**: Setiap phase wajib lolos semua quality gate sebelum selesai:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   npm run build
   ```
5. **Git Checkpoint Standard**: Setiap phase ditutup dengan commit khusus sesuai format `phase X (v1.1): <deskripsi>`.

---

```
                       PLAYBOOK v1.1 EXECUTION ROADMAP
                                     │
   ┌─────────────────────────────────┴─────────────────────────────────┐
   ▼                                                                   ▼
[PHASE 1] Code Audit & Cleanup                     [PHASE 6] Testing & Bug Fixing
   │                                                                   │
   ▼                                                                   ▼
[PHASE 2] Premium UI/UX Refinement                 [PHASE 7] SaaS Infrastructure
   │                                                                   │
   ▼                                                                   ▼
[PHASE 3] Feature Enhancement                      [PHASE 8] Monitoring & Reliability
   │                                                                   │
   ▼                                                                   ▼
[PHASE 4] Security Hardening                       [PHASE 9] Production Preparation
   │                                                                   │
   ▼                                                                   ▼
[PHASE 5] Performance Optimization                 [PHASE 10] Final Audit & Release
```

---

## 🎯 PHASE 1 — CODE AUDIT & CLEANUP

### 1. Objective
Audit seluruh codebase OrderInbox v1.0, eliminasi dead code, kode duplikat, inkonsistensi tipe TypeScript, serta standardisasi arsitektur layer tanpa merusak fitur atau tests yang sudah ada.

### 2. Focus Areas
- Standardisasi response envelope API (`{ success: boolean, data?: T, error?: { code: string, message: string } }`).
- Audit helper duplikat antara Next.js App Router dan BullMQ Worker.
- Eliminasi `any` types dan unsafe casting pada TypeScript.
- Clean up unused imports, dead mock fixtures, dan console log liar.
- Verifikasi sinkronisasi Prisma schema dengan database migration.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Principal Software Engineer & Code Auditor.

Project: OrderInbox (Monitoring & Uptime Platform)
Referensi: Playbook version 1.1.md — PHASE 1
Tujuan: Melakukan audit menyeluruh dan refaktorisasi kebersihan kode (Code Audit & Cleanup) tanpa mengubah perilaku fungsional atau mematahkan 106 existing tests.

Tugas:
1. Pahami seluruh arsitektur codebase (Next.js 16, src/app, src/lib, worker/, tests/, prisma/).
2. Audit dan standarisasi API response format di src/lib/api/ dan Route Handlers agar seragam dan aman dari unhandled exceptions.
3. Bersihkan kode duplikat antara src/lib/monitoring/ dan worker/src/ (satukan utilitas bersama jika memungkinkan atau buat modul shared yang bersih).
4. Eliminasi penggunaan type 'any' yang tidak perlu, ganti dengan interface/type Zod inferred yang strict.
5. Bersihkan console.log debug temporer di production paths, gantikan dengan logging terstruktur.
6. Pastikan seluruh 106 unit/integration tests tetap pass 100%.

Batasan:
- Jangan mengubah kontrak API publik atau menghapus field yang dibutuhkan frontend.
- Jangan merusak fungsionalitas worker, SSRF protection, atau scheduler.
- Jangan menambahkan dependency npm baru tanpa justifikasi kuat.

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 1 (v1.1): code audit and cleanup"
Perbarui PROGRESS.md dan laporkan file yang dimodifikasi beserta hasil audit.
```

---

## 🎯 PHASE 2 — PREMIUM UI/UX REFINEMENT

### 1. Objective
Meningkatkan estetika visual dan pengalaman pengguna OrderInbox menjadi kelas enterprise: modern, dark-mode sleek, micro-interactions halus, visual hierarchy yang kuat, dan responsivitas sempurna di seluruh viewport.

### 2. Focus Areas
- Recharts latency visualization: custom glowing gradients, interactive crosshairs, custom tooltips dengan status badge, dan responsive container.
- Polishing Status Badges & Sparklines: status pulse animation (green/amber/rose), 90-day bar layout alignment, dan hover tooltips.
- Micro-interactions & Feedbacks: smooth button active states, modern dialog/sheet animations, Sonner toast notifications yang elegan.
- Empty states & Skeletons: shimmer skeleton yang proporsional untuk cards, charts, dan tables.
- Mobile drawer & touch target accessibility refinement.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Senior UI/UX Designer & Lead Frontend Engineer.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 2
Tujuan: Mentransformasi UI/UX aplikasi menjadi sangat premium, modern, intuitif, dan responsif dengan micro-interactions kelas dunia.

Tugas:
1. Review seluruh UI pages (/dashboard, /dashboard/endpoints, /dashboard/endpoints/[id], /dashboard/settings, auth pages).
2. Tingkatkan visual design system (Tailwind v4 tokens, subtle border glows, backdrop-blur surfaces, glassmorphism aksen yang elegan).
3. Percantik visualisasi Recharts pada endpoint details:
   - Tambahkan area gradient elegan dengan dynamic stroke color (emerald untuk normal, rose jika ada degradasi/down).
   - Buat custom tooltip modern dengan rounded card, badge status, dan formatting tanggal/waktu yang rapi.
4. Refine status pills (UP / DOWN / PAUSED) dengan subtle ping/pulse indicator pada monitor aktif.
5. Tingkatkan feedback interaktif: loading skeletons yang presisi dengan dimensi konten, feedback visual saat trigger manual check, konfirmasi hapus yang safe dan estetik.
6. Sempurnakan tampilan responsive mobile drawer dan layout table pada layar kecil (<768px).

Batasan:
- Pertahankan struktur routing Next.js App Router dan data contract API yang sudah ada.
- Jangan memperkenalkan CSS library runtime tambahan; maksimalkan Tailwind CSS v4 & Lucide icons.
- Pastikan tidak ada layout shift (CLS) atau gangguan accessibility (ARIA labels tetap terjaga).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 2 (v1.1): premium ui ux refinement"
Perbarui PROGRESS.md dan laporkan daftar komponen visual yang ditingkatkan.
```

---

## 🎯 PHASE 3 — FEATURE ENHANCEMENT

### 1. Objective
Memperluas kapabilitas fungsional OrderInbox: advanced assertion rules (JSONPath, regex matching, header inspection), multi-channel notifications (Slack/Discord/Telegram webhook payloads), dan bulk actions pada catalog endpoint.

### 2. Focus Areas
- Advanced Response Assertions: validasi status code range (e.g. 200-299), response time threshold assertion (e.g. latency < 500ms), JSON body path matching, regex matching.
- Multi-Channel Notification Formatting: template payload khusus Discord embed, Slack blocks, Telegram markdown, selain generic JSON webhook.
- Bulk Operations di Endpoint Catalog: bulk pause, bulk resume, dan bulk delete dengan proteksi multi-tenant IDOR.
- Incident Management Enhancement: display durasi downtime yang presisi dan root cause summary pada incident log.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Senior Fullstack Feature Specialist.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 3
Tujuan: Melengkapi dan meningkatkan fitur fungsionalitas inti OrderInbox agar setara dengan monitoring tools profesional.

Tugas:
1. Perluas sistem assertion pada executor dan worker:
   - Dukung assertion Latency SLA (misal: gagal jika response time > X ms).
   - Dukung JSON body value check dan Regex pattern matching pada response body.
2. Tambahkan preset webhook formatting pada alert dispatcher (Discord Webhook format & Slack Incoming Webhook format).
3. Tambahkan fitur Bulk Actions pada UI Endpoint Catalog (/dashboard/endpoints):
   - Multi-select checkbox.
   - Bulk Pause, Bulk Resume, Bulk Delete dengan konfirmasi modal.
   - API endpoint pendukung: POST /api/endpoints/bulk-action dengan validasi Zod ketat.
4. Perkaya telemetry data: kalkulasi MTTR (Mean Time to Recovery) dan incident count summary pada endpoint detail.
5. Update unit dan integration tests untuk menguji seluruh rule baru.

Batasan:
- Seluruh query dan bulk operation wajib di-scope ke tenant session user (mencegah IDOR).
- Tetap terapkan timeout dan memory limits saat melakukan regex matching (mencegah ReDoS).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 3 (v1.1): feature enhancement"
Perbarui PROGRESS.md dan laporkan fungsionalitas baru yang diimplementasikan.
```

---

## 🎯 PHASE 4 — SECURITY HARDENING

### 1. Objective
Memperkuat postur keamanan seluruh layer aplikasi: DNS rebinding mitigation pada SSRF engine, strict rate limiting, security headers, token rotation, CSRF protection, dan input sanitization.

### 2. Focus Areas
- SSRF Engine Hardening: mitigasi DNS Rebinding dengan cara menyelesaikan IP via DNS lookup sebelum connect, memvalidasi IP terhadap blacklist RFC 1918/IMDS/Loopback, dan mengunci request HTTP ke IP yang divalidasi.
- Distributed Rate Limiting: pasang middleware rate limiting berbasis Redis (atau memory fallback) pada auth endpoints (`/api/auth/*`) dan check dispatch (`/api/endpoints/*/check`).
- Webhook Signature: tambahkan HMAC-SHA256 signature header (`X-OrderInbox-Signature`) pada setiap outbound alert webhook agar penerima dapat memverifikasi keaslian alert.
- OWASP Top 10 Audit: sanitasi custom headers, pencegahan ReDoS pada regex assertions, dan audit dependency security.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Application Security Engineer & DevSecOps Specialist.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 4
Tujuan: Melakukan audit komprehensif dan memperkeras security posture (Security Hardening) aplikasi OrderInbox.

Tugas:
1. Audit dan perkuat SSRF defense di worker dan executor:
   - Implementasikan proteksi mitigasi DNS Rebinding (DNS resolution validation sebelum connection).
   - Pastikan redirect handling tetap memvalidasi target hop secara rekursif terhadap daftar IP terlarang.
2. Pasang rate limiting pada API Route Handlers sensitif (/api/auth/*, /api/endpoints/*/check) menggunakan Redis-based token bucket / sliding window.
3. Implementasikan HMAC-SHA256 signature pada alert webhook (kirim header X-OrderInbox-Signature dengan secret tenant).
4. Review security headers pada Next.js config dan Caddyfile (Content-Security-Policy, Permissions-Policy, X-Content-Type-Options, Referrer-Policy).
5. Buat security test suites baru di tests/security/ untuk memverifikasi mitigasi rate limiting, DNS rebinding, dan header injection.

Batasan:
- Jangan merusak validasi normal untuk domain publik valid (seperti google.com, api.github.com, dsb).
- Pastikan performance overhead dari security checks minimal (<5ms).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 4 (v1.1): security hardening"
Perbarui PROGRESS.md dan catat ringkasan patch keamanan yang diterapkan.
```

---

## 🎯 PHASE 5 — PERFORMANCE OPTIMIZATION

### 1. Objective
Mengoptimalkan throughput backend, queries database, efisiensi background worker, dan performa frontend rendering (Lighthouse score, dynamic imports, query indexing).

### 2. Focus Areas
- Database & Query Optimization: tambahkan composite index Prisma pada `CheckLog (endpoint_id, created_at DESC)` dan `Incident (endpoint_id, status)`.
- Batch Ingestion pada Worker: gunakan Prisma `createMany` atau pipelined batching jika worker memproses check logs volume tinggi.
- Frontend Bundle & Tree-shaking: dynamic lazy-loading untuk Recharts chart component (`next/dynamic` dengan `ssr: false`).
- Aggregation Caching: cache KPI dashboard stats di Redis dengan TTL 15-30 detik untuk menghindari hit SQL agregat berulang.
- Connection Pooling: optimasi parameter pool PostgreSQL pada Prisma PgAdapter.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Performance Engineer & Database Tuning Specialist.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 5
Tujuan: Mengoptimalkan kecepatan aplikasi, response time API, efisiensi database queries, dan bundle footprint frontend.

Tugas:
1. Audit database schema Prisma:
   - Tambahkan composite indexing yang optimal pada tabel CheckLog dan Incident untuk query history dan telemetri.
   - Siapkan Prisma migration untuk index baru tanpa data loss.
2. Optimalkan API Dashboard Stats (/api/dashboard/stats):
   - Pasang Redis caching layer (short TTL 15s) untuk stats ringkasan user agar tidak membebani PostgreSQL pada dashboard polling.
3. Optimalkan frontend performance:
   - Gunakan next/dynamic untuk me-load komponen Recharts secara lazy saat tab/halaman aktif dibuka.
   - Pastikan bundle size halaman dashboard tetap optimal.
4. Optimalkan worker background execution:
   - Atur BullMQ concurrency settings dan Redis connection pooling agar worker dapat menangani ratusan check/menit secara stabil.
5. Jalankan benchmark/profiling sederhana untuk memverifikasi efisiensi latency response.

Batasan:
- Pastikan cache invalidation berjalan rapi saat user menambahkan, mengedit, atau menghapus endpoint.
- Hindari over-caching yang menyebabkan data realtime terlihat usang (stale).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 5 (v1.1): performance optimization"
Perbarui PROGRESS.md dan laporkan metrik peningkatan performa.
```

---

## 🎯 PHASE 6 — TESTING & BUG FIXING

### 1. Objective
Memperluas cakupan testing menyeluruh: unit tests, API integration tests, worker job execution tests, failure scenario edge cases, serta perbaikan seluruh bug terdeteksi tanpa regresi.

### 2. Focus Areas
- Expanded Unit Testing: coverage untuk advanced assertions, notification formatters, rate limiters, dan Redis cache wrapper.
- End-to-End Workflow Testing: simulasikan flow penuh: User Buat Endpoint -> Worker Jalankan Job -> Down terdeteksi -> Incident dibuat & Alert terkirim -> Endpoint Pulih -> Incident Resolved.
- Edge Case & Fault Injection Testing: socket timeout, payload JSON rusak, HTTP 429 rate limited upstream, SSL certificate invalid, DNS resolution failure.
- Regression Zero Tolerance: pastikan 100% test suites (120+ tests) pass dengan execution time cepat.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Lead QA Automation Engineer & Reliability Specialist.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 6
Tujuan: Melakukan testing menyeluruh (unit, integrasi, edge cases) dan bug fixing untuk menjamin stabilitas tanpa regresi.

Tugas:
1. Perluas test suites di direktori tests/ untuk menguji seluruh fitur baru v1.1:
   - Test assertion latency threshold, regex, dan JSONPath matching.
   - Test rate limiter middleware dan rejection HTTP 429.
   - Test cache layer fallbacks (ketika Redis hit/miss/error).
   - Test bulk action endpoints (otorisasi tenant & validasi payload).
2. Tambahkan simulasi kegagalan network/upstream (socket timeout, connection refused, DNS NXDOMAIN).
3. Lakukan pengujian menyeluruh terhadap lifecycle incident: state transition UP -> DOWN -> RECOVERED dan anti-flapping logic.
4. Identifikasi dan perbaiki setiap bug yang ditemukan selama proses testing.
5. Laporkan total test count, breakdown suites, dan execution time.

Batasan:
- Tidak boleh menonaktifkan test yang ada untuk menghindari error; seluruh kegagalan harus diperbaiki pada level kode.
- Test suites harus runnable melalui standard script `npm test`.

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test (harus 100% pass)
- npm run build

Checkpoint:
git commit -m "phase 6 (v1.1): testing and bug fixing"
Perbarui PROGRESS.md dan buat TEST_REPORT_v1.1.md jika ada penambahan suites signifikan.
```

---

## 🎯 PHASE 7 — SAAS INFRASTRUCTURE ENHANCEMENT

### 1. Objective
Mematangkan fondasi arsitektur SaaS: quota & usage limit enforcement (Tier Free vs Pro), onboarding guided flow untuk user baru, subscription schema foundation, dan audit logging aktivitas pengguna.

### 2. Focus Areas
- Plan Limits & Quota Service: validasi batas jumlah endpoint (e.g. Free: max 5 endpoints, 5 min interval; Pro: 50 endpoints, 1 min interval).
- User Onboarding Flow: empty state welcoming guide yang interaktif untuk membantu user menambahkan endpoint pertama mereka dalam 30 detik.
- Audit Log System: pencatatan log aktivitas tenant (e.g. ENDPOINT_CREATED, ENDPOINT_DELETED, SETTINGS_UPDATED) untuk visibilitas keamanan.
- Subscription Readiness: model database `Subscription` / `Plan` di Prisma untuk integrasi billing masa depan (Stripe/Payment gateway webhook stubs).

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Principal SaaS Architect & Platform Engineer.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 7
Tujuan: Membangun dan mematangkan fondasi infrastruktur SaaS (quota management, usage limits, onboarding flow, audit logs).

Tugas:
1. Implementasikan Quota & Limit Enforcement Service (src/lib/saas/limits.ts):
   - Cek batas kuota endpoint sebelum create (tolak dengan error informatif jika kuota terlampaui).
   - Enforce batas minimal check interval berdasarkan tier pengguna.
2. Tambahkan skema AuditLog di prisma/schema.prisma:
   - Catat tindakan penting: login, create/update/delete endpoint, toggle alerts, update settings.
   - Buat helper auditLog(userId, action, details) yang non-blocking.
3. Rancang UI Onboarding Quick-Start di Dashboard:
   - Tampilkan checklist onboarding progresif untuk user baru: (1) Buat endpoint pertama, (2) Konfigurasi notifikasi, (3) Jalankan manual check.
4. Siapkan skema basis data untuk Subscription / Billing plans (Free, Pro, Enterprise) sebagai fondasi monetisasi.
5. Buat unit tests untuk memvalidasi limit enforcement dan audit logging.

Batasan:
- Pastikan user lama otomatis mendapatkan plan default (Free Tier) tanpa breaking changes.
- Penulisan audit log tidak boleh menghambat latency utama API (fail-open atau background write).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 7 (v1.1): saas infrastructure enhancement"
Perbarui PROGRESS.md dan laporkan kapabilitas SaaS yang ditambahkan.
```

---

## 🎯 PHASE 8 — MONITORING & RELIABILITY

### 1. Objective
Mengimplementasikan observabilitas mendalam: structured logging (Pino/JSON logger), health check diagnostik lengkap (/api/health), BullMQ Dead-Letter Queue (DLQ), graceful shutdown handlers, dan backup automated script.

### 2. Focus Areas
- Deep Health Check Endpoint: evaluasi kesehatan live PostgreSQL (query ping), Redis latency, dan BullMQ worker queue active/waiting count.
- Structured Logger: standardisasi log output berformat JSON dengan timestamp ISO, log level, request-id, dan context tag.
- Worker Resilience & DLQ: konfigurasi retry exponential backoff pada BullMQ dan isolasi failed jobs ke Dead-Letter Queue dengan alert internal.
- Graceful Shutdown: penanganan sinyal SIGTERM dan SIGINT pada Next.js server dan BullMQ worker (drain active jobs sebelum exit).

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Site Reliability Engineer (SRE) & Observability Architect.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 8
Tujuan: Mengimplementasikan sistem monitoring, logging terstruktur, error recovery, dan reliabilitas tingkat produksi.

Tugas:
1. Sempurnakan endpoint diagnostik /api/health:
   - Kembalikan status HTTP 200/503 lengkap dengan uptime, status database connection, status Redis ping, dan antrean BullMQ.
2. Bangun structured JSON logger utility (src/lib/logger.ts):
   - Output log terformat rapi dengan correlation ID (x-request-id), context metadata, dan level (info, warn, error).
3. Konfigurasi Dead-Letter Queue (DLQ) dan retry strategy pada BullMQ worker:
   - Retry 3x dengan exponential backoff untuk temporary errors (network blips).
   - Simpan failed jobs permanen di redis failed set untuk dianalisis.
4. Implementasikan graceful shutdown handlers di worker (worker/src/index.ts):
   - Tangkap sinyal SIGTERM/SIGINT, selesaikan job yang sedang berjalan, dan tutup koneksi Redis & DB dengan aman.
5. Buat script pemantau kesehatan berkala di docker/scripts/healthcheck.sh.

Batasan:
- Jangan expose data sensitif (password DB, secret key, connection string) pada response /api/health.
- Logging tidak boleh mencatat payload body yang berisi kredensial atau auth headers (redact sensitive data).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 8 (v1.1): monitoring and reliability"
Perbarui PROGRESS.md dan laporkan sistem reliabilitas yang diterapkan.
```

---

## 🎯 PHASE 9 — PRODUCTION PREPARATION

### 1. Objective
Mempersiapkan seluruh aset dan konfigurasi operasional produksi: hardening Docker compose, optimasi Caddy 2.9 reverse proxy, secret management validation, backup verification, dan dokumentasi release.

### 2. Focus Areas
- Production Docker & Compose Hardening: resource limits (CPU/RAM quotas), security contexts, read-only root filesystems jika memungkinkan.
- Caddyfile Hardening: TLS 1.3 only option, HTTP/3 QUIC, rate limiting IP rules pada reverse proxy, CSP headers tuning.
- Environment & Secrets Verification Script: script `scripts/verify-env.sh` atau TypeScript utility untuk memvalidasi kelengkapan env vars sebelum startup.
- Automated Disaster Recovery Verification: pengujian script `docker/scripts/backup.sh` dan `restore.sh` dengan mock dataset.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai Senior DevOps & Cloud Infrastructure Engineer.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 9
Tujuan: Memastikan seluruh konfigurasi container, reverse proxy, keamanan environment, dan strategi backup siap untuk production deployment.

Tugas:
1. Review dan tingkatkan docker-compose.yml dan Dockerfile:
   - Tambahkan resource constraints (limits CPU/Memory) untuk service Postgres, Redis, App, dan Worker.
   - Pastikan non-root user execution tetap diterapkan secara strict.
2. Perbarui konfigurasi Caddyfile:
   - Tambahkan header security modern (Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options).
   - Optimalkan gzip dan zstd compression.
3. Buat skrip validasi environment variable produksi:
   - Validasi keberadaan DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET, dsb sebelum proses booting aplikasi.
4. Uji dan verifikasi skrip backup dan restore di docker/scripts/:
   - Pastikan skrip backup menghasilkan file dump terkompresi (.sql.gz) dan rotasi file lama berjalan otomatis.
5. Perbarui panduan DEPLOYMENT_GUIDE.md untuk menyertakan arsitektur v1.1.

Batasan:
- Jangan melakukan commit terhadap credentials atau .env asli ke git repository.
- Seluruh port database dan redis tetap terisolasi di internal docker network (tidak di-expose publik).

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 9 (v1.1): production preparation"
Perbarui PROGRESS.md dan perbarui DEPLOYMENT_GUIDE.md.
```

---

## 🎯 PHASE 10 — FINAL AUDIT & RELEASE

### 1. Objective
Melakukan audit akhir independen terhadap fungsionalitas, keamanan, performa, dan reliabilitas, verifikasi zero-defect, serta merilis versi resmi v1.1.0 General Availability.

### 2. Focus Areas
- Complete E2E Smoke Testing: login -> dashboard -> CRUD endpoint -> manual check -> alert simulation -> telemetry graph -> settings update -> sign out.
- Final Quality Gates Sweep: zero lint warnings, zero TypeScript errors, 100% test pass rate, clean standalone build.
- Documentation & Release Notes: authoring `RELEASE_NOTES_v1.1.md` berisi changelog lengkap, breaking changes (jika ada), migrasi database, dan metrik stabilitas.
- Version bump di `package.json` ke `1.1.0`.

### 3. Subagent Prompt (Ready to Copy & Run)
```text
Kamu bertindak sebagai QA Director & Release Manager.

Project: OrderInbox
Referensi: Playbook version 1.1.md — PHASE 10
Tujuan: Menjalankan final audit komprehensif, verifikasi zero-regression, validasi seluruh quality gate, dan merilis versi v1.1.0 GA.

Tugas:
1. Jalankan audit komprehensif terhadap seluruh fitur yang dibangun dari Phase 1 hingga Phase 9:
   - Periksa konsistensi UI, fungsionalitas backend, proteksi SSRF & security hardening, dan performa database.
2. Eksekusi seluruh quality gates secara ketat:
   - npm run lint (0 warnings / 0 errors)
   - npx tsc --noEmit (0 type errors)
   - npm test (100% tests passing)
   - npm run build (Clean Next.js standalone build code 0)
3. Bump versi di package.json menjadi 1.1.0.
4. Buat RELEASE_NOTES_v1.1.md yang mendokumentasikan:
   - Ringkasan fitur & peningkatan v1.1.
   - Patch keamanan & hardening yang dilakukan.
   - Optimasi performa & arsitektur SaaS.
   - Panduan upgrade dari v1.0.
5. Perbarui PROGRESS.md menandai seluruh Phase 1-10 Playbook v1.1 sebagai Completed.

Batasan:
- Jika ditemukan bug atau test gagal, selesaikan hingga tuntas sebelum membuat commit release.
- Jangan tinggalkan branch atau git working directory dalam keadaan dirty.

Validasi & Quality Gates:
- npm run lint
- npx tsc --noEmit
- npm test
- npm run build

Checkpoint:
git commit -m "phase 10 (v1.1): final audit and v1.1.0 production release"
Laporkan kesimpulan rilis dan status kesiapan production.
```

---

## 📊 Summary Matrix: Playbook v1.1 Subagent Goals

| Phase | Nama Fase | Fokus Utama | Target Checkpoint |
|---|---|---|---|
| **Phase 1** | Code Audit & Cleanup | Standarisasi API, hilangkan duplikasi kode & `any` types | `phase 1 (v1.1): code audit and cleanup` |
| **Phase 2** | Premium UI/UX Refinement | Dark mode visual, Recharts gradients, micro-interactions | `phase 2 (v1.1): premium ui ux refinement` |
| **Phase 3** | Feature Enhancement | Advanced assertions (JSON/Regex/SLA), bulk actions, webhook templates | `phase 3 (v1.1): feature enhancement` |
| **Phase 4** | Security Hardening | DNS rebinding SSRF defense, rate limiting, HMAC webhooks | `phase 4 (v1.1): security hardening` |
| **Phase 5** | Performance Optimization | Composite DB index, Redis stats caching, Recharts dynamic import | `phase 5 (v1.1): performance optimization` |
| **Phase 6** | Testing & Bug Fixing | 120+ tests coverage, network failure simulations, zero regression | `phase 6 (v1.1): testing and bug fixing` |
| **Phase 7** | SaaS Infrastructure | Tier quotas & limits, audit logging, onboarding guide, billing schema | `phase 7 (v1.1): saas infrastructure enhancement` |
| **Phase 8** | Monitoring & Reliability | Deep `/api/health`, structured JSON logging, BullMQ DLQ, graceful shutdown | `phase 8 (v1.1): monitoring and reliability` |
| **Phase 9** | Production Preparation | Docker resource limits, Caddy hardening, env verifier script | `phase 9 (v1.1): production preparation` |
| **Phase 10** | Final Audit & Release | E2E smoke tests, 100% quality gates, release notes v1.1.0 | `phase 10 (v1.1): final audit and release` |

---
*Dokumen ini siap digunakan sebagai instruksi langsung untuk subagent AI secara bertahap.*
