# Shopzy - Social Commerce Marketplace

> **हर भारतवासी का शॉपिंग साथी** — An original social-commerce marketplace inspired by the zero-commission, direct-from-manufacturer reselling model.

Shopzy empowers artisans, weavers, and small manufacturers across India (Surat, Jaipur, Varanasi, Kolkata) to sell directly to consumers and social resellers with **0% marketplace commission**, **Cash on Delivery (COD)**, and a **human-like AI Shopping Assistant**.

---

## 🌟 Key Features

### 🛍️ Product Marketplace
- **Direct-from-Weaver Catalog**: Realistic Indian marketplace products across Women Ethnic (Kurtis, Sarees, Lehengas), Western Wear, Men's Fashion, Jewellery, and Home Decor.
- **Detailed Product Specifications**: Fabric types, color variants, size selections, and verified customer reviews.

### 🔎 Search, Categories, Filters & Sorting
- Category carousel and interactive filter sidebar.
- Price filters (Under ₹300, Under ₹500, Under ₹800, Under ₹1,200), minimum star rating, fabric types, and color filters.
- Toggles for **Free Delivery** and **Cash on Delivery (COD)**.
- Sorting by popularity, price (low to high / high to low), rating, and newest arrivals.

### 🤖 Human-like AI Shopping Assistant ("Sathi AI")
- Powered server-side by Google DeepMind's **Gemini API** (`@google/genai` SDK) with robust fallback heuristics.
- Natural language queries in Hindi, Hinglish, and English:
  - *"Mujhe wedding ke liye kurti chahiye under 800"*
  - *"Show me something similar but cheaper"*
  - *"Which one is better?"*
  - *"Mera order kaha hai?"* (Direct package lookup)
  - *"Add the black one to my cart"* (Direct cart addition)
- Live interactive product cards rendered directly inside chat messages with one-click **Add to Cart**.
- Real-time typing indicators and chat session history persistence.

### 💼 Social Reseller Margin Engine
- Enables users to resell items to their WhatsApp & Instagram contacts with zero inventory risk.
- Configurable profit margin per product (e.g., Buy wholesale at ₹399, set customer price at ₹599, earn ₹200).
- Transparent invoice breakdown with direct bank/UPI payout tracking.

### 🛒 Cart & Checkout
- Quantity modifiers and per-item margin editing.
- Coupon engine supporting `SATHI100` (₹100 off on ₹500+) and `PEHLIBAAR` (₹50 off on ₹300+).
- Address management supporting Indian PIN codes, landmark entry, and phone numbers.
- Payment methods: **Cash on Delivery (COD)**, **Instant UPI** with QR code simulation, and Net Banking/Cards.

### 📦 Order Tracking & Timeline
- Step-by-step visual tracker: *Ordered → Packed → Shipped → In Transit → Delivered*.
- Courier details (Delhivery, Shadowfax, Xpressbees) and live tracking events with timestamps and locations.

### 🏪 Seller & 📊 Admin Dashboards
- **Seller Dashboard**: Real-time sales metrics, product inventory management, "List New Product" modal, and order dispatch status updater.
- **Admin Dashboard**: Platform GMV analytics, seller activity, and central order status controller.
- **Role Switcher**: Easily switch between **Customer (Priya)**, **Seller (Ramesh Fab Hub)**, and **Super Admin** with one click in the navigation bar.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, ES Modules / TSX
- **AI Engine**: `@google/genai` (Gemini API server-side proxy)
- **Data Layer**: In-memory database with realistic seeded Indian marketplace catalog

```
├── backend/
│   ├── app.ts                 # Express application setup
│   ├── config/db.ts           # In-memory database & seeded catalog
│   ├── controllers/           # Auth, Product, Cart, Order, Chat
│   ├── middleware/            # Auth & Role verification
│   ├── models/                # User, Product, Cart, Order, Chat models
│   ├── routes/                # API routing endpoints (/api/*)
│   └── services/              # Gemini AI Service & Recommendation Service
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, MobileNav, ProductCard, AIChatDrawer, etc.
│   │   ├── context/           # Auth, Cart, and Wishlist contexts
│   │   ├── pages/             # Home, Cart, Checkout, Orders, Wishlist, Dashboards
│   │   ├── services/api.ts    # Client API communication
│   │   ├── types.ts           # Core TypeScript definitions
│   │   ├── App.tsx            # Main application orchestrator
│   │   └── main.tsx           # Client entry point
│   ├── index.html
│   └── vite.config.ts
├── backend/server.ts          # API server entry point
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file or configure your environment with:

```env
# Required for Gemini AI shopping assistant
GEMINI_API_KEY="your-gemini-api-key"

# App hosting URL (automatically provided in Cloud Run / AI Studio)
APP_URL="http://localhost:3000"
PORT=3000
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000"
```

---

## 🚀 Getting Started (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Servers
```bash
npm run dev
```
The frontend runs on `http://localhost:5173` and the Express API runs on `http://localhost:3000`.
You can also run them independently with `npm run dev:frontend` and `npm run dev:backend`.

### 3. Build for Production
```bash
npm run build
```
This compiles the Vite frontend into `frontend/dist/` and bundles the backend into `dist/server.cjs`.

### 4. Start Production Server
```bash
npm run start
```
