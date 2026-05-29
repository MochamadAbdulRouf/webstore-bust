# Bust — Digital Game Marketplace: Implementation Plan

## Overview

**Bust** is a full-stack digital game marketplace inspired by Steam but with its own unique identity. The application features a dark cyberpunk/futuristic aesthetic with smooth purple tones, a light/dark mode toggle, and a complete e-commerce flow for digital games.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Styling | CSS Modules + CSS Variables (dark/light mode) |
| State | Zustand |
| File Storage | Local filesystem (multer) |
| API Communication | Axios with interceptors |

---

## Project Structure

```
webstore-ecommerce/
├── backend/                     # Express API server
│   ├── prisma/
│   │   ├── schema.prisma        # DB models
│   │   └── seed.ts              # Seed data
│   ├── src/
│   │   ├── config/              # DB, JWT, multer config
│   │   ├── middleware/          # auth, admin, error handler
│   │   ├── modules/
│   │   │   ├── auth/            # controller, service, routes
│   │   │   ├── games/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── library/
│   │   │   ├── reviews/
│   │   │   ├── admin/
│   │   │   └── users/
│   │   ├── utils/               # helpers, response formatter
│   │   └── app.ts               # Express app entry
│   ├── uploads/                 # local game file storage
│   ├── .env
│   └── package.json
│
└── frontend/                    # Next.js 14 App Router
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx       # root layout + theme provider
    │   │   ├── page.tsx         # Home (game list)
    │   │   ├── game/[id]/       # Game detail
    │   │   ├── cart/            # Cart page
    │   │   ├── checkout/        # Checkout page
    │   │   ├── library/         # User library
    │   │   ├── profile/         # User profile
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   └── admin/           # Admin dashboard
    │   ├── components/
    │   │   ├── ui/              # Button, Card, Input, Modal, Badge, Spinner
    │   │   ├── layout/          # Navbar, Footer, Sidebar
    │   │   ├── games/           # GameCard, GameGrid, GameDetail, GameSearch
    │   │   ├── cart/            # CartItem, CartSummary
    │   │   ├── library/         # LibraryCard, DownloadButton
    │   │   ├── reviews/         # ReviewCard, ReviewForm, StarRating
    │   │   └── admin/           # GameForm, SalesTable, FileUpload
    │   ├── store/               # Zustand stores
    │   │   ├── useAuthStore.ts
    │   │   ├── useCartStore.ts
    │   │   └── useThemeStore.ts
    │   ├── hooks/               # useGames, useAuth, useCart, useLibrary
    │   ├── lib/
    │   │   ├── api.ts           # Axios instance + interceptors
    │   │   └── utils.ts         # formatPrice, formatDate, etc.
    │   ├── types/               # TypeScript interfaces
    │   └── styles/
    │       ├── globals.css      # CSS variables, reset, utilities
    │       └── themes.css       # Dark/light mode tokens
    └── package.json
```

---

## Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  avatar    String?
  balance   Float    @default(0)
  isAdmin   Boolean  @default(false)
  createdAt DateTime @default(now())

  orders    Order[]
  library   Library[]
  reviews   Review[]
  cart      CartItem[]
  wishlist  Wishlist[]
}

model Game {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  imageUrl    String?
  fileUrl     String?
  fileSize    String?
  category    String
  tags        String[]
  publisher   String
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
  library     Library[]
  reviews     Review[]
  cartItems   CartItem[]
  wishlist    Wishlist[]
}

model Order {
  id        String      @id @default(uuid())
  userId    String
  total     Float
  status    OrderStatus @default(COMPLETED)
  createdAt DateTime    @default(now())

  user      User        @relation(...)
  items     OrderItem[]
}

model OrderItem {
  id      String @id @default(uuid())
  orderId String
  gameId  String
  price   Float

  order   Order  @relation(...)
  game    Game   @relation(...)
}

model Library {
  userId    String
  gameId    String
  addedAt   DateTime @default(now())

  user      User @relation(...)
  game      Game @relation(...)

  @@id([userId, gameId])
}

model Review {
  id        String   @id @default(uuid())
  userId    String
  gameId    String
  rating    Int      // 1-5
  comment   String
  createdAt DateTime @default(now())

  user      User @relation(...)
  game      Game @relation(...)
  @@unique([userId, gameId])
}

model CartItem {
  userId    String
  gameId    String
  addedAt   DateTime @default(now())

  user      User @relation(...)
  game      Game @relation(...)
  @@id([userId, gameId])
}

model Wishlist {
  userId    String
  gameId    String
  addedAt   DateTime @default(now())

  @@id([userId, gameId])
}
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh JWT |

### Games
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/games` | List games (with search, filter, pagination) |
| GET | `/api/games/:id` | Game detail |
| GET | `/api/games/featured` | Featured games |
| GET | `/api/games/categories` | All categories |

### Cart
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart` | Add item to cart |
| DELETE | `/api/cart/:gameId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders/checkout` | Checkout cart, create order |
| GET | `/api/orders` | User order history |
| GET | `/api/orders/:id` | Order detail |

### Library
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/library` | User's game library |
| GET | `/api/library/:gameId/download` | Download game (JWT protected) |

### Reviews
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/games/:id/reviews` | Game reviews |
| POST | `/api/games/:id/reviews` | Post review (must own game) |
| DELETE | `/api/reviews/:id` | Delete own review |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/balance` | Add balance (simulated) |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/games` | Create game |
| PUT | `/api/admin/games/:id` | Update game |
| DELETE | `/api/admin/games/:id` | Delete game |
| POST | `/api/admin/games/:id/upload` | Upload game file |
| GET | `/api/admin/sales` | Sales statistics |
| GET | `/api/admin/users` | User list |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero banner + featured games + game grid |
| `/auth/login` | Login form |
| `/auth/register` | Register form |
| `/game/[id]` | Game detail — screenshots, reviews, add to cart |
| `/cart` | Cart page with item list + summary |
| `/checkout` | Checkout confirmation + balance check |
| `/library` | User's owned games + download button |
| `/profile` | User info, order history, balance top-up |
| `/admin` | Admin dashboard — sales, game management |
| `/admin/games/new` | Create new game form |
| `/admin/games/[id]/edit` | Edit game form |

---

## Design System

### Color Tokens (CSS Variables)
```css
/* Dark mode (default) */
--bg-primary: #0d0d14;
--bg-secondary: #13131f;
--bg-card: #1a1a2e;
--accent-purple: #7c3aed;
--accent-purple-light: #a855f7;
--accent-glow: rgba(124, 58, 237, 0.3);
--text-primary: #f1f0ff;
--text-secondary: #9d9db8;
--border: rgba(124, 58, 237, 0.2);
--success: #10b981;
--danger: #ef4444;

/* Light mode */
--bg-primary: #f5f3ff;
--bg-secondary: #ede9fe;
--bg-card: #ffffff;
--text-primary: #1e1b4b;
--text-secondary: #6b7280;
```

### Key UI Patterns
- **Glassmorphism cards** with backdrop-filter blur
- **Neon glow** on hover/focus elements
- **Smooth transitions** (cubic-bezier) on all interactive elements
- **Gradient text** for headings
- **Grid layout** for game cards (responsive 1–4 cols)
- **Floating particles** on hero section (CSS animation)
- **Cyberpunk grid** background texture

---

## Implementation Phases

### Phase 1 — Backend Foundation
1. Setup Express + TypeScript + Prisma
2. Configure PostgreSQL connection
3. Define all Prisma models + run migrations
4. Seed database with sample games

### Phase 2 — Backend API Modules
5. Auth module (register, login, JWT middleware)
6. Games module (CRUD, search, filter)
7. Cart module
8. Orders + checkout module
9. Library module + secure download
10. Reviews module
11. Admin module + file upload (multer)
12. Users module

### Phase 3 — Frontend Foundation
13. Next.js setup + Zustand stores
14. Design system (CSS variables, globals.css)
15. Core UI components (Button, Card, Input, Modal, etc.)
16. Layout components (Navbar with theme toggle, Footer)
17. API client (Axios + interceptors)

### Phase 4 — Frontend Pages
18. Auth pages (login, register)
19. Home page (hero, featured, game grid, search)
20. Game detail page
21. Cart + Checkout pages
22. Library page + download flow
23. Profile page
24. Admin dashboard

### Phase 5 — Polish & Integration
25. Error boundaries + loading states
26. Toast notifications
27. Responsive design checks
28. End-to-end integration testing

---

## Verification Plan

### Backend
- Run `npx ts-node prisma/seed.ts` to verify DB connection + seed data
- Test API routes with Postman collection (or curl)
- Verify JWT middleware blocks unauthorized requests
- Verify admin-only endpoints reject non-admin users

### Frontend
- Start dev server and navigate all pages
- Test auth flow (register → login → profile)
- Test purchase flow (browse → cart → checkout → library)
- Test admin flow (add game → upload file)
- Verify theme toggle works on all pages
- Test responsive layout on mobile viewport

---

## Open Questions

> [!IMPORTANT]
> **PostgreSQL Setup**: Do you have PostgreSQL installed locally? If not, should I add a Docker Compose file for easy local setup?

> [!IMPORTANT]
> **Port Configuration**: Frontend will run on `localhost:3000`, backend on `localhost:5000`. Are these ports available on your machine?

> [!NOTE]
> **Seed Data**: I'll include 10-15 sample games with realistic placeholder data and generated images. Is this acceptable?

> [!NOTE]
> **Admin Account**: The seed will create a default admin account (`admin@bust.gg` / `Admin@123`) for the admin panel. Confirm this is fine.
