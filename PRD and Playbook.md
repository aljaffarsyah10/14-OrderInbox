# PROJECT_PRD_AND_PLAYBOOK.md

# OrderInbox — API Monitoring Platform

**Product Requirements Document & Sequential Development Playbook**

| Information        | Details                                 |
| ------------------ | --------------------------------------- |
| Project            | OrderInbox                              |
| Product Category   | API Monitoring / Developer Tools        |
| Platform           | Web Application                         |
| Development        | Solo Developer + AI Coding Assistant    |
| Project Stage      | MVP                                     |
| Architecture       | Modular Monolith + Background Worker    |
| Frontend           | Next.js, TypeScript, Tailwind CSS       |
| Backend            | Next.js Route Handlers + Node.js Worker |
| Database           | PostgreSQL                              |
| Queue              | Redis + BullMQ                          |
| ORM                | Prisma                                  |
| Deployment         | VPS + Docker Compose                    |
| Source Inspiration | Uptime Kuma                             |

---

# DOCUMENT CONTROL

## Document Purpose

Dokumen ini merupakan sumber utama kebutuhan produk dan panduan teknis pengembangan OrderInbox.

Dokumen digunakan untuk:

1. Mendefinisikan kebutuhan dan batasan produk.
2. Menentukan arsitektur teknis.
3. Menjadi referensi implementasi frontend dan backend.
4. Membagi development menjadi tepat 10 phase.
5. Memberikan prompt implementasi untuk AI Coding Assistant.
6. Menentukan acceptance criteria setiap phase.
7. Menetapkan Git checkpoint.
8. Memastikan development dilakukan secara bertahap.

## Development Rules

- Selesaikan satu phase sebelum memulai phase berikutnya.
- Jangan mengerjakan seluruh project sekaligus.
- Jangan mengimplementasikan fitur di luar scope phase.
- Jangan membuat asumsi teknis yang bertentangan dengan dokumen.
- Jangan menganggap testing berhasil tanpa menjalankannya.
- Setiap phase harus direview sebelum commit.
- Jangan melanjutkan otomatis ke phase berikutnya.

---

# PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

# 1. PRODUCT INFORMATION

## 1.1 Product Name

**OrderInbox**

Product positioning: API Monitoring Platform.

Catatan: Nama OrderInbox sementara dipertahankan. Nama ini kurang menggambarkan produk API monitoring dan dapat dievaluasi sebelum public launch.

## 1.2 Product Description

OrderInbox adalah platform API monitoring berbasis web yang membantu developer memantau ketersediaan dan performa endpoint API secara otomatis.

Pengguna dapat mendaftarkan endpoint API, menentukan interval pemeriksaan, melakukan validasi HTTP response, serta menerima notifikasi ketika endpoint mengalami gangguan.

Platform menyediakan dashboard untuk melihat status endpoint, response time, HTTP status code, dan riwayat pemeriksaan.

## 1.3 Target Users

Target pengguna adalah publik, terutama:

- Backend developers.
- Fullstack developers.
- Software engineers.
- Solo developers.
- Startup dan SaaS founders.
- Software development agencies.
- Tim IT perusahaan kecil dan menengah.

## 1.4 Development Approach

- MVP First.
- Solo Developer.
- AI-Assisted Development.
- Clean Architecture secara pragmatis.
- Modular dan reusable.
- Minimal dependencies.
- Production-oriented.
- Incremental development.

## 1.5 Technology Stack

| Layer                 | Technology             |
| --------------------- | ---------------------- |
| Frontend              | Next.js App Router     |
| Language              | TypeScript             |
| Styling               | Tailwind CSS           |
| UI Components         | shadcn/ui              |
| Client State          | Zustand (selektif)     |
| Form                  | React Hook Form        |
| Validation            | Zod                    |
| Backend API           | Next.js Route Handlers |
| Background Worker     | Node.js                |
| Queue                 | BullMQ                 |
| Database              | PostgreSQL             |
| ORM                   | Prisma                 |
| Cache / Queue Storage | Redis                  |
| Authentication        | Better Auth            |
| HTTP Client           | Native Fetch           |
| Charts                | Recharts               |
| Testing               | Vitest + Playwright    |
| Deployment            | Docker Compose + VPS   |
| Reverse Proxy         | Caddy atau Nginx       |

### Dependency Principles

Jangan menambahkan dependency tanpa kebutuhan yang jelas.

Penggunaan library harus memenuhi alasan berikut:

- Zod: validasi input dan konfigurasi.
- Prisma: database access dan schema management.
- BullMQ: background job scheduling.
- Better Auth: autentikasi pengguna.
- React Hook Form: pengelolaan form kompleks.
- Recharts: visualisasi monitoring history.
- Vitest: unit dan integration testing.
- Playwright: end-to-end testing.

Gunakan native Fetch untuk HTTP requests.

Axios tidak diwajibkan.

Zustand hanya digunakan untuk state lintas komponen yang memang membutuhkan global state.

---

# 2. PRODUCT OVERVIEW

## 2.1 Problem Statement

Developer sering harus memeriksa kondisi API secara manual ketika terjadi error.

Beberapa masalah yang sering terjadi:

1. Developer tidak mengetahui ketika endpoint mengalami downtime.
2. Tidak ada monitoring otomatis secara berkala.
3. Response time sulit dipantau secara konsisten.
4. HTTP status error tidak tercatat dengan baik.
5. Perubahan response body tidak selalu terdeteksi.
6. Developer baru mengetahui masalah setelah pengguna melaporkannya.
7. Tidak tersedia ringkasan performa endpoint yang mudah dipahami.

## 2.2 Proposed Solution

OrderInbox menyediakan satu dashboard terpusat untuk monitoring API.

Pengguna dapat:

- Mendaftarkan endpoint.
- Mengatur interval pemeriksaan.
- Menentukan expected HTTP status.
- Memvalidasi response headers.
- Memvalidasi response body.
- Melihat response time.
- Melihat riwayat pemeriksaan.
- Menerima alert ketika endpoint bermasalah.

## 2.3 How It Works

Alur utama sistem:

1. Pengguna membuat akun.
2. Pengguna menambahkan endpoint API.
3. Sistem menyimpan konfigurasi endpoint.
4. Scheduler menjadwalkan pemeriksaan.
5. BullMQ memasukkan pekerjaan ke queue.
6. Node.js Worker menjalankan HTTP request.
7. Worker memvalidasi hasil pemeriksaan.
8. Hasil disimpan ke PostgreSQL.
9. Status endpoint diperbarui.
10. Sistem mengirim alert apabila ditemukan gangguan.

## 2.4 Core Value Proposition

**Know when your API breaks before your users do.**

Nilai utama:

- Automated endpoint monitoring.
- Response time visibility.
- HTTP validation.
- Historical monitoring data.
- Early failure notifications.
- Simple developer-focused dashboard.

## 2.5 Product Differentiation

Diferensiasi yang ditargetkan:

- Interface sederhana.
- Mudah digunakan oleh solo developer.
- Monitoring endpoint dengan konfigurasi fleksibel.
- Dokumentasi penggunaan yang jelas.
- Ringkasan monitoring yang mudah dipahami.
- Fokus pada kebutuhan developer Indonesia.

Dukungan bahasa Indonesia dapat menjadi keunggulan awal, tetapi struktur produk tetap disiapkan agar dapat mendukung bahasa Inggris.

---

# 3. PRODUCT GOALS

## 3.1 MVP Goals

Tujuan MVP:

1. Pengguna dapat membuat akun.
2. Pengguna dapat mendaftarkan endpoint API.
3. Sistem dapat melakukan pemeriksaan otomatis.
4. Sistem dapat mengukur response time.
5. Sistem dapat mendeteksi HTTP error.
6. Sistem dapat melakukan validasi header dan body.
7. Sistem dapat menyimpan monitoring history.
8. Sistem dapat mengirim alert ketika endpoint bermasalah.
9. Pengguna dapat mengelola endpoint melalui dashboard.

## 3.2 Success Metrics

Target awal untuk validasi MVP:

| Metric                              |                          Target |
| ----------------------------------- | ------------------------------: |
| Endpoint creation success           |                           > 99% |
| Successful scheduled job processing |                           > 99% |
| Monitoring result persistence       |                           > 99% |
| Dashboard initial load              |                     < 3 seconds |
| API CRUD response                   |                        < 500 ms |
| Monitoring interval minimum         |                        1 minute |
| Alert processing                    | Within 1 minute after detection |
| Critical application errors         |              0 known unresolved |

Target ini merupakan sasaran engineering, bukan jaminan uptime layanan.

## 3.3 MVP Definition

MVP dianggap berhasil apabila:

- Pengguna dapat mendaftar dan login.
- Pengguna dapat membuat endpoint monitor.
- Endpoint diperiksa otomatis.
- Hasil pemeriksaan tersimpan.
- Status endpoint diperbarui.
- Alert dapat dikirim.
- Riwayat pemeriksaan dapat dilihat.
- Sistem dapat dijalankan di production.

---

# 4. TARGET USERS

## 4.1 Solo Developer

Kebutuhan:

- Memantau API milik sendiri.
- Mengetahui downtime.
- Mengukur response time.
- Melihat riwayat gangguan.

## 4.2 Startup Founder

Kebutuhan:

- Memastikan backend tetap tersedia.
- Mengawasi API production.
- Mengurangi kebutuhan monitoring manual.
- Menerima pemberitahuan ketika layanan bermasalah.

## 4.3 Development Agency

Kebutuhan:

- Memantau banyak endpoint klien.
- Mengelola monitoring dari satu dashboard.
- Mengetahui gangguan layanan.
- Melakukan pengecekan berkala.

## 4.4 Backend / DevOps Engineer

Kebutuhan:

- HTTP status monitoring.
- Header validation.
- Body validation.
- Response time monitoring.
- Historical performance.

---

# 5. SCOPE & FEATURE PRIORITIES

## 5.1 P0 — Core MVP

| Feature              | Description                 |
| -------------------- | --------------------------- |
| Authentication       | Register, login, logout     |
| Dashboard            | Ringkasan monitoring        |
| Endpoint Management  | CRUD endpoint               |
| HTTP Monitoring      | Pemeriksaan HTTP request    |
| Status Detection     | UP, DOWN, PENDING           |
| Response Time        | Mengukur durasi request     |
| HTTP Validation      | Expected status code        |
| Header Validation    | Validasi response headers   |
| Body Validation      | Validasi response body      |
| Monitoring History   | Menyimpan hasil pemeriksaan |
| Background Scheduler | Menjadwalkan monitoring     |
| Alert System         | Notifikasi email            |
| Endpoint Details     | Detail monitoring endpoint  |

## 5.2 P1 — Supporting Features

- Search dan filter endpoint.
- Monitoring history pagination.
- Response time charts.
- Manual endpoint check.
- Pause dan resume monitoring.
- Custom request headers.
- Request timeout configuration.
- Alert configuration.
- Maintenance mode.
- Export monitoring history.
- Basic status summary.
- User profile management.

## 5.3 P2 — Future Development

- Public status pages.
- Team collaboration.
- Multiple monitoring regions.
- Webhook integrations.
- Slack integration.
- Discord integration.
- Telegram integration.
- Advanced API assertions.
- API response schema validation.
- SSL certificate monitoring.
- Domain expiration monitoring.
- Incident management.
- SLA reporting.
- Advanced analytics.
- Paid subscription management.

## 5.4 MVP Restrictions

Tidak termasuk MVP:

- Microservices architecture.
- Kubernetes.
- Multi-region monitoring.
- Complex team permissions.
- Advanced billing system.
- Native mobile applications.
- AI-based anomaly detection.
- Distributed monitoring infrastructure.
- Full API testing automation.
- Load testing.

---

# 6. FUNCTIONAL REQUIREMENTS

## FR-01 — User Registration

Description:

Pengguna dapat membuat akun.

System behavior:

- Menerima nama, email, dan password.
- Melakukan validasi input.
- Memastikan email belum digunakan.
- Menyimpan akun secara aman.
- Password harus di-hash oleh authentication system.

Acceptance criteria:

- Pengguna dapat membuat akun valid.
- Email duplikat ditolak.
- Password invalid ditolak.
- Password tidak pernah disimpan dalam plaintext.

## FR-02 — User Authentication

Description:

Pengguna dapat login dan logout.

Acceptance criteria:

- Login valid berhasil.
- Login invalid ditolak.
- Session dikelola secara aman.
- Protected pages tidak dapat diakses tanpa autentikasi.

## FR-03 — Dashboard

Description:

Menampilkan ringkasan monitoring pengguna.

Informasi:

- Total endpoints.
- Active endpoints.
- UP endpoints.
- DOWN endpoints.
- Average response time.
- Recent incidents.

Acceptance criteria:

- Data sesuai database pengguna.
- Dashboard tidak menampilkan data milik pengguna lain.
- Loading, empty, dan error states tersedia.

## FR-04 — Create Endpoint

Description:

Pengguna dapat menambahkan endpoint API.

Field:

- Name.
- URL.
- HTTP Method.
- Monitoring interval.
- Timeout.
- Expected HTTP status.
- Optional request headers.
- Optional request body.
- Header validation rules.
- Body validation rules.

Acceptance criteria:

- URL harus valid.
- HTTP method harus didukung.
- Interval harus sesuai plan.
- Input divalidasi di backend.
- Endpoint tersimpan ke database.
- Monitoring job dijadwalkan.

## FR-05 — Update Endpoint

Pengguna dapat mengubah konfigurasi endpoint.

Acceptance criteria:

- Data endpoint dapat diperbarui.
- Queue configuration diperbarui.
- Perubahan tidak memengaruhi endpoint pengguna lain.

## FR-06 — Delete Endpoint

Pengguna dapat menghapus endpoint.

Acceptance criteria:

- Endpoint dihapus atau diarsipkan sesuai kebijakan data.
- Scheduled monitoring dihentikan.
- Pending jobs tidak boleh menghasilkan perubahan status untuk endpoint yang sudah dihapus.
- Data terkait ditangani secara konsisten.

## FR-07 — Automated HTTP Monitoring

Description:

Worker melakukan HTTP request sesuai jadwal.

Acceptance criteria:

- Request berjalan sesuai interval.
- Request timeout diterapkan.
- HTTP status tercatat.
- Response time tercatat.
- Request failure ditangani.
- Hasil monitoring disimpan.

## FR-08 — Response Time Measurement

Description:

Sistem mengukur waktu dari pengiriman request hingga response selesai diterima.

Acceptance criteria:

- Durasi diukur menggunakan monotonic clock.
- Hasil disimpan dalam milliseconds.
- Timeout dan network error dibedakan dari HTTP response.
- Ukuran response dibatasi.

## FR-09 — HTTP Status Validation

Description:

Memeriksa apakah HTTP status sesuai konfigurasi.

Acceptance criteria:

- Expected status dapat ditentukan.
- Status tidak sesuai dianggap gagal.
- Actual status tercatat.

## FR-10 — Header Validation

Description:

Memvalidasi response headers.

Contoh:

- Content-Type harus application/json.
- Header tertentu harus tersedia.
- Header harus memiliki expected value.

Acceptance criteria:

- Rule dapat disimpan.
- Header dibandingkan tanpa case sensitivity pada nama header.
- Rule failure tercatat dengan alasan yang jelas.

## FR-11 — Body Validation

Description:

Memvalidasi isi response body.

MVP mendukung:

- Contains text.
- Does not contain text.
- JSON property exists.
- JSON property equals expected value.

Acceptance criteria:

- Body dibatasi ukurannya.
- Invalid JSON ditangani.
- Rule validation menghasilkan hasil yang konsisten.
- Sensitive response content tidak disimpan secara default.

## FR-12 — Monitoring History

Description:

Menyimpan hasil setiap pemeriksaan.

Data:

- Endpoint ID.
- HTTP status.
- Response time.
- Check result.
- Error message.
- Timestamp.

Acceptance criteria:

- History terhubung dengan endpoint.
- Data dapat dipaginasi.
- Data hanya dapat diakses pemilik endpoint.
- Hasil pemeriksaan terbaru dapat ditampilkan.

## FR-13 — Status Detection

Status:

- PENDING.
- UP.
- DOWN.
- PAUSED.

Acceptance criteria:

- Status diperbarui berdasarkan hasil pemeriksaan.
- Status DOWN terjadi ketika request gagal atau validation gagal.
- Status PAUSED tidak menjalankan monitoring.
- Status terbaru ditampilkan di dashboard.

## FR-14 — Alert System

Description:

Mengirim email ketika endpoint mengalami perubahan status.

Acceptance criteria:

- Alert hanya dikirim untuk endpoint milik pengguna.
- Alert DOWN dikirim ketika status berubah dari UP menjadi DOWN.
- Alert recovery dikirim ketika DOWN berubah menjadi UP.
- Alert tidak dikirim berulang pada setiap failed check.
- Pengiriman gagal dapat di-retry secara terbatas.
- Pengiriman email tidak menghambat monitoring worker.

## FR-15 — Monitoring Configuration

Pengguna dapat mengatur:

- Interval.
- Timeout.
- Expected status.
- HTTP method.
- Request headers.
- Request body.
- Validation rules.

Acceptance criteria:

- Konfigurasi divalidasi.
- Konfigurasi tersimpan.
- Perubahan diterapkan ke jadwal monitoring berikutnya.

## FR-16 — Manual Check

Pengguna dapat menjalankan pemeriksaan secara manual.

Acceptance criteria:

- Manual check masuk queue.
- Sistem tidak menjalankan request secara langsung di browser.
- Hasil dapat dilihat setelah worker menyelesaikan pekerjaan.
- Request manual dibatasi rate-nya.

## FR-17 — Endpoint Ownership

Acceptance criteria:

- Setiap endpoint terhubung dengan user.
- User hanya dapat membaca endpoint sendiri.
- User hanya dapat memperbarui endpoint sendiri.
- User tidak dapat menghapus endpoint user lain.
- Semua API memeriksa authorization.

---

# 7. NON-FUNCTIONAL REQUIREMENTS

## 7.1 Performance

- Dashboard initial load target di bawah 3 detik.
- CRUD API target di bawah 500 ms dalam kondisi normal.
- Monitoring dijalankan melalui background worker.
- Query database harus menggunakan pagination.
- Monitoring history memiliki index yang sesuai.
- Response body memiliki batas ukuran.

## 7.2 Reliability

- BullMQ digunakan untuk retry dan job management.
- Job dibuat secara idempotent.
- Worker dapat dijalankan ulang.
- Database transaction digunakan untuk perubahan data terkait.
- Job yang gagal harus dapat diobservasi.
- Queue tidak boleh kehilangan konfigurasi monitoring secara permanen.

## 7.3 Security

- Authentication wajib untuk dashboard.
- Authorization berdasarkan user ownership.
- Validasi input menggunakan Zod.
- Password menggunakan secure hashing.
- Rate limiting pada API.
- Environment secrets tidak disimpan di repository.
- SSRF protection wajib pada monitoring engine.

## 7.4 Scalability

- Worker dapat dijalankan sebagai proses terpisah.
- Queue mendukung concurrency terbatas.
- Database query dioptimalkan.
- Monitoring history dapat di-retain sesuai kebijakan.
- Penambahan worker tidak memerlukan perubahan arsitektur utama.

## 7.5 Maintainability

- TypeScript strict mode.
- Separation of concerns.
- Reusable components.
- Service-based business logic.
- Centralized validation.
- Consistent error handling.
- Dokumentasi teknis.

## 7.6 Accessibility

- Semantic HTML.
- Keyboard navigation.
- Accessible form labels.
- Sufficient color contrast.
- Status tidak hanya dibedakan menggunakan warna.

## 7.7 Compatibility

Target browser:

- Chrome.
- Edge.
- Firefox.
- Safari.

Target responsive:

- Desktop.
- Tablet.
- Mobile.

## 7.8 Privacy

- User data terisolasi.
- Credential endpoint dienkripsi apabila disimpan.
- Sensitive headers tidak ditampilkan dalam UI.
- Monitoring history memiliki retention policy.
- Email alert tidak membocorkan data sensitif.

---

# 8. APPLICATION STRUCTURE & NAVIGATION

## 8.1 Public Routes

| Route     | Description   |
| --------- | ------------- |
| /         | Landing page  |
| /login    | Login         |
| /register | Registration  |
| /pricing  | Pricing       |
| /docs     | Documentation |

## 8.2 Dashboard Routes

| Route                          | Description         |
| ------------------------------ | ------------------- |
| /dashboard                     | Monitoring overview |
| /dashboard/endpoints           | Endpoint list       |
| /dashboard/endpoints/new       | Create endpoint     |
| /dashboard/endpoints/[id]      | Endpoint details    |
| /dashboard/endpoints/[id]/edit | Edit endpoint       |
| /dashboard/settings            | User settings       |

## 8.3 Navigation

Main sidebar:

- Overview.
- Endpoints.
- Settings.
- Documentation.

Topbar:

- Page title.
- Notification indicator.
- User profile.
- Logout.

## 8.4 Reusable Components

- AppSidebar.
- AppHeader.
- PageHeader.
- StatCard.
- EndpointCard.
- EndpointTable.
- StatusBadge.
- ResponseTimeChart.
- HistoryTable.
- EndpointForm.
- ConfirmDialog.
- EmptyState.
- LoadingState.
- ErrorState.
- Pagination.

---

# 9. USER FLOW

## 9.1 First-Time User

1. Open landing page.
2. Click Get Started.
3. Register account.
4. Login.
5. Redirect to dashboard.
6. See empty state.
7. Click Add Endpoint.
8. Enter endpoint configuration.
9. Save endpoint.
10. System schedules first check.
11. Worker executes monitoring.
12. Dashboard displays monitoring result.

## 9.2 Monitoring Flow

1. User opens endpoint details.
2. System loads endpoint information.
3. System displays current status.
4. System displays response time.
5. System loads history.
6. User can manually trigger check.
7. Result appears after worker completion.

## 9.3 Failure Notification Flow

1. Scheduled check executes.
2. Endpoint returns an invalid response.
3. Worker marks check as failed.
4. System evaluates status transition.
5. Incident status is updated.
6. Alert job is queued.
7. Email notification is sent.
8. User can inspect endpoint history.

---

# 10. UI/UX REQUIREMENTS

## 10.1 Design Direction

Gunakan gaya visual:

**Premium Developer SaaS Dashboard.**

Karakteristik:

- Clean.
- Modern.
- Minimalist.
- Professional.
- High readability.
- Strong information hierarchy.

## 10.2 Color System

Rekomendasi:

| Token            | Color   |
| ---------------- | ------- |
| Background       | #0B1120 |
| Surface          | #111827 |
| Elevated Surface | #1E293B |
| Primary          | #6366F1 |
| Primary Hover    | #4F46E5 |
| Success          | #10B981 |
| Danger           | #EF4444 |
| Warning          | #F59E0B |
| Text Primary     | #F8FAFC |
| Text Secondary   | #94A3B8 |
| Border           | #334155 |

Gunakan dark theme sebagai design direction awal dengan dukungan light theme jika tidak menambah kompleksitas berlebihan.

## 10.3 Typography

Gunakan:

- Inter atau Geist Sans.
- Consistent font scale.
- Clear headings.
- Readable body text.
- Tabular numerals untuk angka monitoring.

## 10.4 Dashboard Layout

Overview:

- Top navigation.
- Sidebar.
- Main content.
- Statistics cards.
- Endpoint status summary.
- Recent incidents.
- Response time overview.

## 10.5 Responsive Behavior

Desktop:

- Full sidebar.
- Multi-column cards.
- Full data table.

Tablet:

- Collapsible sidebar.
- Reduced grid columns.

Mobile:

- Compact navigation.
- Single-column layout.
- Responsive tables.
- Scrollable charts jika diperlukan.

## 10.6 UI States

Setiap fitur harus memiliki:

Loading:

- Skeleton.
- Progress indicator.

Empty:

- Informasi belum tersedia.
- CTA untuk menambahkan endpoint.

Error:

- Pesan yang mudah dipahami.
- Retry action jika relevan.

Success:

- Confirmation feedback.
- Updated interface.

---

# 11. ERROR HANDLING

| Error                | Cause                      | Application Response                       |
| -------------------- | -------------------------- | ------------------------------------------ |
| Invalid URL          | URL tidak valid            | Validation error                           |
| Unauthorized         | Session tidak tersedia     | Redirect login / 401                       |
| Forbidden            | Bukan pemilik endpoint     | 403                                        |
| Endpoint not found   | Data tidak tersedia        | 404                                        |
| Request timeout      | Target lambat              | Mark check failed                          |
| DNS failure          | Domain tidak ditemukan     | Record network error                       |
| Connection refused   | Target menolak koneksi     | Record connection error                    |
| HTTP 500             | Server target error        | Record HTTP failure                        |
| HTTP 404             | Resource tidak ditemukan   | Record HTTP failure sesuai expected status |
| Header mismatch      | Header tidak sesuai        | Validation failure                         |
| Body mismatch        | Response body tidak sesuai | Validation failure                         |
| Redis unavailable    | Queue tidak tersedia       | Log error dan fail safely                  |
| Database unavailable | Database error             | Return service error                       |
| Email failure        | Provider email error       | Retry alert job                            |
| Rate limit exceeded  | Terlalu banyak request     | HTTP 429                                   |

Error message yang ditampilkan kepada pengguna harus aman dan tidak mengandung stack trace atau secret.

---

# 12. TECHNICAL ARCHITECTURE

## 12.1 Architecture Decision

Gunakan:

**Modular Monolith + Dedicated Background Worker.**

Tidak menggunakan microservices pada MVP.

Alasannya:

- Project dikembangkan solo developer.
- Monitoring membutuhkan proses terjadwal.
- Request monitoring harus berjalan di background.
- Next.js serverless runtime bukan tempat ideal untuk scheduler dan worker yang berjalan terus-menerus.
- Worker dapat di-scale secara terpisah tanpa membangun microservices penuh.

## 12.2 Architecture Diagram

```text
                 USER BROWSER
                       |
                       v
                NEXT.JS APP
             (Frontend + API)
                       |
             -------------------
             |                 |
             v                 v
        BETTER AUTH         SERVICES
             |                 |
             |                 v
             |            PRISMA ORM
             |                 |
             v                 v
                  POSTGRESQL
                       |
                       |
               SCHEDULER SERVICE
                       |
                       v
                  REDIS QUEUE
                       |
                       v
               NODE.JS WORKER
                       |
               ----------------
               |              |
               v              v
          TARGET API       EMAIL SERVICE
               |
               v
          CHECK RESULT
               |
               v
           POSTGRESQL
```

## 12.3 Layer Responsibilities

### Presentation Layer

Tanggung jawab:

- Rendering pages.
- Dashboard UI.
- Forms.
- Tables.
- Charts.
- User interaction.

Technology:

Next.js App Router + React.

### Application Layer

Tanggung jawab:

- Request handling.
- Authentication.
- Authorization.
- Input validation.
- Calling application services.
- Response formatting.

Technology:

Next.js Route Handlers.

### Business Logic Layer

Tanggung jawab:

- Endpoint management.
- Monitoring configuration.
- Status transition.
- Validation rules.
- Alert decisions.
- Monitoring orchestration.

### Data Access Layer

Tanggung jawab:

- Database queries.
- Persistence.
- Transactions.
- Data retrieval.

Technology:

Prisma.

### Infrastructure Layer

Tanggung jawab:

- PostgreSQL.
- Redis.
- BullMQ.
- Email provider.
- Worker process.
- Logging.

## 12.4 Background Worker

Worker merupakan proses Node.js terpisah.

Tanggung jawab:

1. Menjalankan scheduled monitoring.
2. Mengambil job dari Redis.
3. Melakukan HTTP request.
4. Mengukur response time.
5. Memvalidasi hasil response.
6. Menyimpan check history.
7. Memperbarui endpoint status.
8. Menjadwalkan pemeriksaan selanjutnya.
9. Mengirim alert melalui queue terpisah.

Worker harus dapat dijalankan secara independen dari Next.js.

## 12.5 Monitoring Scheduler

Gunakan BullMQ Job Scheduler atau mekanisme repeatable scheduling yang sesuai dengan versi BullMQ yang dipilih.

Sebelum implementasi:

- Periksa dokumentasi versi dependency.
- Validasi API scheduler yang tersedia.
- Jangan mengasumsikan metode API lama masih berlaku.
- Pastikan satu endpoint tidak memiliki duplicate scheduled jobs.

Jadwal harus dikelola secara konsisten.

Perubahan interval, pause, resume, dan delete harus memperbarui konfigurasi scheduler.

## 12.6 Monitoring Engine

Monitoring engine harus mendukung:

- GET.
- POST.
- PUT.
- PATCH.
- DELETE.
- HEAD.

Metodologi:

1. Validasi target URL.
2. Validasi destination IP.
3. Jalankan request menggunakan HTTP client.
4. Gunakan timeout.
5. Batasi redirect.
6. Batasi response body.
7. Ukur request duration.
8. Validasi HTTP status.
9. Validasi headers.
10. Validasi body.
11. Simpan hasil.

Gunakan Node.js native Fetch atau library HTTP yang telah diverifikasi.

### Response Time

Gunakan `performance.now()` untuk pengukuran durasi.

Response time dihitung dari sebelum request dimulai sampai response body selesai diproses sesuai batas ukuran.

Catat bahwa angka ini merupakan application-level HTTP response duration, bukan network ping.

### Monitoring Status

```text
PENDING
   |
   v
CHECK RUNNING
   |
   +---- SUCCESS ----> UP
   |
   +---- FAILURE ----> DOWN
```

Status PAUSED dikelola melalui konfigurasi monitoring.

### SSRF Protection

Ini merupakan kebutuhan keamanan kritis.

Karena pengguna dapat memasukkan URL sendiri, monitoring engine berpotensi digunakan untuk menyerang jaringan internal.

Wajib:

- Hanya menerima HTTP dan HTTPS.
- Memblokir localhost.
- Memblokir private IPv4.
- Memblokir private IPv6.
- Memblokir link-local addresses.
- Memblokir cloud metadata addresses.
- Memvalidasi hasil DNS resolution.
- Memvalidasi setiap redirect.
- Memblokir redirect menuju private IP.
- Membatasi jumlah redirect.
- Mempertimbangkan DNS rebinding.
- Tidak meneruskan internal credentials.
- Menerapkan network-level egress restrictions.

Validasi hostname saja tidak cukup.

Untuk production, gunakan egress firewall atau isolasi jaringan worker agar target API tidak dapat mengakses layanan internal.

## 12.7 API Architecture

Gunakan REST API melalui Next.js Route Handlers.

Contoh:

```text
/api/auth/*
/api/dashboard
/api/endpoints
/api/endpoints/[id]
/api/endpoints/[id]/checks
/api/endpoints/[id]/history
/api/endpoints/[id]/pause
/api/endpoints/[id]/resume
/api/endpoints/[id]/manual-check
/ api/settings
```

Catatan: hapus spasi pada contoh route `/api/settings` saat implementasi.

Semua API harus:

- Memvalidasi request.
- Memeriksa authentication.
- Memeriksa ownership.
- Menggunakan consistent response format.
- Menangani error secara aman.

## 12.8 Deployment Architecture

MVP deployment:

```text
VPS
 |
 +-- Caddy / Nginx
 |
 +-- Next.js Application
 |
 +-- Node.js Worker
 |
 +-- Scheduler Process
 |
 +-- PostgreSQL
 |
 +-- Redis
```

Semua service dapat dikelola melalui Docker Compose.

Scheduler dapat digabung dengan worker sebagai satu proses pada MVP apabila desain scheduling sudah aman, tetapi tanggung jawab kode tetap dipisahkan.

Gunakan managed PostgreSQL atau Redis apabila biaya dan kebutuhan operasional mengharuskannya.

---

# 13. DATA MODEL

## 13.1 User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 13.2 Endpoint

```typescript
interface Endpoint {
  id: string;
  userId: string;
  name: string;
  url: string;
  method: HttpMethod;
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatus: number[];
  status: MonitorStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 13.3 Endpoint Configuration

```typescript
interface EndpointConfiguration {
  headers?: Record<string, string>;
  body?: string;
  headerRules?: HeaderRule[];
  bodyRules?: BodyRule[];
}
```

Sensitive request headers harus dienkripsi atau dikelola menggunakan mekanisme secret storage yang sesuai.

## 13.4 Monitor Check

```typescript
interface MonitorCheck {
  id: string;
  endpointId: string;
  status: "SUCCESS" | "FAILED";
  httpStatus: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: Date;
}
```

## 13.5 Alert

```typescript
interface Alert {
  id: string;
  endpointId: string;
  userId: string;
  type: "DOWN" | "RECOVERY";
  status: "PENDING" | "SENT" | "FAILED";
  createdAt: Date;
}
```

## 13.6 Database Relationships

```text
User
 |
 +---- Endpoint
         |
         +---- EndpointConfiguration
         |
         +---- MonitorCheck
         |
         +---- Alert
```

## 13.7 PostgreSQL Tables

- users / Better Auth managed tables.
- sessions / Better Auth managed tables.
- accounts / Better Auth managed tables.
- endpoints.
- endpoint_configurations.
- monitor_checks.
- alerts.

Gunakan Prisma migrations.

## 13.8 Indexing

Tambahkan index untuk:

- endpoints.userId.
- endpoints.status.
- monitor_checks.endpointId.
- monitor_checks.checkedAt.
- alerts.userId.
- alerts.createdAt.

Pertimbangkan composite index untuk query history berdasarkan endpoint dan waktu.

## 13.9 Data Retention

Asumsi awal:

- Monitoring history: 30 hari.
- Alert history: 90 hari.
- User data: selama akun aktif.

Retention dapat diubah berdasarkan kebutuhan bisnis.

Jangan melakukan penghapusan otomatis sebelum memastikan kebijakan retention dan backup sudah tersedia.

---

# 14. SECURITY & PRIVACY

## 14.1 Authentication

- Gunakan Better Auth.
- Session cookie harus HttpOnly.
- Gunakan Secure cookie pada production.
- Gunakan SameSite yang sesuai.
- Password hashing dikelola authentication library.
- Terapkan email verification apabila diperlukan sebelum production launch.

## 14.2 Authorization

Setiap operasi endpoint harus memverifikasi user ownership.

Jangan hanya mengandalkan ID endpoint.

Contoh:

```typescript
const endpoint = await prisma.endpoint.findFirst({
  where: {
    id: endpointId,
    userId: session.user.id,
  },
});
```

## 14.3 Input Validation

Gunakan Zod.

Validasi:

- URL.
- HTTP method.
- Interval.
- Timeout.
- Headers.
- Body.
- Expected status.
- Validation rules.

## 14.4 Rate Limiting

Terapkan rate limiting untuk:

- Authentication.
- Endpoint creation.
- Manual check.
- API requests.
- Repeated failed login.
- Public routes.

## 14.5 SSRF Security

SSRF merupakan risiko utama aplikasi.

Wajib menerapkan:

- DNS validation.
- IP validation.
- Redirect validation.
- Egress restrictions.
- Request timeout.
- Response size limit.
- Concurrency limit.

Jangan mengizinkan endpoint monitoring mengakses jaringan internal.

## 14.6 Secrets Management

Environment variables:

```env
DATABASE_URL=
REDIS_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
APP_URL=
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM=
```

Jangan commit `.env`.

Sediakan `.env.example` tanpa nilai secret.

## 14.7 Logging

Jangan mencatat:

- Password.
- Authorization header.
- API keys.
- Sensitive request body.
- Session token.

Gunakan structured logging.

---

# 15. SUCCESS CRITERIA

MVP dinyatakan selesai jika:

- [ ] Registration berfungsi.
- [ ] Login berfungsi.
- [ ] Logout berfungsi.
- [ ] Dashboard dapat dibuka.
- [ ] Endpoint dapat dibuat.
- [ ] Endpoint dapat diedit.
- [ ] Endpoint dapat dihapus.
- [ ] Monitoring berjalan otomatis.
- [ ] HTTP status dapat diperiksa.
- [ ] Response time tercatat.
- [ ] Header validation berjalan.
- [ ] Body validation berjalan.
- [ ] Monitoring history tersimpan.
- [ ] Status UP/DOWN diperbarui.
- [ ] Alert email berfungsi.
- [ ] Manual check berfungsi.
- [ ] Authorization berjalan.
- [ ] SSRF protection berjalan.
- [ ] Rate limiting tersedia.
- [ ] Responsive UI berfungsi.
- [ ] Production deployment berhasil.
- [ ] Backup database dikonfigurasi.
- [ ] Critical tests berhasil.

---

# 16. RISKS & TECHNICAL CONSTRAINTS

| Risk                   | Impact                  | Mitigation                          |
| ---------------------- | ----------------------- | ----------------------------------- |
| SSRF                   | Critical security issue | IP validation + egress restrictions |
| Redis downtime         | Monitoring berhenti     | Monitoring dan recovery queue       |
| Worker crash           | Jobs tertunda           | Process restart + job recovery      |
| Duplicate jobs         | Excessive requests      | Idempotent scheduling               |
| Target API rate limit  | Monitoring gagal        | Configurable intervals              |
| Large response         | Memory exhaustion       | Response size limits                |
| DNS rebinding          | Internal network access | Resolve and validate destination    |
| Email provider failure | Alerts delayed          | Retry queue                         |
| Database growth        | Storage cost            | Retention policy                    |
| High concurrency       | VPS overload            | Worker concurrency limits           |
| Dependency changes     | Compatibility issues    | Version pinning and documentation   |

---

# PART B — SEQUENTIAL DEVELOPMENT PLAYBOOK

# DEVELOPMENT EXECUTION RULES

Development dilakukan melalui 10 phase.

Setiap phase wajib:

1. Membaca PRD.
2. Memeriksa kondisi repository.
3. Mengerjakan scope phase.
4. Menjalankan testing.
5. Memverifikasi acceptance criteria.
6. Melaporkan hasil.
7. Menunggu persetujuan developer.
8. Membuat Git checkpoint.

Jangan melanjutkan otomatis ke phase berikutnya.

---

# PHASE 1 — ENVIRONMENT & PROJECT BOOTSTRAP

## 1. Phase Objective

Mempersiapkan development environment dan membuat fondasi project Next.js.

## 2. Scope of Work

- Setup Git.
- Setup Next.js.
- Setup TypeScript.
- Setup Tailwind CSS.
- Setup shadcn/ui.
- Setup ESLint.
- Setup environment files.
- Setup dependencies dasar.
- Verifikasi aplikasi berjalan.

Belum mengimplementasikan fitur utama.

## 3. Detailed Implementation Steps

### Step 1 — Environment Verification

Pastikan tersedia:

- Node.js LTS.
- npm.
- Git.
- VS Code.
- Browser modern.

Verifikasi:

```bash
node -v
npm -v
git --version
```

### Step 2 — Create Project

```bash
npx create-next-app@latest orderinbox
```

Pilih:

- TypeScript: Yes.
- ESLint: Yes.
- Tailwind CSS: Yes.
- src directory: Yes.
- App Router: Yes.
- Import alias: @/\*.

### Step 3 — Initialize Git

```bash
cd orderinbox
git init
```

### Step 4 — Install UI Dependencies

```bash
npx shadcn@latest init
```

Tambahkan komponen yang diperlukan secara bertahap.

### Step 5 — Install Base Dependencies

```bash
npm install zod react-hook-form @hookform/resolvers
```

Jangan menambahkan seluruh dependency backend pada fase ini.

### Step 6 — Setup Environment

Buat:

```text
.env.example
.gitignore
```

Pastikan `.env.local` masuk ke `.gitignore`.

### Step 7 — Run Development Server

```bash
npm run dev
```

### Step 8 — Verify Build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Sesuaikan script apabila template Next.js yang dihasilkan menggunakan nama berbeda.

## 4. Required Commands

```bash
node -v
npm -v
git --version

npx create-next-app@latest orderinbox

cd orderinbox

git init

npx shadcn@latest init

npm install zod react-hook-form @hookform/resolvers

npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Fullstack Developer.

Project: OrderInbox
Dokumen utama: PROJECT_PRD_AND_PLAYBOOK.md

Kerjakan PHASE 1 — Environment & Project Bootstrap.

Tugas:

1. Baca PRD dan pahami scope MVP.
2. Periksa kondisi repository.
3. Verifikasi setup Next.js App Router.
4. Verifikasi TypeScript dan Tailwind.
5. Setup shadcn/ui.
6. Setup ESLint.
7. Install hanya dependency dasar yang dibutuhkan.
8. Siapkan .env.example.
9. Pastikan .gitignore aman.
10. Pastikan project dapat dijalankan.

Batasan:

- Jangan membuat business logic.
- Jangan membuat backend monitoring.
- Jangan membuat database schema.
- Jangan membuat fitur dashboard.
- Jangan mengubah tech stack.
- Jangan menambahkan dependency tanpa alasan.

Expected files:

- package.json
- tsconfig.json
- next.config.*
- components.json
- .env.example
- .gitignore
- src/app/*
- Struktur dasar project.

Jalankan lint, typecheck, dan production build.

Laporkan:
- File yang dibuat.
- File yang diubah.
- Dependency.
- Testing aktual.
- Masalah yang ditemukan.

Jangan lanjut ke Phase 2.
```

## 6. Expected Deliverables

- Next.js application.
- TypeScript configured.
- Tailwind configured.
- shadcn/ui initialized.
- Git initialized.
- Environment template.
- Working development server.

## 7. Acceptance Criteria

- [ ] Next.js berjalan.
- [ ] TypeScript berjalan.
- [ ] Tailwind berfungsi.
- [ ] shadcn/ui berhasil diinisialisasi.
- [ ] Git repository tersedia.
- [ ] Environment template tersedia.
- [ ] Lint berhasil.
- [ ] Typecheck berhasil.
- [ ] Build berhasil.

## 8. Testing Requirements

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 1: project bootstrap"
```

---

# PHASE 2 — TECHNICAL PLANNING & ARCHITECTURE

## 1. Phase Objective

Membuat perencanaan teknis lengkap berdasarkan PRD.

Output utama:

`TECHNICAL_PLAN.md`

## 2. Scope of Work

- Analisis PRD.
- Final architecture.
- Folder structure.
- Database design.
- API design.
- Worker architecture.
- Queue architecture.
- Scheduler strategy.
- Authentication strategy.
- SSRF security strategy.
- Deployment planning.
- Dependency planning.
- Technical risk assessment.

## 3. Detailed Implementation Steps

### Step 1 — Analyze Product Requirements

Identifikasi:

- Core modules.
- Dependencies.
- Data flow.
- User flows.
- System constraints.

### Step 2 — Finalize Architecture

Tetapkan:

```text
Next.js Application
       |
       v
Application Services
       |
       v
Prisma + PostgreSQL
       |
       v
Redis + BullMQ
       |
       v
Node.js Worker
```

### Step 3 — Define Folder Structure

Target:

```text
orderinbox/
|
+-- docs/
|
+-- prisma/
|
+-- src/
|   |
|   +-- app/
|   |   +-- (marketing)/
|   |   +-- (auth)/
|   |   +-- (dashboard)/
|   |   +-- api/
|   |
|   +-- components/
|   |   +-- ui/
|   |   +-- layout/
|   |   +-- dashboard/
|   |   +-- endpoints/
|   |
|   +-- features/
|   |   +-- auth/
|   |   +-- endpoints/
|   |   +-- monitoring/
|   |   +-- alerts/
|   |
|   +-- lib/
|   |   +-- auth/
|   |   +-- db/
|   |   +-- validation/
|   |   +-- utils/
|   |
|   +-- services/
|   |
|   +-- types/
|
+-- worker/
|   +-- src/
|       +-- processors/
|       +-- queues/
|       +-- scheduler/
|       +-- monitoring/
|       +-- services/
|       +-- security/
|       +-- utils/
|
+-- tests/
|
+-- docker/
|
+-- package.json
+-- docker-compose.yml
```

Struktur dapat disesuaikan berdasarkan kebutuhan implementasi.

### Step 4 — Database Planning

Tentukan:

- User.
- Endpoint.
- EndpointConfiguration.
- MonitorCheck.
- Alert.

Buat entity relationship dan index strategy.

### Step 5 — API Planning

Definisikan:

- Endpoint CRUD.
- Manual check.
- History.
- Dashboard.
- Authentication.

Tentukan request dan response contracts.

### Step 6 — Worker Planning

Dokumentasikan:

- Queue names.
- Job payloads.
- Retry strategy.
- Concurrency.
- Scheduling.
- Idempotency.
- Failure handling.

### Step 7 — Security Planning

Buat SSRF threat model.

Dokumentasikan:

- Blocked IP ranges.
- DNS validation.
- Redirect validation.
- Egress controls.
- Response limits.
- Timeout limits.

### Step 8 — Deployment Planning

Tentukan:

- VPS requirements.
- Docker services.
- Database backup.
- Redis persistence.
- Reverse proxy.
- HTTPS.
- Worker restart strategy.

## 4. Required Commands

```bash
mkdir docs
mkdir worker
mkdir tests
mkdir docker
```

Gunakan command sesuai OS apabila diperlukan.

Tidak perlu menginstal dependency baru pada phase ini kecuali terdapat kebutuhan yang telah disetujui.

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Software Architect.

Project: OrderInbox
Dokumen utama: PROJECT_PRD_AND_PLAYBOOK.md

Kerjakan PHASE 2 — Technical Planning & Architecture.

Analisis seluruh PRD dan hasil Phase 1.

Buat TECHNICAL_PLAN.md yang mencakup:

1. Final system architecture.
2. Application architecture.
3. Folder structure.
4. Database ERD.
5. Prisma model planning.
6. API endpoint specification.
7. Authentication architecture.
8. Worker architecture.
9. BullMQ queue design.
10. Monitoring scheduler.
11. Monitoring engine.
12. SSRF protection strategy.
13. Error handling.
14. Logging.
15. Environment variables.
16. Deployment architecture.
17. Dependency list.
18. Technical risks.

Pastikan:

- Next.js menangani frontend dan CRUD API.
- Worker merupakan Node.js process terpisah.
- PostgreSQL menyimpan persistent data.
- Redis menangani queue.
- BullMQ menangani background jobs.
- Monitoring tidak berjalan di browser.
- SSRF protection menjadi prioritas.
- Tidak menggunakan microservices.
- Tidak menambahkan teknologi tanpa kebutuhan.

Jangan implementasikan fitur utama.

Jangan membuat database migration atau business logic.

Output:
TECHNICAL_PLAN.md

Pastikan seluruh keputusan konsisten dengan PRD.

Laporkan hasil dan tunggu persetujuan.
Jangan lanjut ke Phase 3.
```

## 6. Expected Deliverables

- `TECHNICAL_PLAN.md`.
- Architecture diagram.
- Database ERD.
- API specification.
- Worker design.
- Dependency decisions.
- Security strategy.

## 7. Acceptance Criteria

- [ ] Architecture terdokumentasi.
- [ ] Folder structure ditentukan.
- [ ] Database design tersedia.
- [ ] API contracts tersedia.
- [ ] Worker architecture jelas.
- [ ] Queue strategy jelas.
- [ ] SSRF strategy terdokumentasi.
- [ ] Deployment strategy tersedia.
- [ ] Tidak ada teknologi tanpa alasan.

## 8. Testing Requirements

Tidak ada feature testing.

Lakukan consistency review terhadap PRD dan technical plan.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 2: technical architecture"
```

---

# PHASE 3 — UI/UX PLANNING & DESIGN SYSTEM

## 1. Phase Objective

Menentukan design system dan UX sebelum implementasi frontend.

Output utama:

`UI_UX_GUIDE.md`

## 2. Scope of Work

- Design direction.
- Color system.
- Typography.
- Spacing.
- Layout.
- Navigation.
- Dashboard wireframe.
- Endpoint list.
- Endpoint details.
- Forms.
- Component inventory.
- Responsive design.
- UI states.

## 3. Detailed Implementation Steps

### Step 1 — Define Visual Direction

Gunakan:

Premium Developer SaaS Dashboard.

### Step 2 — Define Color Tokens

```css
:root {
  --background: #0b1120;
  --surface: #111827;
  --surface-elevated: #1e293b;
  --primary: #6366f1;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: #334155;
}
```

Token final harus disesuaikan dengan implementasi shadcn/ui.

### Step 3 — Define Typography

Gunakan Inter atau Geist.

Tetapkan:

- Heading sizes.
- Body sizes.
- Labels.
- Table typography.
- Numeric typography.

### Step 4 — Define Layout

Dashboard:

- Sidebar.
- Topbar.
- Main content.
- Statistics.
- Endpoint table.
- Incident section.

### Step 5 — Define Core Screens

Buat spesifikasi:

1. Landing page.
2. Login.
3. Register.
4. Dashboard.
5. Endpoint list.
6. Create endpoint.
7. Edit endpoint.
8. Endpoint details.
9. Settings.

### Step 6 — Define Component Library

Dokumentasikan komponen reusable.

### Step 7 — Define Responsive Rules

Tentukan breakpoint dan behavior desktop, tablet, mobile.

### Step 8 — Define UI States

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Paused.
- Monitoring.

## 4. Required Commands

Tidak memerlukan dependency baru.

Buat:

```text
docs/UI_UX_GUIDE.md
```

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior UI/UX Designer dan Frontend Architect.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md

Kerjakan PHASE 3 — UI/UX Planning & Design System.

Buat UI_UX_GUIDE.md.

Tentukan:

1. Visual direction.
2. Color palette.
3. Design tokens.
4. Typography.
5. Spacing system.
6. Dashboard layout.
7. Navigation.
8. Page wireframes.
9. Reusable components.
10. Responsive behavior.
11. Loading states.
12. Empty states.
13. Error states.
14. Success states.
15. Accessibility guidelines.

Gunakan gaya premium developer SaaS.

Prioritaskan:

- Readability.
- Strong visual hierarchy.
- Professional appearance.
- Consistent spacing.
- Clear status indicators.
- Responsive layout.

Hindari:

- Terlalu banyak warna.
- Typography terlalu kecil.
- Card berlebihan.
- Decorative elements yang tidak memiliki fungsi.
- Layout yang membingungkan.

Jangan implementasikan halaman atau business logic.

Output:
docs/UI_UX_GUIDE.md

Pastikan design sesuai dengan kebutuhan monitoring API.

Laporkan hasil.
Jangan lanjut ke Phase 4.
```

## 6. Expected Deliverables

- `UI_UX_GUIDE.md`.
- Design tokens.
- Page specifications.
- Component inventory.
- Responsive guidelines.

## 7. Acceptance Criteria

- [ ] Semua halaman utama terdokumentasi.
- [ ] Color palette tersedia.
- [ ] Typography ditentukan.
- [ ] Navigation ditentukan.
- [ ] Component inventory tersedia.
- [ ] Responsive behavior jelas.
- [ ] UI states ditentukan.
- [ ] Sesuai PRD.

## 8. Testing Requirements

Lakukan design consistency review.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 3: ui ux planning"
```

---

# PHASE 4 — FRONTEND FOUNDATION & APPLICATION SHELL

## 1. Phase Objective

Membangun fondasi frontend dan application shell.

## 2. Scope of Work

- Final folder structure.
- Global styles.
- Theme.
- Sidebar.
- Header.
- Navigation.
- Layout.
- Reusable UI components.
- Basic routing.
- Responsive application shell.

Belum mengimplementasikan monitoring business logic.

## 3. Detailed Implementation Steps

### Step 1 — Review Documents

Baca:

- PRD.
- TECHNICAL_PLAN.md.
- UI_UX_GUIDE.md.

### Step 2 — Implement Folder Structure

Buat struktur sesuai technical plan.

### Step 3 — Setup Global Theme

Implementasikan design tokens.

### Step 4 — Implement Application Layout

Buat:

- Dashboard layout.
- Sidebar.
- Topbar.
- Main content wrapper.

### Step 5 — Implement Navigation

Tambahkan navigation links.

### Step 6 — Implement Reusable Components

Buat:

- Button.
- Card.
- Badge.
- Dialog.
- Input.
- Select.
- Table.
- Dropdown.
- Skeleton.
- Empty state.

Gunakan shadcn/ui sebagai dasar.

### Step 7 — Implement Basic Pages

Buat placeholder:

- Dashboard.
- Endpoint list.
- Endpoint detail.
- Settings.
- Login.
- Register.

### Step 8 — Responsive Testing

Verifikasi desktop, tablet, dan mobile.

## 4. Required Commands

```bash
npx shadcn@latest add button card badge input
npx shadcn@latest add dialog dropdown-menu
npx shadcn@latest add table skeleton select
```

Tambahkan komponen lain hanya apabila dibutuhkan.

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Frontend Developer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- docs/UI_UX_GUIDE.md

Kerjakan PHASE 4 — Frontend Foundation & Application Shell.

Implementasikan:

1. Final folder structure.
2. Global styles.
3. Design tokens.
4. Theme.
5. Dashboard layout.
6. Sidebar.
7. Header.
8. Navigation.
9. Reusable UI components.
10. Basic route structure.
11. Responsive behavior.

Buat halaman placeholder untuk seluruh route utama.

Gunakan shadcn/ui dan Tailwind CSS.

Pastikan desain konsisten dengan UI_UX_GUIDE.md.

Batasan:

- Jangan implementasikan authentication logic.
- Jangan implementasikan database.
- Jangan implementasikan monitoring.
- Jangan implementasikan API integration.
- Jangan menggunakan production mock data.
- Jangan membuat business logic.

Mock content hanya diperbolehkan untuk visual placeholder.

Jalankan lint, typecheck, dan build.

Laporkan seluruh file dan hasil testing.

Jangan lanjut ke Phase 5.
```

## 6. Expected Deliverables

- Application shell.
- Sidebar.
- Header.
- Navigation.
- Reusable components.
- Basic pages.
- Responsive layout.

## 7. Acceptance Criteria

- [ ] Dashboard layout berfungsi.
- [ ] Navigation berfungsi.
- [ ] Reusable components tersedia.
- [ ] Design system diterapkan.
- [ ] Responsive layout berfungsi.
- [ ] Tidak ada broken routes.
- [ ] Build berhasil.

## 8. Testing Requirements

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Manual testing seluruh route.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 4: frontend foundation"
```

---

# PHASE 5 — CORE FRONTEND FEATURE DEVELOPMENT

## 1. Phase Objective

Mengimplementasikan seluruh core frontend UI menggunakan mock service sementara.

## 2. Scope of Work

- Dashboard UI.
- Endpoint list.
- Endpoint creation.
- Endpoint editing.
- Endpoint details.
- Monitoring history.
- Status indicators.
- Charts.
- Forms.
- Validation.
- Loading states.
- Empty states.
- Error states.
- Responsive interaction.

## 3. Detailed Implementation Steps

### Step 1 — Dashboard

Implementasikan:

- Total endpoints.
- UP endpoints.
- DOWN endpoints.
- Average response time.
- Recent incidents.

### Step 2 — Endpoint List

Implementasikan:

- Table.
- Status badge.
- Search.
- Filter.
- Pagination UI.
- Action menu.

### Step 3 — Endpoint Form

Field:

- Name.
- URL.
- Method.
- Interval.
- Timeout.
- Expected HTTP status.
- Headers.
- Body.
- Validation rules.

### Step 4 — Endpoint Details

Tampilkan:

- Current status.
- URL.
- HTTP method.
- Response time.
- Last check.
- Monitoring history.
- Response time chart.

### Step 5 — Form Validation

Gunakan React Hook Form + Zod.

### Step 6 — Mock Service

Buat mock data terisolasi:

```text
src/features/endpoints/mocks/
src/features/monitoring/mocks/
```

Jangan mencampur mock dengan production service.

### Step 7 — UI States

Implementasikan semua state.

### Step 8 — State Management

Gunakan React state untuk kebutuhan lokal.

Gunakan Zustand hanya apabila state memang perlu dibagikan lintas komponen.

## 4. Required Commands

```bash
npm install recharts
```

Jika chart dibutuhkan.

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Frontend Engineer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- docs/UI_UX_GUIDE.md

Kerjakan PHASE 5 — Core Frontend Feature Development.

Implementasikan seluruh core frontend features:

1. Dashboard statistics.
2. Endpoint list.
3. Endpoint creation form.
4. Endpoint edit form.
5. Endpoint details.
6. Status indicators.
7. Monitoring history table.
8. Response time chart.
9. Search and filters.
10. Form validation.
11. Loading states.
12. Empty states.
13. Error states.
14. Success feedback.

Gunakan mock service yang terisolasi.

Semua mock harus diberi penanda jelas.

Jangan membuat backend atau database.

Jangan membuat monitoring engine.

Jangan menganggap mock sebagai production feature.

Gunakan React Hook Form dan Zod.

Gunakan Zustand hanya apabila benar-benar diperlukan.

Pastikan UI konsisten dengan design guide.

Jalankan testing dan build.

Laporkan hasil.
Jangan lanjut ke Phase 6.
```

## 6. Expected Deliverables

- Dashboard frontend.
- Endpoint management UI.
- Endpoint forms.
- Endpoint detail page.
- Monitoring charts.
- Mock service.
- Form validation.

## 7. Acceptance Criteria

- [ ] Dashboard menampilkan statistik.
- [ ] Endpoint list berfungsi secara visual.
- [ ] Create form berfungsi.
- [ ] Edit form berfungsi.
- [ ] Endpoint detail tersedia.
- [ ] Chart dapat ditampilkan.
- [ ] Form validation berfungsi.
- [ ] UI states tersedia.
- [ ] Mock terisolasi.
- [ ] Responsive layout berfungsi.

## 8. Testing Requirements

- Manual UI testing.
- Form validation testing.
- Responsive testing.
- Typecheck.
- Lint.
- Production build.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 5: core frontend features"
```

---

# PHASE 6 — BACKEND & CORE BUSINESS LOGIC

## 1. Phase Objective

Mengimplementasikan backend, database, authentication, monitoring engine, queue, dan worker.

Ini merupakan phase dengan kompleksitas teknis tertinggi.

## 2. Scope of Work

- PostgreSQL.
- Prisma.
- Better Auth.
- Database schema.
- REST API.
- Endpoint CRUD.
- Redis.
- BullMQ.
- Scheduler.
- Node.js Worker.
- Monitoring engine.
- HTTP validation.
- Header validation.
- Body validation.
- Monitoring history.
- Status transitions.
- Alert processing.
- SSRF protection.
- Logging.

## 3. Detailed Implementation Steps

### Step 1 — Install Backend Dependencies

```bash
npm install prisma @prisma/client
npm install better-auth
npm install bullmq ioredis
npm install zod
npm install nodemailer
```

Tambahkan dependency pendukung hanya setelah kebutuhan dan kompatibilitasnya diperiksa.

### Step 2 — Setup Prisma

```bash
npx prisma init
```

Konfigurasi:

```env
DATABASE_URL=
```

### Step 3 — Create Database Schema

Implementasikan:

- User/Auth models.
- Endpoint.
- EndpointConfiguration.
- MonitorCheck.
- Alert.

Perhatikan relasi dan index.

### Step 4 — Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Pastikan skema Better Auth sesuai dengan adapter dan versi library yang digunakan.

### Step 5 — Implement Authentication

Implementasikan:

- Registration.
- Login.
- Logout.
- Session.
- Protected routes.

### Step 6 — Implement API

Buat endpoint CRUD.

Semua API wajib memeriksa:

- Session.
- User ownership.
- Input validation.
- Error handling.

### Step 7 — Setup Redis

Jalankan Redis secara lokal atau menggunakan Docker.

### Step 8 — Implement Queue

Queue:

```text
monitor-checks
alert-notifications
```

Job payload:

```typescript
interface MonitorJob {
  endpointId: string;
  trigger: "SCHEDULED" | "MANUAL";
}
```

### Step 9 — Implement Monitoring Engine

Buat service:

```text
worker/src/monitoring/
  request.ts
  response-validator.ts
  header-validator.ts
  body-validator.ts
  url-security.ts
  monitor-engine.ts
```

### Step 10 — Implement SSRF Protection

Sebelum request:

- Validate protocol.
- Resolve hostname.
- Validate all resolved addresses.
- Block private IP ranges.
- Block loopback.
- Block link-local.
- Block metadata services.
- Disable automatic unsafe redirects.
- Revalidate every redirect destination.
- Apply egress restrictions.

Jangan mengandalkan validasi URL sederhana.

### Step 11 — Implement Scheduler

Buat scheduling berdasarkan endpoint interval.

Pastikan:

- Duplicate scheduling dicegah.
- Pause menghentikan monitoring.
- Delete menghapus jadwal.
- Update interval memperbarui jadwal.
- Restart worker tidak kehilangan jadwal permanen.

Gunakan PostgreSQL sebagai sumber konfigurasi monitoring yang authoritative.

### Step 12 — Implement Check Persistence

Simpan:

- HTTP status.
- Response time.
- Result.
- Error message.
- Timestamp.

### Step 13 — Implement Status Transition

Gunakan transaction atau mekanisme concurrency-safe.

Jangan membuat alert setiap kali check gagal.

Alert hanya ketika terjadi perubahan status yang relevan.

### Step 14 — Implement Alert Queue

Kirim email menggunakan provider yang dikonfigurasi.

Gunakan retry dengan batas percobaan.

### Step 15 — Implement Worker Process

Worker harus berjalan secara independen.

Contoh:

```bash
npm run worker
```

Tambahkan script setelah entrypoint worker tersedia.

## 4. Required Commands

```bash
npm install prisma @prisma/client
npm install better-auth
npm install bullmq ioredis
npm install nodemailer zod

npx prisma init

npx prisma migrate dev --name init
npx prisma generate

npm run dev
npm run worker
```

Redis dapat dijalankan melalui Docker:

```bash
docker run -d \
  --name orderinbox-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Command di atas untuk development lokal, bukan konfigurasi production yang aman.

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Backend Engineer dan Software Architect.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md

Kerjakan PHASE 6 — Backend & Core Business Logic.

Implementasikan backend production-oriented.

Scope:

1. PostgreSQL integration.
2. Prisma schema.
3. Database migrations.
4. Better Auth.
5. Authentication.
6. Authorization.
7. Endpoint CRUD API.
8. Redis connection.
9. BullMQ queues.
10. Monitoring scheduler.
11. Node.js worker.
12. HTTP monitoring engine.
13. Response time measurement.
14. HTTP status validation.
15. Header validation.
16. Body validation.
17. Monitoring history.
18. Status transition.
19. Email alert processing.
20. Structured logging.

SECURITY PRIORITY:

SSRF protection wajib.

Implementasikan:

- DNS resolution validation.
- Private IP blocking.
- IPv4 and IPv6 checks.
- Redirect destination validation.
- DNS rebinding mitigation.
- Request timeout.
- Response size limits.
- Network egress restrictions.
- Safe handling of headers and credentials.

Penting:

Jangan menjalankan monitoring melalui Next.js serverless request.

Gunakan dedicated Node.js worker.

Pastikan job idempotent.

Pastikan duplicate scheduled jobs tidak terjadi.

Pastikan status transition aman terhadap concurrent jobs.

Jangan menyimpan sensitive response body secara default.

Jangan mengimplementasikan fitur P2.

Jangan membuat frontend baru.

Gunakan TECHNICAL_PLAN.md sebagai acuan.

Sebelum menggunakan API dependency, validasi dokumentasi dan versi yang terpasang.

Jalankan database migration, testing, lint, typecheck, dan build.

Jangan mengklaim fitur aman tanpa pengujian yang relevan.

Laporkan:
- Arsitektur yang diimplementasikan.
- Database schema.
- API endpoints.
- Worker.
- Queue.
- Security measures.
- Dependency.
- Testing aktual.
- Known limitations.

Jangan lanjut ke Phase 7.
```

## 6. Expected Deliverables

- Prisma schema.
- Database migrations.
- Authentication.
- API routes.
- Endpoint services.
- Redis integration.
- BullMQ queues.
- Scheduler.
- Worker.
- Monitoring engine.
- Validation services.
- Alert service.
- SSRF protection.

## 7. Acceptance Criteria

- [ ] PostgreSQL terhubung.
- [ ] Prisma migration berhasil.
- [ ] Authentication berfungsi.
- [ ] Authorization berfungsi.
- [ ] Endpoint CRUD API berfungsi.
- [ ] Redis terhubung.
- [ ] BullMQ berfungsi.
- [ ] Worker dapat dijalankan.
- [ ] Scheduler berfungsi.
- [ ] Monitoring request berjalan.
- [ ] Response time tercatat.
- [ ] HTTP status tervalidasi.
- [ ] Header validation berfungsi.
- [ ] Body validation berfungsi.
- [ ] History tersimpan.
- [ ] Status transition berfungsi.
- [ ] Alert queue berfungsi.
- [ ] SSRF protection diuji.
- [ ] Rate limiting tersedia.

## 8. Testing Requirements

Wajib menguji:

- Database CRUD.
- Authentication.
- Authorization.
- Endpoint ownership.
- Queue processing.
- Job retry.
- Worker restart.
- Monitoring success.
- Monitoring timeout.
- HTTP status failure.
- Header mismatch.
- Body mismatch.
- DNS failure.
- Redirect handling.
- Private IP blocking.
- Response size limits.
- Alert transition.
- Duplicate jobs.

Jangan menggunakan target jaringan internal nyata untuk pengujian dari production environment. Gunakan test fixtures atau lingkungan terisolasi.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 6: backend implementation"
```

---

# PHASE 7 — FRONTEND & BACKEND INTEGRATION

## 1. Phase Objective

Menghubungkan seluruh frontend dengan backend production.

## 2. Scope of Work

- API integration.
- Authentication integration.
- Data fetching.
- CRUD integration.
- Monitoring history.
- Manual check.
- Pause/resume.
- Loading states.
- Error mapping.
- Mock removal.

## 3. Detailed Implementation Steps

### Step 1 — Review Backend Contracts

Gunakan API specification dari technical plan.

### Step 2 — Create API Client

Gunakan native Fetch.

Buat:

```text
src/lib/api/
  client.ts
  endpoints.ts
  dashboard.ts
  monitoring.ts
```

### Step 3 — Integrate Authentication

Hubungkan login, registration, logout, dan session.

### Step 4 — Integrate Dashboard

Ganti mock statistics dengan data database.

### Step 5 — Integrate Endpoint CRUD

Hubungkan seluruh endpoint forms dengan API.

### Step 6 — Integrate Monitoring History

Tampilkan data aktual.

### Step 7 — Integrate Manual Check

Implementasikan:

- Trigger manual check.
- Loading state.
- Queue response.
- Result refresh.

### Step 8 — Integrate Pause/Resume

Pastikan status diperbarui berdasarkan backend.

### Step 9 — Remove Mock Services

Hapus mock production dependency.

Pertahankan hanya fixture yang digunakan oleh automated tests.

### Step 10 — Error Mapping

Map API errors ke pesan UI.

## 4. Required Commands

```bash
npm run dev
npm run worker

npm run lint
npx tsc --noEmit
npm run build
```

Jalankan Redis dan PostgreSQL terlebih dahulu.

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Fullstack Developer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- docs/UI_UX_GUIDE.md

Kerjakan PHASE 7 — Frontend & Backend Integration.

Integrasikan frontend dengan backend yang sudah dibuat.

Scope:

1. Authentication integration.
2. Dashboard data fetching.
3. Endpoint CRUD.
4. Endpoint details.
5. Monitoring history.
6. Manual check.
7. Pause/resume.
8. Form submission.
9. Error mapping.
10. Loading states.
11. Success feedback.
12. Retry behavior.
13. Session handling.

PENTING:

- Ganti seluruh mock service production dengan API nyata.
- Jangan menggunakan hardcoded monitoring data.
- Jangan mengakses database langsung dari client.
- Gunakan API client yang reusable.
- Pastikan authorization error ditangani.
- Pastikan user hanya melihat datanya sendiri.
- Jangan mengubah backend contract tanpa alasan.
- Jangan menambahkan fitur P2.

Pastikan seluruh core user flow bekerja end-to-end.

Jalankan lint, typecheck, build, dan integration tests.

Laporkan seluruh integrasi dan hasil testing aktual.

Jangan lanjut ke Phase 8.
```

## 6. Expected Deliverables

- API client.
- Authentication integration.
- Dashboard integration.
- Endpoint CRUD integration.
- History integration.
- Manual check integration.
- Mock removal.
- Error mapping.

## 7. Acceptance Criteria

- [ ] Register berfungsi.
- [ ] Login berfungsi.
- [ ] Logout berfungsi.
- [ ] Dashboard menggunakan data aktual.
- [ ] Endpoint dapat dibuat.
- [ ] Endpoint dapat diperbarui.
- [ ] Endpoint dapat dihapus.
- [ ] Monitoring history tampil.
- [ ] Manual check berfungsi.
- [ ] Pause/resume berfungsi.
- [ ] Loading states berfungsi.
- [ ] Error states berfungsi.
- [ ] Mock production sudah dihapus.

## 8. Testing Requirements

End-to-end testing:

1. Register.
2. Login.
3. Create endpoint.
4. Wait for scheduled check.
5. View monitoring result.
6. Trigger manual check.
7. View history.
8. Edit endpoint.
9. Pause endpoint.
10. Resume endpoint.
11. Delete endpoint.
12. Logout.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 7: frontend backend integration"
```

---

# PHASE 8 — ADDITIONAL FEATURES & PRODUCT COMPLETION

## 1. Phase Objective

Menyelesaikan fitur P1 dan meningkatkan kualitas produk.

## 2. Scope of Work

- Search.
- Filters.
- Pagination.
- Response time charts.
- Monitoring configuration improvements.
- Alert settings.
- User settings.
- History improvements.
- SEO.
- Accessibility.
- Documentation.

Jangan mengimplementasikan P2.

## 3. Detailed Implementation Steps

### Step 1 — Endpoint Search

Implementasikan pencarian berdasarkan nama dan URL.

### Step 2 — Endpoint Filters

Filter berdasarkan:

- UP.
- DOWN.
- PAUSED.
- ALL.

### Step 3 — Pagination

Implementasikan server-side pagination.

### Step 4 — Monitoring Charts

Tampilkan response time berdasarkan history.

### Step 5 — Monitoring Controls

Tambahkan:

- Pause.
- Resume.
- Manual check.
- Interval adjustment.

### Step 6 — Alert Settings

Tambahkan konfigurasi notifikasi pengguna.

### Step 7 — History Improvements

Implementasikan pagination dan filter waktu.

### Step 8 — Settings

Implementasikan user profile settings.

### Step 9 — Accessibility

Perbaiki:

- Keyboard navigation.
- Form labels.
- Focus states.
- Contrast.
- Screen reader support.

### Step 10 — Documentation

Buat dokumentasi penggunaan:

- Getting started.
- Create endpoint.
- Configure monitoring.
- Understand status.
- Troubleshooting.

## 4. Required Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior Product Engineer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- docs/UI_UX_GUIDE.md

Kerjakan PHASE 8 — Additional Features & Product Completion.

Implementasikan fitur P1 yang relevan:

1. Endpoint search.
2. Status filters.
3. Pagination.
4. Response time charts.
5. Monitoring configuration improvements.
6. Alert settings.
7. Monitoring history improvements.
8. User settings.
9. Accessibility improvements.
10. Documentation.
11. SEO untuk halaman publik jika relevan.

Pastikan seluruh fitur sesuai PRD.

Batasan:

- Jangan implementasikan P2.
- Jangan membuat team collaboration.
- Jangan membuat billing.
- Jangan membuat multi-region monitoring.
- Jangan menambahkan AI features.
- Jangan melakukan refactor besar tanpa alasan.

Pastikan setiap fitur memiliki loading, error, dan empty states.

Jalankan testing dan build.

Laporkan hasil implementasi.

Jangan lanjut ke Phase 9.
```

## 6. Expected Deliverables

- Search.
- Filters.
- Pagination.
- Charts.
- Settings.
- Alert configuration.
- Accessibility improvements.
- Documentation.

## 7. Acceptance Criteria

- [ ] Search berfungsi.
- [ ] Filter berfungsi.
- [ ] Pagination berfungsi.
- [ ] Charts menampilkan data aktual.
- [ ] Alert settings berfungsi.
- [ ] User settings berfungsi.
- [ ] Accessibility diperbaiki.
- [ ] Dokumentasi tersedia.
- [ ] Tidak ada fitur P2.

## 8. Testing Requirements

- Feature tests.
- UI regression.
- Responsive tests.
- Accessibility review.
- Typecheck.
- Lint.
- Build.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 8: additional features"
```

---

# PHASE 9 — TESTING, SECURITY & OPTIMIZATION

## 1. Phase Objective

Memastikan sistem stabil, aman, dan siap production.

Output utama:

`TEST_REPORT.md`

## 2. Scope of Work

- Unit testing.
- Integration testing.
- E2E testing.
- Security testing.
- SSRF testing.
- Performance testing.
- Responsive testing.
- Browser compatibility.
- Database query optimization.
- Worker optimization.
- Bug fixing.

Tidak boleh menambahkan fitur baru.

## 3. Detailed Implementation Steps

### Step 1 — Run Static Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

### Step 2 — Unit Testing

Test:

- URL validation.
- IP validation.
- Response validation.
- Header validation.
- Body validation.
- Status transitions.
- Monitoring logic.
- Alert decisions.

### Step 3 — Integration Testing

Test:

- Database.
- API.
- Authentication.
- Queue.
- Worker.
- Scheduler.
- Email provider integration.

### Step 4 — E2E Testing

Test seluruh core user flow.

### Step 5 — Security Audit

Fokus:

- SSRF.
- Authentication.
- Authorization.
- IDOR.
- XSS.
- CSRF.
- SQL injection.
- Rate limiting.
- Sensitive data exposure.
- Secret leakage.

### Step 6 — SSRF Testing

Uji:

- Localhost.
- Private IPv4.
- Private IPv6.
- Link-local.
- Metadata addresses.
- DNS rebinding scenarios.
- Redirect to private IP.
- Invalid URL scheme.

### Step 7 — Performance Testing

Uji:

- Dashboard response.
- Endpoint CRUD.
- History pagination.
- Worker throughput.
- Queue latency.
- Database query performance.

### Step 8 — Responsive Testing

Verifikasi:

- Desktop.
- Tablet.
- Mobile.

### Step 9 — Browser Testing

Chrome, Firefox, Edge, Safari.

### Step 10 — Generate Test Report

Buat:

`TEST_REPORT.md`

Isi:

- Test scope.
- Test environment.
- Test cases.
- Pass/fail.
- Bugs found.
- Bugs fixed.
- Security findings.
- Performance findings.
- Known limitations.
- Release recommendation.

## 4. Required Commands

Contoh:

```bash
npm run test
npm run test:integration
npm run test:e2e

npm run lint
npx tsc --noEmit
npm run build

npx prisma validate
npx prisma migrate status
```

Jalankan hanya script yang memang telah dikonfigurasi.

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior QA Engineer dan Application Security Engineer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md

Kerjakan PHASE 9 — Testing, Security & Optimization.

Fokus pada verifikasi, bukan penambahan fitur.

Lakukan:

1. Unit testing.
2. Integration testing.
3. E2E testing.
4. Database testing.
5. Queue testing.
6. Worker testing.
7. Authentication testing.
8. Authorization testing.
9. SSRF security testing.
10. Rate limiting testing.
11. Responsive testing.
12. Browser compatibility.
13. Performance review.
14. Bug fixing.

Prioritas keamanan:

SSRF adalah risiko kritis.

Periksa:
- Private IP blocking.
- IPv6 handling.
- DNS resolution.
- DNS rebinding.
- Redirect validation.
- Request timeout.
- Response limits.
- Egress restrictions.

Periksa juga:
- IDOR.
- Session security.
- Sensitive data leakage.
- Rate limiting.
- SQL injection.
- XSS.
- CSRF.

Jangan:

- Menambahkan fitur baru.
- Mengimplementasikan fitur P2.
- Mengubah arsitektur tanpa alasan.
- Mengklaim testing berhasil tanpa menjalankannya.

Buat TEST_REPORT.md.

Laporan wajib memuat hasil aktual:
- Passed.
- Failed.
- Skipped.
- Known issues.
- Security findings.
- Performance findings.
- Release recommendation.

Jika ditemukan bug, perbaiki dan jalankan ulang test terkait.

Jangan lanjut ke Phase 10.
```

## 6. Expected Deliverables

- Test suite.
- Security review.
- Performance review.
- Bug fixes.
- `TEST_REPORT.md`.

## 7. Acceptance Criteria

- [ ] Lint berhasil.
- [ ] Typecheck berhasil.
- [ ] Build berhasil.
- [ ] Unit tests berhasil.
- [ ] Integration tests berhasil.
- [ ] E2E tests berhasil.
- [ ] Authentication diuji.
- [ ] Authorization diuji.
- [ ] SSRF protection diuji.
- [ ] Rate limiting diuji.
- [ ] Critical bugs tidak tersisa.
- [ ] TEST_REPORT.md tersedia.

## 8. Testing Requirements

Seluruh test suite yang relevan wajib dijalankan.

Critical security findings harus diselesaikan sebelum release.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 9: testing and optimization"
```

---

# PHASE 10 — PRODUCTION DEPLOYMENT & RELEASE

## 1. Phase Objective

Melakukan deployment OrderInbox ke production.

Output utama:

- `DEPLOYMENT_GUIDE.md`
- `RELEASE_NOTES.md`

## 2. Scope of Work

- Production configuration.
- VPS preparation.
- Docker.
- PostgreSQL deployment.
- Redis deployment.
- Next.js deployment.
- Worker deployment.
- Reverse proxy.
- Domain.
- DNS.
- HTTPS.
- Environment variables.
- Database migration.
- Monitoring.
- Backup.
- Smoke testing.
- Release documentation.

## 3. Detailed Implementation Steps

### Step 1 — Prepare VPS

Rekomendasi awal:

- Ubuntu LTS.
- 2–4 vCPU.
- 4–8 GB RAM.
- SSD storage.
- Public IP.
- Firewall.

Kebutuhan resource aktual bergantung pada jumlah endpoint, interval, concurrency, dan ukuran response.

### Step 2 — Install Docker

Verifikasi:

```bash
docker --version
docker compose version
```

### Step 3 — Create Production Environment

Siapkan:

```text
.env.production
```

Wajib:

- DATABASE_URL.
- REDIS_URL.
- BETTER_AUTH_SECRET.
- BETTER_AUTH_URL.
- APP_URL.
- EMAIL_PROVIDER_API_KEY.
- EMAIL_FROM.

Jangan commit production environment.

### Step 4 — Configure Docker Compose

Service:

```text
app
worker
scheduler (jika dipisahkan)
postgres
redis
caddy
```

Gunakan official images yang telah dipin ke versi tertentu.

Jangan expose PostgreSQL dan Redis secara langsung ke public internet.

### Step 5 — Configure Database

- Create production database.
- Configure credentials.
- Run migration.
- Configure backup.
- Verify connectivity.

Migration:

```bash
npx prisma migrate deploy
```

Jangan menggunakan `prisma migrate dev` pada production.

### Step 6 — Configure Worker

Pastikan:

- Worker auto-restart.
- Graceful shutdown.
- Queue recovery.
- Concurrency limits.
- Structured logging.

### Step 7 — Configure Reverse Proxy

Gunakan Caddy atau Nginx.

Pastikan:

- Domain diarahkan dengan benar.
- HTTPS aktif.
- Redirect HTTP ke HTTPS.
- Security headers diterapkan.
- Request body limits sesuai kebutuhan.

### Step 8 — Configure DNS

Buat:

- A record.
- Optional www record.

Pastikan domain mengarah ke VPS.

### Step 9 — Configure HTTPS

Gunakan automatic HTTPS dari Caddy atau sertifikat yang dikelola dengan benar.

### Step 10 — Configure Monitoring

Pantau:

- Application health.
- Worker health.
- Redis.
- PostgreSQL.
- Disk usage.
- Memory.
- CPU.
- Queue backlog.
- Failed jobs.

### Step 11 — Configure Backup

PostgreSQL:

- Daily backup.
- Retention policy.
- Offsite backup.
- Restore test.

Redis:

- Gunakan persistence sesuai kebutuhan queue.
- Pastikan job scheduling dapat dipulihkan dari data authoritative di PostgreSQL.

### Step 12 — Production Smoke Test

Uji:

1. Landing page.
2. Register.
3. Login.
4. Create endpoint.
5. Monitoring execution.
6. Monitoring history.
7. Manual check.
8. Alert email.
9. Pause endpoint.
10. Resume endpoint.
11. Logout.

### Step 13 — Generate Documentation

Buat:

`DEPLOYMENT_GUIDE.md`

dan:

`RELEASE_NOTES.md`

## 4. Required Commands

Development / build:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Docker:

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
```

Database:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

Maintenance:

```bash
docker compose restart app
docker compose restart worker
docker compose logs --tail=100 app
docker compose logs --tail=100 worker
```

Backup example:

```bash
docker compose exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > backup.sql
```

Pastikan variabel tersedia pada shell yang menjalankan backup.

Backup harus disimpan di lokasi aman di luar VPS dan restore harus diuji.

## 5. AI Coding Assistant Prompt

```text
Kamu bertindak sebagai Senior DevOps Engineer dan Release Engineer.

Project: OrderInbox

Dokumen:
- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- TEST_REPORT.md

Kerjakan PHASE 10 — Production Deployment & Release.

Tujuan:
Deploy OrderInbox sebagai production web application.

Implementasikan:

1. Production environment configuration.
2. Dockerfile.
3. Docker Compose.
4. Next.js service.
5. Node.js worker service.
6. PostgreSQL service atau managed database integration.
7. Redis service atau managed Redis integration.
8. Reverse proxy.
9. HTTPS.
10. Environment variables.
11. Database migrations.
12. Worker restart policy.
13. Logging.
14. Health checks.
15. Backup strategy.
16. Production smoke testing.
17. Deployment documentation.
18. Release notes.

Gunakan arsitektur VPS dan Docker Compose sesuai technical plan.

PENTING:

- Jangan menggunakan desktop application architecture.
- Jangan menggunakan Rust atau Tauri.
- Jangan expose Redis/PostgreSQL ke public internet.
- Jangan commit production secrets.
- Jangan menjalankan development migration di production.
- Pastikan worker berjalan sebagai proses terpisah.
- Pastikan SSRF network restrictions tetap aktif.
- Pastikan backup dapat dipulihkan.
- Pastikan HTTPS aktif.

Buat:

DEPLOYMENT_GUIDE.md
RELEASE_NOTES.md

Jalankan production build dan smoke tests.

Jangan mengklaim deployment berhasil jika belum benar-benar dilakukan.

Jika akses VPS atau domain belum tersedia, siapkan deployment configuration dan dokumentasikan langkah yang belum dapat dijalankan.

Laporkan:
- Deployment architecture.
- Environment configuration.
- Services.
- Database migration.
- Worker status.
- HTTPS status.
- Backup status.
- Smoke test results.
- Known limitations.

Jangan melakukan pekerjaan tambahan di luar release scope.
```

## 6. Expected Deliverables

- Dockerfile.
- Docker Compose.
- Production configuration.
- Reverse proxy configuration.
- `DEPLOYMENT_GUIDE.md`.
- `RELEASE_NOTES.md`.
- Backup instructions.
- Production smoke test report.

## 7. Acceptance Criteria

- [ ] Production build berhasil.
- [ ] Docker image berhasil dibuat.
- [ ] Application berjalan.
- [ ] Worker berjalan.
- [ ] PostgreSQL terhubung.
- [ ] Redis terhubung.
- [ ] Migration berhasil.
- [ ] Domain berfungsi.
- [ ] HTTPS aktif.
- [ ] Environment secrets aman.
- [ ] Backup dikonfigurasi.
- [ ] Restore procedure terdokumentasi.
- [ ] Smoke test berhasil.
- [ ] Deployment guide tersedia.
- [ ] Release notes tersedia.

## 8. Testing Requirements

Production smoke testing.

Pastikan tidak ada critical issue.

## 9. Git Checkpoint

```bash
git add .
git commit -m "phase 10: production deployment"
```

Tag release:

```bash
git tag -a v1.0.0 -m "OrderInbox MVP release"
git push origin v1.0.0
```

---

# PART C — GLOBAL AI CODING RULES

Semua AI Coding Assistant wajib mengikuti aturan berikut.

## 1. Project Context

```text
Project:
OrderInbox

Main Document:
PROJECT_PRD_AND_PLAYBOOK.md

Technical Reference:
TECHNICAL_PLAN.md

UI/UX Reference:
docs/UI_UX_GUIDE.md

Development:
Solo Developer + AI Coding Assistant

Approach:
MVP First, Pragmatic Clean Architecture,
Maintainable Code, Reusable Components.
```

## 2. Mandatory Rules

1. Baca PRD sebelum mengerjakan.
2. Baca technical plan apabila sudah tersedia.
3. Baca UI/UX guide untuk pekerjaan frontend.
4. Kerjakan hanya phase yang diminta.
5. Periksa repository sebelum mengubah file.
6. Jangan menimpa implementasi yang sudah ada tanpa alasan.
7. Jangan mengganti tech stack tanpa persetujuan.
8. Jangan menambahkan dependency tanpa kebutuhan.
9. Jangan mengimplementasikan fitur di luar scope.
10. Jangan membuat arsitektur berlebihan.
11. Jangan menghapus kode tanpa memahami dependensinya.
12. Jangan menggunakan mock sebagai production implementation.
13. Jangan mengarang hasil testing.
14. Jalankan testing sebelum melaporkan hasil.
15. Laporkan semua file yang dibuat.
16. Laporkan semua file yang diubah.
17. Laporkan dependency baru.
18. Laporkan masalah dan known limitations.
19. Jangan melanjutkan phase berikutnya otomatis.
20. Tunggu persetujuan developer.

## 3. Coding Standards

- TypeScript strict.
- Consistent naming.
- Small and focused functions.
- Reusable components.
- Centralized validation.
- Centralized error handling.
- No unnecessary abstraction.
- No duplicated business logic.
- No hardcoded secrets.
- No unused dependencies.

## 4. Backend Rules

- Validate every input.
- Verify authentication.
- Verify authorization.
- Use database transactions when needed.
- Use background jobs for monitoring.
- Keep monitoring outside request lifecycle.
- Protect against SSRF.
- Limit request duration and response size.
- Implement idempotent jobs.
- Use structured logging.

## 5. Frontend Rules

- Follow UI_UX_GUIDE.md.
- Use reusable components.
- Implement loading states.
- Implement empty states.
- Implement error states.
- Implement success feedback.
- Keep components maintainable.
- Avoid unnecessary global state.
- Ensure responsive layout.

## 6. Testing Rules

Do not claim:

- Tests passed without running them.
- Security is guaranteed without testing.
- Deployment succeeded without verification.
- API integration works without end-to-end validation.

Always report actual results.

## 7. Required Phase Report

Setiap phase harus menghasilkan laporan:

```text
PHASE REPORT

Phase:
Phase Name:

1. Summary
2. Implemented Features
3. Files Created
4. Files Modified
5. Dependencies Added
6. Commands Executed
7. Testing Results
8. Acceptance Criteria Status
9. Known Issues
10. Technical Decisions
11. Git Checkpoint Status
12. Recommended Next Action
```

---

# PART D — GIT & EXECUTION RULES

## 1. Git Strategy

Gunakan satu branch utama:

```text
main
```

Untuk pekerjaan eksperimental dapat menggunakan:

```text
feature/*
fix/*
```

## 2. Commit Checkpoints

Setiap phase memiliki commit khusus:

```bash
git commit -m "phase 1: project bootstrap"

git commit -m "phase 2: technical architecture"

git commit -m "phase 3: ui ux planning"

git commit -m "phase 4: frontend foundation"

git commit -m "phase 5: core frontend features"

git commit -m "phase 6: backend implementation"

git commit -m "phase 7: frontend backend integration"

git commit -m "phase 8: additional features"

git commit -m "phase 9: testing and optimization"

git commit -m "phase 10: production deployment"
```

## 3. Commit Rules

Sebelum commit:

- Review perubahan.
- Run lint.
- Run typecheck.
- Run relevant tests.
- Run build jika diwajibkan.
- Pastikan tidak ada secret.
- Pastikan tidak ada file yang tidak relevan.

Jangan membuat commit apabila testing wajib belum dijalankan.

## 4. Phase Approval

Alur:

```text
START PHASE
    |
    v
IMPLEMENTATION
    |
    v
TESTING
    |
    v
ACCEPTANCE REVIEW
    |
    v
GIT CHECKPOINT
    |
    v
DEVELOPER APPROVAL
    |
    v
NEXT PHASE
```

Developer tetap memegang kontrol atas perpindahan phase.

---

# PART E — COMMAND CHEAT SHEET

## 1. Development

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## 2. Database

```bash
npx prisma init
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma migrate status
npx prisma studio
```

## 3. Redis

```bash
docker run -d \
  --name orderinbox-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## 4. Worker

```bash
npm run worker
```

## 5. Testing

```bash
npm run test
npm run test:integration
npm run test:e2e
```

## 6. Docker

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

## 7. Git

```bash
git status
git add .
git commit -m "phase: description"
git log --oneline
git tag
```

## 8. Production

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
docker compose logs -f worker
```

---

# PART F — FINAL CHECKLIST & DOCUMENTATION

## 1. Documentation Structure

Repository final:

```text
orderinbox/
|
+-- docs/
|   +-- TECHNICAL_PLAN.md
|   +-- UI_UX_GUIDE.md
|   +-- TEST_REPORT.md
|   +-- DEPLOYMENT_GUIDE.md
|   +-- RELEASE_NOTES.md
|
+-- prisma/
|
+-- src/
|
+-- worker/
|
+-- tests/
|
+-- docker/
|
+-- .env.example
+-- .gitignore
+-- Dockerfile
+-- docker-compose.yml
+-- package.json
+-- PROJECT_PRD_AND_PLAYBOOK.md
+-- README.md
```

## 2. Final Product Checklist

### Authentication

- [ ] Registration.
- [ ] Login.
- [ ] Logout.
- [ ] Session management.
- [ ] Protected routes.
- [ ] User ownership.

### Dashboard

- [ ] Total endpoints.
- [ ] UP status.
- [ ] DOWN status.
- [ ] Average response time.
- [ ] Recent incidents.

### Endpoint Management

- [ ] Create.
- [ ] Read.
- [ ] Update.
- [ ] Delete.
- [ ] Pause.
- [ ] Resume.
- [ ] Manual check.

### Monitoring

- [ ] Scheduled checks.
- [ ] HTTP status.
- [ ] Response time.
- [ ] Timeout.
- [ ] Header validation.
- [ ] Body validation.
- [ ] Monitoring history.
- [ ] Status transition.

### Alert

- [ ] DOWN notification.
- [ ] Recovery notification.
- [ ] Retry handling.
- [ ] Duplicate alert prevention.

### Security

- [ ] Input validation.
- [ ] Authentication.
- [ ] Authorization.
- [ ] SSRF protection.
- [ ] Rate limiting.
- [ ] Secret management.
- [ ] Safe logging.
- [ ] Response limits.

### Production

- [ ] Production build.
- [ ] Docker deployment.
- [ ] PostgreSQL.
- [ ] Redis.
- [ ] Worker.
- [ ] Domain.
- [ ] HTTPS.
- [ ] Backup.
- [ ] Monitoring.
- [ ] Smoke testing.

## 3. Documentation Checklist

- [ ] PROJECT_PRD_AND_PLAYBOOK.md
- [ ] TECHNICAL_PLAN.md
- [ ] UI_UX_GUIDE.md
- [ ] TEST_REPORT.md
- [ ] DEPLOYMENT_GUIDE.md
- [ ] RELEASE_NOTES.md
- [ ] README.md
- [ ] .env.example

## 4. MVP Release Criteria

OrderInbox MVP dapat dinyatakan siap release apabila:

1. Seluruh P0 features berfungsi.
2. Seluruh core user flows berhasil.
3. Monitoring berjalan otomatis.
4. Monitoring history tersimpan.
5. Alert berfungsi.
6. Security testing kritis telah dilewati.
7. Worker dapat berjalan stabil.
8. Backup telah dikonfigurasi.
9. Production smoke test berhasil.
10. Dokumentasi tersedia.

## 5. Post-MVP Roadmap

Setelah MVP stabil, pengembangan dapat dilanjutkan secara bertahap.

### Version 1.1

- Improved analytics.
- Advanced filtering.
- Export history.
- Better alert configuration.

### Version 1.2

- Webhook integration.
- Slack integration.
- Discord integration.
- Telegram integration.

### Version 1.3

- Public status pages.
- Incident reporting.
- SLA reporting.

### Version 2.0

- Team collaboration.
- Multiple monitoring regions.
- Advanced API assertions.
- Subscription and billing.
- Usage-based pricing.

---

# FINAL DEVELOPMENT DIRECTIVE

Gunakan dokumen ini sebagai single source of truth selama development.

Urutan pengerjaan wajib:

```text
PHASE 1
Environment & Project Bootstrap
       |
       v
PHASE 2
Technical Planning & Architecture
       |
       v
PHASE 3
UI/UX Planning & Design System
       |
       v
PHASE 4
Frontend Foundation & Application Shell
       |
       v
PHASE 5
Core Frontend Feature Development
       |
       v
PHASE 6
Backend & Core Business Logic
       |
       v
PHASE 7
Frontend & Backend Integration
       |
       v
PHASE 8
Additional Features & Product Completion
       |
       v
PHASE 9
Testing, Security & Optimization
       |
       v
PHASE 10
Production Deployment & Release
```

**IMPORTANT:**

Jangan menjalankan seluruh phase sekaligus.

Jalankan satu prompt phase pada satu waktu melalui VS Code AI Coding Assistant.

Setelah selesai:

1. Review hasil implementasi.
2. Periksa acceptance criteria.
3. Jalankan testing.
4. Periksa Git diff.
5. Buat commit checkpoint.
6. Setujui phase berikutnya secara manual.

**END OF DOCUMENT**
