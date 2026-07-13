# WAD Task Manager (UAS Web Advance Development 2)
**Nama Mahasiswa:** Ardika Banyuartha  
**Model Tambahan:** Comment (Komentar Real-Time)  
**Database Utama:** MySQL / MariaDB (Mendukung PostgreSQL)  
**Teknologi Utama:** Node.js, Express, Prisma ORM, Socket.IO, React (Vite)

Proyek ini adalah kelanjutan dari Tugas UTS (wad-capstone). Pada UAS ini, proyek dikembangkan menjadi aplikasi **full-stack**, **real-time**, dan siap di-deploy ke VPS.

---

## 🚀 Fitur Utama
1.  **React Frontend SPA (Vite)**: Auth state di memori (Context API), Axios Interceptor untuk auto-refresh token (401 retry queue), Protected Routes, dan CRUD Task yang responsif.
2.  **Paginasi & Filter**: Filter task berdasarkan status (`TODO`, `IN_PROGRESS`, `DONE`) dan paginasi interaktif (halaman Next/Prev) untuk efisiensi transfer data.
3.  **Real-Time Komunikasi (Socket.IO)**: 
    *   Pemutakhiran status online user secara live di navbar.
    *   Sinkronisasi live penambahan, pembaruan, dan penghapusan task di antara semua klien yang terhubung (`tasks:global` room).
    *   Fitur komentar real-time pada detail task. Penambahan dan penghapusan komentar tersinkronisasi secara instan untuk semua user yang sedang membuka task yang sama (`task:<id>` room).
4.  **Security Hardening**: Autentikasi JWT dengan rotasi Token, argon2id hashing, Helmet security headers, CORS protection, global Rate Limiting, dan sanitasi input dari bahaya XSS.

---

## 🛠️ Panduan Setup Lokal

### 1. Prasyarat
*   Node.js (versi 18 ke atas)
*   **Database Server**:
    *   PostgreSQL Server (port default: `5432`)
    *   **ATAU** MySQL / MariaDB Server (port default: `3306`/`3307` via XAMPP atau Laragon)

---

### 2. Konfigurasi Prisma Sesuai Database Pilihan (PENTING)
Sebelum melakukan setup, sesuaikan provider database di file **[`prisma/schema.prisma`](file:///d:/mssisuc/wadv_p5_examples-main/wad-capstone/prisma/schema.prisma)** pada bagian `datasource db`:

*   **Jika Menggunakan PostgreSQL**:
    ```prisma
    datasource db {
      provider = "postgresql"
    }
    ```
*   **Jika Menggunakan MySQL / MariaDB**:
    ```prisma
    datasource db {
      provider = "mysql"
    }
    ```

---

### 3. Setup Backend (`wad-capstone`)
1.  Buka terminal di folder `wad-capstone`.
2.  Pasang dependensi:
    ```bash
    npm install
    ```
3.  Konfigurasikan file `.env` di folder root:
    ```env
    PORT=3000
    NODE_ENV=development
    APP_NAME="WAD Task Manager"
    APP_VERSION=1.0.0

    # PILIHAN A: MySQL / XAMPP (Aktifkan baris ini jika menggunakan MySQL)
    DATABASE_URL="mysql://root:@localhost:3306/wad_capstone"
    # (catatan: sesuaikan password setelah tanda titik dua ':' jika menggunakan password)

    # PILIHAN B: PostgreSQL (Aktifkan baris ini jika menggunakan PostgreSQL, matikan Pilihan A)
    # DATABASE_URL="postgresql://postgres:PasswordKamu@localhost:5432/wad_capstone?schema=public"

    # JWT Key acak untuk lokal
    JWT_ACCESS_SECRET="developmentsupersecretaccesskey123!"
    JWT_REFRESH_SECRET="developmentsupersecretrefreshkey67890!"
    ```
4.  Jalankan migrasi database (Prisma 7 otomatis membuat database kosong jika belum ada):
    ```bash
    npx prisma migrate dev --name init_schema
    ```
5.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```
6.  Jalankan Seeding data awal:
    ```bash
    npx prisma db seed
    ```
7.  Jalankan server backend:
    ```bash
    npm run dev
    ```

### 3. Setup Frontend (`wad-frontend`)
1.  Buka terminal di folder `wad-frontend` (bersebelahan dengan folder backend).
2.  Pasang dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server development Vite:
    ```bash
    npm run dev
    ```
4.  Buka browser Anda di `http://localhost:5173`.

---

## 📊 Entity Relationship Diagram (ERD)

Database menggunakan **MySQL / MariaDB** yang dimigrasi via **Prisma ORM** dengan struktur relasi sebagai berikut:

*   **User** (`users`): Menyimpan informasi pengguna (id, nama, email, password terenkripsi Argon2, role).
    *   Relasi: Satu `User` memiliki banyak (`1:N`) `Task`, `RefreshToken`, dan `Comment`.
*   **Task** (`tasks`): Menyimpan informasi pekerjaan (id, judul, deskripsi, status enum, prioritas enum, tenggat waktu, userId, categoryId).
    *   Relasi: Satu `Task` terhubung ke satu `User` (`N:1`), satu `Category` (`N:1`, optional), dan memiliki banyak (`1:N`) `Comment`.
*   **Category** (`categories`): Menyimpan label kategori task (id, nama unik, warna hex).
    *   Relasi: Satu `Category` digunakan oleh banyak (`1:N`) `Task`.
*   **Comment** (`comments`): Menyimpan komentar task (id, konten teks, taskId, userId).
    *   Relasi: Satu `Comment` terhubung ke satu `Task` (`N:1`) dan satu `User` (`N:1`).
*   **RefreshToken** (`refresh_tokens`): Untuk keamanan rotasi JWT token (id, token, userId, expiresAt, isRevoked).

---

## 📡 Daftar Event Socket.IO

| Event Name | Arah (Source → Target) | Deskripsi | Payload |
| :--- | :--- | :--- | :--- |
| **`connection`** | Client → Server | Melakukan jabat tangan awal, otentikasi JWT token, dan memasukkan client ke room personal (`user:<id>`) dan room global (`tasks:global`). | Token JWT di `auth` handshake |
| **`users:online`** | Server → All Clients | Menyiarkan jumlah pengguna yang sedang terhubung secara real-time. | `{ count: number }` |
| **`join:task`** | Client → Server | Client bergabung ke room khusus task tertentu saat membuka halaman detail. | `{ taskId: number }` |
| **`leave:task`** | Client → Server | Client keluar dari room task ketika meninggalkan halaman detail. | `{ taskId: number }` |
| **`task:created`** | Server → `tasks:global` | Menyiarkan data task baru ke semua klien agar list ter-update. | `{ task: Object }` |
| **`task:updated`** | Server → `tasks:global` | Menyiarkan perubahan data task ke semua klien untuk pembaruan live. | `{ task: Object }` |
| **`task:deleted`** | Server → `tasks:global` | Menyiarkan ID task yang dihapus agar hilang dari grid klien lain. | `{ taskId: number }` |
| **`comment:created`**| Server → `task:<id>` | Menyiarkan komentar baru khusus kepada user yang sedang membuka task tersebut. | `{ comment: Object }` |
| **`comment:deleted`**| Server → `task:<id>` | Menyiarkan ID komentar yang dihapus agar langsung terhapus di layar klien lain. | `{ commentId: number }` |
| **`notification`** | Server → `user:<id>` | Mengirimkan notifikasi personal (toast) sukses/gagal ke user spesifik. | `{ type: string, title: string, message: string }` |

---

## 🌐 Alur Arsitektur Deployment VPS

Ketika di-deploy ke VPS (Ubuntu), aliran lalu lintas jaringan dirancang sebagai berikut:

```mermaid
graph TD
    Client[Browser Client via HTTPS] -->|Port 443| Nginx{Nginx Reverse Proxy}
    Nginx -->|SSL Termination Let's Encrypt| UFW[UFW Firewall Hardening]
    UFW -->|Internal Proxy to Port 3000| PM2[PM2 Process Manager]
    PM2 -->|Manage App Process| ExpressApp[Express.js App]
    ExpressApp -->|WebSocket Connection| SocketIO[Socket.IO Server]
    ExpressApp -->|Prisma Client| DB[(MySQL Database)]
```

*   **Nginx**: Berfungsi sebagai pintu gerbang utama (Reverse Proxy) di Port 80 (HTTP) dan Port 443 (HTTPS) dengan SSL Let's Encrypt. Nginx meneruskan trafik statis frontend dan mengarahkan API/WebSocket ke backend internal.
*   **PM2**: Menjaga aplikasi backend agar tetap berjalan di latar belakang (daemon), menangani auto-restart jika terjadi *crash*, dan menyalakan kembali aplikasi saat VPS melakukan *reboot* (startup on boot).
*   **UFW**: Melakukan hardening keamanan port. Semua port eksternal ditutup (termasuk port database 3306 dan port backend 3000), hanya menyisakan port SSH, HTTP (80), dan HTTPS (443) yang terbuka untuk publik.
