# Bust — Digital Game Marketplace: Remote VM Deployment Plan

This plan details the steps required to deploy the **Bust** webstore (frontend + backend + database) on a remote Linux Ubuntu VM with a public IP.

---

## Remote VM & Repository Details

* **VM Public IP**: `54.145.160.91`
* **SSH Port**: `22`
* **SSH Username**: `ubuntu`
* **SSH Key File**: `C:\Users\ASUS\Downloads\key-instance.pem`
* **GitHub Repository URL**: `https://github.com/MochamadAbdulRouf/webstore-bust.git`

---

## Proposed Deployment Steps

```mermaid
graph TD
    A[GitHub Repository] -->|Git Clone| B[Ubuntu VM Instance]
    B -->|Docker Compose| C[(PostgreSQL Container)]
    B -->|PM2 / Node| D[Express Backend:5000]
    B -->|PM2 / Next| E[Next.js Frontend:3000]
```

### 1. Host Preparation (Ubuntu VM via SSH)
We will execute commands over SSH to provision the VM:
* Update APT packages: `sudo apt update && sudo apt upgrade -y`
* Install **Git**: `sudo apt install git -y`
* Install **Node.js 18+ (LTS) & NPM**: Install via NodeSource.
* Install **Docker & Docker Compose**: to run the PostgreSQL database.
* Install **PM2** globally: `sudo npm install -g pm2`

### 2. Code Cloning & Environment Configuration
* Clone the repository to the VM:
  ```bash
  git clone https://github.com/MochamadAbdulRouf/webstore-bust.git ~/webstore-bust
  ```
* Configure the environment variables:
  * **Backend `.env`** (`~/webstore-bust/backend/.env`):
    ```env
    PORT=5000
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/webstore_bust?schema=public"
    JWT_SECRET="super-secret-jwt-key-change-in-prod"
    JWT_EXPIRES_IN="7d"
    ```
  * **Frontend `.env.local`** (`~/webstore-bust/frontend/.env.local`):
    ```env
    NEXT_PUBLIC_API_URL="http://54.145.160.91:5000/api"
    ```

### 3. Database Execution & Seeding
* Create/Verify `docker-compose.yml` to run the PostgreSQL service container.
* Spin up PostgreSQL: `docker compose up -d`
* In `~/webstore-bust/backend`:
  * Install dependencies: `npm install`
  * Run Prisma migrations to construct the database schema: `npx prisma migrate deploy` (or `dev` if initializing first time)
  * Seed the database with 15 initial games and admin account: `npm run db:seed`

### 4. Build & Service Launch
* **Backend**:
  * Build TypeScript code: `npm run build`
  * Launch via PM2: `pm2 start dist/server.js --name bust-backend`
* **Frontend**:
  * Install dependencies: `npm install`
  * Build Next.js site: `npm run build`
  * Launch via PM2: `pm2 start "npm start" --name bust-frontend`
* Configure PM2 to start on boot: `pm2 save && pm2 startup`

---

## Verification Plan

### Automated Verification
* Verify PM2 services running status: `pm2 status`
* Inspect backend logs: `pm2 logs bust-backend --no-enum`
* Check docker container status: `docker ps`
* Verify ports 3000 and 5000 are listening on the VM: `sudo ss -tulpn`

### Manual Verification
* Access `http://54.145.160.91:3000` via web browser.
* Verify user authentication, game catalog rendering, search functionality, cart addition, and library dashboard downloads.
