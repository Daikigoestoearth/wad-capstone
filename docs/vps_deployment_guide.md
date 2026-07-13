# Panduan Penerapan (Deployment) Aplikasi ke VPS Ubuntu

Dokumen ini berisi panduan lengkap langkah demi langkah untuk melakukan penerapan (*deployment*) aplikasi **WAD Task Manager** ke server VPS berbasis **Ubuntu 22.04 LTS**. Dokumen ini mencakup konfigurasi sistem, database, PM2, Nginx reverse proxy, dan SSL/HTTPS.

---

## 📋 Prasyarat Sebelum Deployment
1.  **VPS (Virtual Private Server)**: Menggunakan Ubuntu 22.04 LTS bersih.
2.  **Domain / Subdomain**: Yang sudah terhubung (*pointed*) ke alamat IP Publik VPS Anda via DNS Record (A Record).
3.  **SSH Key**: Kunci privat (`.pem` atau `.ppk`) untuk masuk ke VPS tanpa password demi keamanan.

---

## 🛠️ Langkah-Langkah Penerapan di Server

### Langkah 1: Hubungkan & Hardening Server (UFW Firewall)
1.  Masuk ke server menggunakan SSH Key:
    ```bash
    ssh -i path_ke_ssh_key.pem username@IP_VPS_ANDA
    ```
2.  Lakukan pembaruan paket sistem operasi agar aman:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  Aktifkan firewall bawaan Ubuntu (**UFW**) dan lakukan pembatasan akses port (hanya port standard 22, 80, dan 443 yang dibuka untuk publik):
    ```bash
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw enable
    ```
    *Semua port internal seperti port 3000 (backend), 4173 (frontend), dan 5432 (database) akan ditutup dari akses luar demi keamanan.*

---

### Langkah 2: Instalasi Node.js (via NVM)
1.  Instal **Node Version Manager (NVM)**:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    source ~/.bashrc
    ```
2.  Instal Node.js versi 22 (LTS terbaru):
    ```bash
    nvm install 22
    nvm use 22
    ```

---

### Langkah 3: Instalasi & Konfigurasi Database (PostgreSQL / MySQL)

#### **Opsi A: Menggunakan PostgreSQL (Direkomendasikan)**
1.  Instal PostgreSQL server di VPS:
    ```bash
    sudo apt install postgresql postgresql-contrib -y
    ```
2.  Masuk ke PostgreSQL CLI:
    ```bash
    sudo -i -u postgres psql
    ```
3.  Buat database dan berikan hak akses ke user baru:
    ```sql
    CREATE DATABASE wad_capstone;
    CREATE USER user_wad WITH PASSWORD 'PasswordAmanKamu123!';
    GRANT ALL PRIVILEGES ON DATABASE wad_capstone TO user_wad;
    \q
    ```

#### **Opsi B: Menggunakan MySQL (XAMPP / Standalone)**
1.  Instal MySQL Server:
    ```bash
    sudo apt install mysql-server -y
    ```
2.  Konfigurasikan database dan user baru:
    ```bash
    sudo mysql
    ```
    ```sql
    CREATE DATABASE wad_capstone;
    CREATE USER 'user_wad'@'localhost' IDENTIFIED BY 'PasswordAmanKamu123!';
    GRANT ALL PRIVILEGES ON wad_capstone.* TO 'user_wad'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

---

### Langkah 4: Deployment & Konfigurasi Aplikasi Backend

1.  Clone atau unggah repositori proyek backend (`wad-capstone`) Anda ke VPS ke dalam folder `/var/www/wad-capstone`.
2.  Buat berkas `.env` di folder root backend:
    ```env
    PORT=3000
    NODE_ENV=production
    APP_NAME="WAD Task Manager"
    APP_VERSION=1.0.0

    # Gunakan salah satu baris di bawah sesuai pilihan database Anda:
    DATABASE_URL="postgresql://user_wad:PasswordAmanKamu123!@localhost:5432/wad_capstone?schema=public"
    # DATABASE_URL="mysql://user_wad:PasswordAmanKamu123!@localhost:3306/wad_capstone"

    JWT_ACCESS_SECRET="ganti_kunci_rahasia_jwt_produksi_yang_panjang_dan_aman_1"
    JWT_REFRESH_SECRET="ganti_kunci_rahasia_jwt_produksi_yang_panjang_dan_aman_2"
    ```
3.  Jalankan instalasi dependensi, migrasi Prisma, dan generate client:
    ```bash
    npm install
    npx prisma migrate deploy
    npx prisma generate
    npx prisma db seed # Opsional: Isi data awal
    ```

---

### Langkah 5: Deployment & Konfigurasi Aplikasi Frontend

1.  Clone atau unggah repositori proyek frontend (`wad-frontend`) ke VPS ke dalam folder `/var/www/wad-frontend`.
2.  Buka terminal di folder frontend, lakukan instalasi dan build bundel produksi:
    ```bash
    npm install
    npm run build
    ```

---

### Langkah 6: Manajemen Proses dengan PM2
PM2 digunakan untuk menjaga agar proses backend dan frontend terus berjalan di latar belakang (daemon) dan otomatis menyala kembali jika server reboot.

1.  Instal PM2 secara global:
    ```bash
    npm install pm2 -g
    ```
2.  Jalankan backend:
    ```bash
    cd /var/www/wad-capstone
    pm2 start src/index.js --name "wad-backend"
    ```
3.  Jalankan frontend (menggunakan perintah preview dari Vite):
    ```bash
    cd /var/www/wad-frontend
    pm2 start "npm run preview -- --port 4173 --host" --name "wad-frontend"
    ```
4.  Konfigurasikan PM2 agar otomatis berjalan saat server *reboot*:
    ```bash
    pm2 save
    pm2 startup
    ```
    *Salin dan jalankan perintah keluaran dari `pm2 startup` di terminal Anda.*

---

### Langkah 7: Konfigurasi Nginx sebagai Reverse Proxy
Nginx digunakan untuk memetakan lalu lintas dari port standard `80` (HTTP) ke port aplikasi internal (`4173` untuk frontend dan `3000` untuk backend/WebSocket).

1.  Instal Nginx di server:
    ```bash
    sudo apt install nginx -y
    ```
2.  Konfigurasikan file server default:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
3.  Ganti isi file tersebut dengan konfigurasi reverse proxy berikut:
    ```nginx
    server {
        listen 80;
        server_name domain-kamu.com www.domain-kamu.com; # Ganti dengan domain Anda

        # 1. Routing Frontend
        location / {
            proxy_pass http://localhost:4173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 2. Routing REST API Backend
        location /api {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 3. Routing WebSockets (Socket.IO)
        location /socket.io {
            proxy_pass http://localhost:3000/socket.io;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    ```
4.  Lakukan pengujian dan muat ulang konfigurasi Nginx:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

### Langkah 8: Mengaktifkan HTTPS (Let's Encrypt SSL)
1.  Instal Certbot untuk mengotomasi sertifikat SSL:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Minta sertifikat SSL baru dan biarkan Certbot mengubah konfigurasi Nginx secara otomatis:
    ```bash
    sudo certbot --nginx -d domain-kamu.com -d www.domain-kamu.com
    ```
3.  Verifikasi pembaruan otomatis sertifikat SSL:
    ```bash
    sudo systemctl status certbot.timer
    ```

---

## 🛠️ Tips Pemecahan Masalah (Troubleshooting) di VPS
*   **Melihat Log Aplikasi**:
    ```bash
    pm2 logs wad-backend
    pm2 logs wad-frontend
    ```
*   **Melihat Status Proses PM2**:
    ```bash
    pm2 status
    ```
*   **Melihat Log Nginx (Jika Web Tidak Bisa Diakses)**:
    ```bash
    sudo tail -f /var/log/nginx/error.log
    ```
