# Bust — Digital Game Marketplace

A full-stack digital game marketplace built with Next.js and Express.

## 🎮 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **State**: Zustand
- **Storage**: Local file system (multer)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup
Create a PostgreSQL database named `bust_db`.

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bust.gg | Admin@123 |
| User | demo@bust.gg | User@123 |

## 📁 Project Structure

```
webstore-ecommerce/
├── backend/              # Express API
│   ├── prisma/           # DB schema & seed
│   └── src/
│       ├── config/       # DB, JWT, multer config
│       ├── middleware/   # auth, admin, error
│       ├── modules/      # feature modules
│       └── utils/        # helpers
└── frontend/             # Next.js App
    └── src/
        ├── app/          # pages (App Router)
        ├── components/   # React components
        ├── store/        # Zustand stores
        ├── lib/          # API client & utils
        └── types/        # TypeScript types
```

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/games` | No | List games |
| GET | `/api/games/:id` | No | Game detail |
| POST | `/api/cart` | Yes | Add to cart |
| POST | `/api/orders/checkout` | Yes | Checkout |
| GET | `/api/library` | Yes | My library |
| GET | `/api/library/:id/download` | Yes | Download |
| POST | `/api/games/:id/reviews` | Yes | Post review |
| GET | `/api/admin/sales` | Admin | Sales data |
| POST | `/api/admin/games` | Admin | Create game |
