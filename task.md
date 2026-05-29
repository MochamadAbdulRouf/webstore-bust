# Bust — Task Tracker

## Phase 1: Backend Foundation
- [x] Create task.md
- [x] Backend package.json + tsconfig + .env
- [x] Prisma schema (all models)
- [x] Prisma seed data (15 games, admin user)
- [x] Express app.ts + server.ts
- [x] Config files (db, jwt, multer)
- [x] Middleware (auth, admin, error)
- [x] Utils (response formatter, helpers)
- [x] Run npm install (backend)
- [x] Run prisma migrate + generate + seed (needs PostgreSQL running)

## Phase 2: Backend API Modules
- [x] Auth module (register, login, me, refresh)
- [x] Games module (list, detail, search, categories)
- [x] Cart module (get, add, remove, clear)
- [x] Orders module (checkout, history, detail)
- [x] Library module (list, download)
- [x] Reviews module (list, create, delete)
- [x] Admin module (CRUD games, upload, sales)
- [x] Users module (profile, update, balance)

## Phase 3: Frontend Foundation
- [x] Next.js 14 project init
- [x] Design system (globals.css, themes)
- [x] Zustand stores (auth, cart, theme)
- [x] API client (axios + interceptors)
- [x] TypeScript types
- [x] Utils / helpers

## Phase 4: Frontend UI Components
- [x] UI components (Button, Card, Input, Modal, Spinner, Toast) — need dedicated files
- [x] Layout components (Navbar, Footer)
- [x] Game components (GameCard + CSS module)
- [x] GameGrid + GameSearch components
- [x] Cart page component refinement
- [x] Library page component refinement
- [x] Review components (StarRating, ReviewCard)
- [x] ReviewForm standalone component
- [x] Admin GameForm standalone component

## Phase 5: Frontend Pages
- [x] Root layout + ThemeProvider + Providers
- [x] Home page — Suspense fix needed (build error)
- [x] Auth pages (login + register)
- [x] Game detail page ([slug]/page.tsx)
- [x] Cart page
- [x] Checkout page
- [x] Library page
- [x] Profile page
- [x] Admin dashboard

## Phase 6: Polish & Fix
- [x] Fix next.config.js → next.config.ts conflict
- [x] Fix Suspense boundaries for useSearchParams (home, profile, checkout)
- [x] Fix tailwind.config removal (not using tailwind)
- [x] Verify frontend build passes cleanly
- [x] Start both dev servers and smoke-test (Running under PM2 on VM)
- [x] Run DB migration + seed (Done on VM)
- [x] End-to-end integration check (Verified via API curls)
- [x] Responsive design final review
