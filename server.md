# Panduan Deployment Server & Troubleshooting - Bust Webstore

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan deployment aplikasi **Bust** (Express Backend, Next.js Frontend, & PostgreSQL Database) di server Ubuntu secara *production-grade*, berdasarkan implementasi yang telah dilakukan.

---

## 📋 Prasyarat Server & Koneksi

* **OS Server**: Ubuntu 20.04 / 22.04 / 24.04 LTS
* **Akses SSH**: SSH key (`key-instance.pem`) atau password dengan privilege `sudo`.
* **Port Terbuka (Firewall / Security Group)**:
  * `22` (SSH)
  * `80` / `443` (HTTP/HTTPS - Opsional untuk Nginx reverse proxy)
  * `3000` (Next.js Frontend)
  * `5000` (Express API Backend)

---

## 🛠️ Langkah 1: Persiapan Host & Instalasi Dependensi

Sambungkan ke VM Anda menggunakan SSH:
```bash
ssh -i key-instance.pem ubuntu@54.145.160.91
```

Setelah masuk ke server, jalankan perintah berikut untuk memperbarui paket sistem dan menginstal *runtime/tools* pendukung:

### 1. Update Paket Sistem & Install Git
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install git curl -y
```

### 2. Install Node.js v20 (LTS) & NPM
Next.js 16 membutuhkan Node.js versi `>= 20.9.0`. Jalankan script Nodesource untuk mengonfigurasi repositori Node.js 20 dan menginstalnya:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
*Verifikasi instalasi:*
```bash
node -v  # Output harus v20.x.x
npm -v   # Output harus v10.x.x
```

### 3. Install Docker Engine & Docker Compose
Docker digunakan untuk mengisolasi database PostgreSQL agar mudah diatur dan di-backup.
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh
```
*Terapkan perubahan grup user tanpa log out:*
```bash
newgrp docker
```

### 4. Install PM2 (Process Manager) Secara Global
PM2 digunakan untuk menjaga agar aplikasi Node.js tetap berjalan di latar belakang (background) dan mendeteksi jika aplikasi crash lalu merestartnya secara otomatis.
```bash
sudo npm install -g pm2
```

---

## 📂 Langkah 2: Cloning Proyek & Konfigurasi Lingkungan

### 1. Clone Repositori Proyek
```bash
git clone https://github.com/MochamadAbdulRouf/webstore-bust.git ~/webstore-bust
```

### 2. Buat File Environment Backend
Buat file `~/webstore-bust/backend/.env`:
```bash
cat << 'EOF' > ~/webstore-bust/backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bust_db?schema=public"
PORT=5000
NODE_ENV=production
JWT_SECRET="bust_super_secret_jwt_key_2024_change_in_production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="bust_refresh_secret_key_2024_change_in_production"
JWT_REFRESH_EXPIRES_IN="30d"
FRONTEND_URL="http://54.145.160.91:3000"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10737418240
EOF
```

### 3. Buat File Environment Frontend
Buat file `~/webstore-bust/frontend/.env.local`:
```bash
cat << 'EOF' > ~/webstore-bust/frontend/.env.local
NEXT_PUBLIC_API_URL="http://54.145.160.91:5000/api"
NEXT_PUBLIC_APP_NAME="Bust"
NEXT_PUBLIC_APP_URL="http://54.145.160.91:3000"
EOF
```

---

## 🗄️ Langkah 3: Menjalankan Database PostgreSQL

Aplikasi menggunakan Docker Compose untuk database PostgreSQL.

### 1. Jalankan Container Postgres
```bash
cd ~/webstore-bust
sudo docker compose up -d
```
*Periksa apakah container berjalan lancar:*
```bash
sudo docker ps
```

---

## 🚀 Langkah 4: Build & Deployment Aplikasi

### 1. Setup Backend (Prisma & PM2)
Instal dependensi, sinkronisasikan skema database, jalankan seeder, lakukan build, lalu jalankan service backend menggunakan PM2:
```bash
cd ~/webstore-bust/backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run build
pm2 start dist/server.js --name bust-backend
```

### 2. Setup Frontend (Build Next.js & PM2)
Instal dependensi, lakukan kompilasi aplikasi Next.js ke production, lalu jalankan menggunakan PM2:
```bash
cd ~/webstore-bust/frontend
npm install
npm run build
pm2 start "npm start" --name bust-frontend
```

### 3. Konfigurasi Autostart PM2 Saat Booting Server
Jalankan perintah ini agar PM2 secara otomatis memulihkan aplikasi jika server/VM Anda mati atau melakukan restart:
```bash
pm2 save
pm2 startup
```
*Catatan: PM2 startup akan menghasilkan perintah `sudo systemctl ...` di output terminal. Copy-paste perintah tersebut ke terminal Anda untuk mengaktifkan autostart sistem.*

---

## 🔍 Langkah 5: Verifikasi Status Deployment

### 1. Cek PM2 Status
Pastikan kedua service berstatus **online** dan uptime stabil:
```bash
pm2 status
```

### 2. Cek Log Aplikasi
Jika ada error, periksa output log backend atau frontend:
```bash
pm2 logs bust-backend
pm2 logs bust-frontend
```

### 3. Smoke Test via Terminal (cURL)
* **Backend Health Check:**
  ```bash
  curl -i http://localhost:5000/api/health
  # Respons harus berupa JSON status: "ok"
  ```
* **Database Connection Check (Fetch Games):**
  ```bash
  curl -s http://localhost:5000/api/games | head -c 200
  # Harus merespons dengan JSON games data
  ```
* **Frontend Check:**
  ```bash
  curl -I http://localhost:3000
  # Harus mengembalikan HTTP/1.1 200 OK
  ```

---

## 🛠️ Panduan Troubleshooting (Penyelesaian Masalah)

Berikut adalah skenario masalah yang mungkin terjadi beserta langkah penyelesaiannya.

### 1. Error: "Prisma schema validation - URL must start with postgresql://"
* **Penyebab**: Format penulisan string koneksi database di file `backend/.env` salah, ter-escape shell saat penulisan, atau memiliki spasi yang tidak terduga.
* **Solusi**:
  Buka file backend env:
  ```bash
  nano ~/webstore-bust/backend/.env
  ```
  Pastikan line `DATABASE_URL` didefinisikan persis seperti ini (tanpa tanda backslash `\` sebelum kutip):
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bust_db?schema=public"
  ```
  Simpan dan jalankan kembali:
  ```bash
  npx prisma migrate dev
  ```

### 2. Error: "Unsupported engine Next.js 16 requires node >= 20.9.0"
* **Penyebab**: Node.js di server adalah versi lama (misal v16 atau v18).
* **Solusi**: Upgrade Node.js ke versi 20 LTS:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
  Setelah itu, restart PM2 daemon agar memuat versi Node.js yang baru:
  ```bash
  pm2 update
  ```

### 3. PM2 Process "bust-frontend" terus menerus restart (Status: errored / loop)
* **Penyebab**:
  * Build folder `.next` belum dibuat atau gagal kompilasi.
  * Port `3000` sudah dipakai oleh aplikasi lain.
* **Solusi**:
  1. Hapus proses PM2 lama: `pm2 delete bust-frontend`.
  2. Lakukan build ulang secara manual untuk memastikan tidak ada error kode:
     ```bash
     cd ~/webstore-bust/frontend
     npm run build
     ```
  3. Cek port 3000 sedang digunakan atau tidak:
     ```bash
     sudo ss -tulpn | grep 3000
     ```
     Jika port terpakai, matikan aplikasi tersebut atau jalankan Next.js di port lain:
     ```bash
     pm2 start "npm start" --name bust-frontend -- -p 3001
     ```

### 4. Database Connection Refused / Database Tidak Konek ke Backend
* **Penyebab**: Docker PostgreSQL belum berjalan, nama database tidak sama, atau firewall memblokir port internal.
* **Solusi**:
  1. Periksa status Docker container:
     ```bash
     sudo docker ps
     ```
     Jika tidak ada container bernama `bust_postgres`, jalankan:
     ```bash
     cd ~/webstore-bust && sudo docker compose up -d
     ```
  2. Periksa log Docker untuk memastikan database PostgreSQL tidak crash:
     ```bash
     sudo docker logs bust_postgres
     ```
  3. Coba lakukan restart service backend PM2 agar mencoba koneksi ulang:
     ```bash
     pm2 restart bust-backend
     ```

### 5. Website tidak bisa diakses dari browser IP Publik (Connection Timed Out)
* **Penyebab**: Firewall server (UFW) atau Security Group di Cloud Provider (AWS/GCP/Alibaba) belum mengizinkan lalu lintas data masuk ke port `3000` (frontend) dan `5000` (backend).
* **Solusi**:
  * **Di Server (Ubuntu UFW)**:
    ```bash
    sudo ufw allow 3000/tcp
    sudo ufw allow 5000/tcp
    sudo ufw enable
    ```
  * **Di Cloud Provider Console**:
    Buka halaman manajemen Security Group instance VM Anda, lalu tambahkan **Inbound Rules**:
    * Type: `Custom TCP`, Port Range: `3000`, Source: `0.0.0.0/0` (Untuk semua pengunjung)
    * Type: `Custom TCP`, Port Range: `5000`, Source: `0.0.0.0/0` (Untuk komunikasi API)
