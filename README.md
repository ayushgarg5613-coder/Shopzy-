# Shopzy

Shopzy is a full-stack social-commerce marketplace demo for Indian customers, sellers, and platform administrators. It combines a React shopping experience with an Express API, seeded marketplace data, role-based dashboards, reseller margins, order tracking, and a server-side Sathi AI shopping assistant.

> **हर भारतवासी का शॉपिंग साथी**

## What the application does

### Customer experience

- Browse seeded products across fashion, jewellery, home, beauty, and kids categories.
- Search products and filter by category, price, rating, fabric, color, free delivery, and COD availability.
- Sort by popularity, price, rating, or newest arrivals.
- Open a product modal to inspect images, variants, stock, delivery, reviews, and similar products.
- Add products to a cart with quantity, color, size, and reseller margin.
- Save products to a wishlist.
- Apply checkout coupons: `SATHI100` and `PEHLIBAAR`.
- Checkout using COD, UPI, net banking, or card simulation.
- Save and select Indian delivery addresses.
- View orders and a timeline containing ordered, packed, shipped, in-transit, and delivered states.
- Ask Sathi AI for product discovery, cheaper alternatives, comparisons, order status, and cart actions.
- Submit product reviews after signing in.

### Seller experience

The seller dashboard exposes seller metrics, seller-owned products, inventory/product creation, and order status updates. Sellers can create, edit, and delete catalog items and update orders through role-protected API endpoints.

### Administrator experience

The admin dashboard exposes platform-level GMV/order information, seller activity, catalog controls, and order status management. Admins share the product and order management permissions required by the API.

### Sign-in and roles

The account menu supports sign-in with a phone number or email and sign-out. The demo also includes a role switcher for:

| Role | Seed user | Main permissions |
| --- | --- | --- |
| Customer | `priya@example.com` / `9876543210` | Browse, cart, orders, checkout, reviews, chat |
| Seller | `seller@example.com` / `9820011223` | Seller catalog and order operations |
| Admin | `admin@shopzy.in` / `9999988888` | Admin catalog and order operations |

Signing in with an unknown email or phone creates a new demo customer unless a role is explicitly supplied by the API. The client stores the returned token in `localStorage` under `shopsathi_token`.

## Architecture

```text
Browser
  main.tsx
    AuthProvider
      CartProvider
        WishlistProvider
          MainApp (App.tsx)
            Navbar / MobileNav
            Pages and reusable components
            services/api.ts
                 |
                 | fetch + Bearer token
                 v
Express API (backend/server.ts -> backend/app.ts)
  middleware: CORS, auth, role checks
  routes -> controllers -> models -> in-memory seeded data
                              |
                              +-- AIService -> Gemini API or fallback logic
                              +-- RecommendationService
```

The frontend does not use a client-side router. `App.tsx` keeps an `activeView` state and renders the appropriate page. Product/catalog filters are also held in `App.tsx`; changing filters triggers a new product and category request.

## Repository structure

```text
backend/
  app.ts                         Express app, CORS, health check, route mounting
  server.ts                      Loads .env and starts port 3000
  config/db.ts                   Seed categories, users, addresses, products, orders
  controllers/                   HTTP request handlers
  middleware/
    authMiddleware.ts            Resolves Bearer/x-user-id/query user IDs
    roleMiddleware.ts            Enforces customer/seller/admin permissions
  models/                        In-memory CRUD and domain operations
  routes/                        Auth, product, cart, order, and chat routes
  services/
    aiService.ts                 Gemini integration and fallback chat behavior
    recommendationService.ts    Similar, cheaper, budget, and comparison logic

frontend/
  src/
    App.tsx                      Main view switcher and catalog orchestration
    main.tsx                     React entry point and provider tree
    types.ts                     Shared domain types
    services/api.ts              Fetch wrapper for the backend API
    context/                     Auth, cart, and wishlist state
    components/                  Navbar, navigation, product, modal, chat, timeline
    pages/                       Home, cart, checkout, orders, profile, dashboards
    index.css                    Tailwind/base styling
  index.html                     Vite HTML entry point
  vite.config.ts                 Vite and Tailwind configuration
```

## Frontend implementation

### Provider and state flow

`main.tsx` mounts `App` inside `AuthProvider`, `CartProvider`, and `WishlistProvider`.

- `AuthContext.tsx` loads `/api/auth/profile` on startup, exposes `user`, `role`, `loading`, `login`, `logout`, and `switchRole`.
- `CartContext.tsx` loads the current cart and refreshes it after cart mutations or user changes.
- `WishlistContext.tsx` keeps wishlist selections available to product cards, the navbar count, and the wishlist page.
- `App.tsx` loads products/categories with the current `FilterState`, routes view changes through callbacks, and owns product modal/chat/order confirmation state.
- `Navbar.tsx` owns search input and the account dropdown. Its sign-in form calls `AuthContext.login`; sign-out clears the stored token and user state.

### Main frontend components

- `HomePage`: category browsing, filter sidebar, product grid, and AI entry points.
- `ProductCard`: price, discount, rating, delivery/COD information, wishlist, and cart actions.
- `ProductModal`: product details, variants, reviews, recommendations, and review submission.
- `CartPage`: cart quantities, reseller margin, coupons, totals, and checkout transition.
- `CheckoutPage`: address selection/creation, payment selection, and order creation.
- `OrdersPage` and `OrderTimeline`: order list, detail view, status timeline, and tracking information.
- `SellerDashboard` and `AdminDashboard`: role-specific operational views.
- `AIChatDrawer`: chat history, prompt submission, product cards, add-to-cart actions, and quick prompts.
- `MobileNav`: compact navigation for home, categories, AI, orders, cart, and profile.

## Backend implementation

### Request lifecycle

1. `server.ts` loads environment variables and creates the Express app.
2. `app.ts` enables JSON/urlencoded bodies, CORS, `/api/health`, and route mounting.
3. Protected routes run `authMiddleware`, which resolves a user from `Authorization: Bearer <userId>`, `x-user-id`, or `userId` query input.
4. Role-protected routes run `requireRole(['seller', 'admin'])` after authentication.
5. Controllers validate request data, call model/service methods, and return JSON responses.
6. Models mutate the in-memory arrays initialized in `config/db.ts`.

### Model responsibilities

- `UserModel`: find/create/update users by ID or email/phone.
- `ProductModel`: list, find, create, update, delete, and review products.
- `CategoryModel`: list categories and find by slug.
- `CartModel`: get, add, update, remove, and clear user cart items.
- `OrderModel`: create orders, list user orders, retrieve details, and update status history.
- `ChatModel`: persist chat messages by session ID and clear history.
- `ReviewModel`: read product reviews and upvote reviews.

## API reference

All endpoints are prefixed with `/api`. JSON responses normally contain `success` and either the requested data or `error`.

### Health and authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Returns API health, brand, and timestamp |
| POST | `/auth/login` | No | Accepts `{ identifier, role? }`; returns `{ user, token }` |
| GET | `/auth/profile` | Yes | Returns the authenticated user |
| POST | `/auth/switch-demo-user` | No | Accepts `{ role }` and returns a seeded role user |
| GET | `/auth/users` | No | Lists seeded/in-memory users |

### Products and reviews

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/products` | No | Lists products; supports category, price, rating, search, fabric, color, delivery, COD, and sort query parameters |
| GET | `/products/categories` | No | Lists categories |
| GET | `/products/:id` | No | Gets one product |
| POST | `/products` | Seller/Admin | Creates a product |
| PUT | `/products/:id` | Seller/Admin | Updates a product |
| DELETE | `/products/:id` | Seller/Admin | Deletes a product |
| POST | `/products/:id/reviews` | Yes | Accepts `{ rating, comment }` and adds a review |

### Cart

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/cart` | Get the authenticated user cart |
| POST | `/cart/add` | Add `{ productId, quantity, selectedColor, selectedSize, resellMargin }` |
| PUT | `/cart/items/:id` | Update quantity, margin, color, or size |
| DELETE | `/cart/items/:id` | Remove one item |
| DELETE | `/cart/clear` | Clear the cart |

### Orders and addresses

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/orders` | Yes | List the current user's orders |
| GET | `/orders/:id` | Yes | Get one order |
| POST | `/orders` | Yes | Create an order with shipping address, payment method, and optional coupon |
| PATCH | `/orders/:id/status` | Seller/Admin | Update status, note, and location |
| GET | `/orders/addresses` | Yes | List saved addresses |
| POST | `/orders/addresses` | Yes | Add a saved address |

### AI chat

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/chat/history?sessionId=` | Load chat history |
| POST | `/chat/send` | Send `{ query, currentProductId?, sessionId? }` |
| POST | `/chat/clear` | Clear `{ sessionId? }` chat history |

## Sathi AI implementation

`ChatController.sendMessage` stores the user's message, calls `AIService.processShoppingQuery`, stores the assistant response, and returns the response plus product/action metadata.

`AIService` uses the Gemini SDK when `GEMINI_API_KEY` is available. The prompt includes catalog context and instructs the model to respond to Hindi, Hinglish, and English shopping requests. If Gemini is unavailable or errors, local fallback logic still supports common intents. `RecommendationService` supplies similar products, cheaper alternatives, budget searches, and product comparisons.

The client renders returned product recommendations directly in the chat and can execute returned add-to-cart actions through the cart API.

## Environment variables

Create `.env` in the repository root when needed:

```env
# Optional: enables Gemini-backed Sathi AI
GEMINI_API_KEY=your-gemini-api-key

# API server
PORT=3000

# Browser/API configuration
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000

# Optional hosting metadata used by deployment environments
APP_URL=http://localhost:3000
```

Without `VITE_API_URL`, the frontend uses relative `/api` URLs, which is useful when a reverse proxy serves both frontend and backend from one origin.

## Local development

### Requirements

- Node.js 20 or newer recommended
- npm
- Optional Gemini API key for live AI responses

### Install

```bash
npm install
```

### Run frontend and backend together

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`

The combined script starts both processes. If either port is already occupied, Vite may choose another frontend port and the backend will fail to bind; stop the existing process or set a different `PORT` before starting.

### Run separately

```bash
npm run dev:frontend
npm run dev:backend
```

### Validate and build

```bash
npm run lint       # TypeScript check: tsc --noEmit
npm run build      # Vite frontend build + bundled backend at dist/server.cjs
npm run preview    # Preview the built frontend on port 5173
npm run start      # Start dist/server.cjs in production mode
npm run clean      # Remove dist and frontend/dist
```

## Data, authentication, and production limitations

This repository is intentionally a demo implementation.

- Data is stored in memory. Restarting the backend resets products, carts, users, chat history, and orders to seed state.
- The token is the user ID, not a signed JWT or session credential.
- The backend auth middleware falls back to `user-priya` when no user ID is supplied. Replace this behavior with strict authentication before production use.
- The `/auth/users` and demo role-switch endpoints are intentionally open for the demo and must be protected or removed in production.
- Payment methods are UI/API simulations; no payment provider is charged.
- CORS is configured for one `FRONTEND_URL` value and should be tightened for deployment.
- There are no automated test suites in the repository currently; `npm run lint` is the available baseline validation.
- External Unsplash image URLs are used by seeded products and categories.

## Recommended production work

1. Replace the in-memory models with a persistent database and migrations.
2. Add signed, expiring sessions or JWTs with refresh/revocation support.
3. Remove the default-user fallback and open demo endpoints.
4. Add input validation, rate limiting, structured error handling, and audit logs.
5. Integrate a real payment provider, shipping provider, image storage, and notification service.
6. Add unit, API integration, and browser end-to-end tests.

## License

No license has been specified in this repository.
