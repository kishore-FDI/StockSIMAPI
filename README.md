# 📈 Stock Trading Simulator – Backend

> 🧠 **From Order Placement to Price Discovery – All in One System**

This backend powers a **real-time stock trading simulator** that goes **beyond basic order management**. It **replicates the full trade lifecycle** from:

* 🛒 **Order request intake**
* ⚖️ **Order book management**
* 🤝 **Matching engine execution**
* 📡 **Price discovery**
* 💸 **Balance reservation & fund settlement**
* 📊 **Portfolio updates**
* 🔄 **Real-time notifications via WebSockets**

This isn’t just a simple CRUD system — it’s a **complete simulation of how a trading exchange operates**, including:

* ⏱ **Price determination** based on order flow
* 🧮 **Real-time market depth updates**
* 🧱 **Concurrency-safe execution with row-level locking**
* 🧰 **Robust state management**
* 📉 **Partial fills, order priority, and execution fairness**

Just like how exchanges like **Zerodha**, **Upstox**, or **NSE** operate internally, this backend reflects how orders affect market dynamics in real time.

--

## 🔥 Key Features (Production-Ready)

| Category              | Feature                                                             |
| --------------------- | ------------------------------------------------------------------- |
| 🧠 Matching Engine    | In-memory order matching with full/partial fill handling            |
| 🧾 Order Lifecycle    | Place, cancel, and execute orders with reservation model            |
| 🔐 Auth & Security    | JWT-based auth, Access + Refresh tokens, CSRF token enforcement     |
| 💸 Funds Management   | Reserved wallet & stock quantity tracking (no overspending/selling) |
| 🧱 Concurrency Safety | Row-level locking + Prisma transactions to prevent race conditions  |
| 📡 Real-Time Events   | Socket.IO events for trades, orders, and portfolio updates          |
| ⏳ Job Queue           | BullMQ + Redis to offload and queue matching jobs per stock         |
| 🚀 Scalable Design    | Loosely-coupled services, horizontal scaling possible               |
| 🧰 Caching Layer      | Redis caching for frequently accessed stock/order data              |
| 🧪 Input Validation   | Zod schema validation for robust API safety                         |
| 🔐 Brute-Force Guard  | Login attempt throttling (rate limiter ready)                       |
| 📚 Developer Ready    | Clean modular folder structure, Prisma ORM, REST + Socket endpoints |

---

## 🗂️ Folder Structure

```
api/
├── app.ts                # Express app setup
├── server.ts             # Socket.IO + Express bootstrapping
│
├── controllers/          # API logic per route
├── routes/               # REST route definitions
├── services/             # Order creation, cancel, reservation logic
├── models/prisma/        # Prisma client + schema
│
├── utils/
│   ├── matching-engine.ts   # Matching engine logic with locking
│   ├── errors.util.ts       # Custom error classes
│   └── zodSchemas.ts        # Input validation schemas
│
├── jobs/
│   ├── queue/               # BullMQ queues (e.g., matchOrders)
│   ├── processor/           # BullMQ workers
│   └── config/              # Redis connection config
│
├── socket/
│   ├── index.ts             # Socket.IO server setup
│   ├── handlers/            # Order/trade event emitters
│   └── namespaces/          # User + Stock namespaces
│
├── events/
│   ├── emitter.ts           # Node EventEmitter instance
│   ├── types.ts             # All event constants (e.g. ORDER_FILLED)
│   └── handlers/            # Socket event listeners (user, stock updates)
│
├── middlewares/
│   ├── auth.ts              # JWT Auth middleware
│   ├── csrf.ts              # CSRF protection
│   └── errorHandler.ts      # Unified error handling
│
└── .env                     # Environment variables
```

---

## 🧱 Concurrency & Consistency

### ✅ Row-Level Locking (Prisma + PostgreSQL)

* Ensures accurate balance/wallet updates
* Avoids race conditions in high-frequency environments

### ✅ Transactions Everywhere

* `prisma.$transaction()` ensures atomic writes during matching

### ✅ Reservation Model

* On `buy`: deduct from `wallet` → reserve in `reserved_wallet`
* On `sell`: lock `reserved_quantity` → fulfill after match

### ✅ In-Memory Matching

* Efficient, deterministic matching logic (FIFO + price-time priority)
* Finalized state written in DB only after match is confirmed

---

## 🔒 Security

| Mechanism           | Purpose                                   |
| ------------------- | ----------------------------------------- |
| ✅ JWT Auth          | Secure stateless sessions                 |
| ✅ Refresh Tokens    | Auto-refresh via HttpOnly cookies         |
| ✅ CSRF Token        | Prevents unauthorized cross-site requests |
| ✅ Input Validation  | All APIs validated with `zod`             |
| ✅ Brute-Force Guard | Easily extendable via express-rate-limit  |
| ✅ Role-Based Access | Extendable for admin panels               |

---

## 📡 WebSocket Events via Socket.IO

| Event Type          | Channel / Room     | Payload                           |
| ------------------- | ------------------ | --------------------------------- |
| `TRADE_EXECUTED`    | `stock:{stock_id}` | trade details (price, qty, users) |
| `ORDER_FILLED`      | `user:{user_id}`   | order status, remaining qty       |
| `ORDER_CANCELLED`   | `user:{user_id}`   | cancelled order ID                |
| `PORTFOLIO_UPDATED` | `user:{user_id}`   | updated wallet, holdings          |

---

## 🚀 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/Sherma-ThangamS/TradingSystemAPI
cd TradingSystemAPI
npm install
```

### 2. Configure `.env`

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/stockdb
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=super-secret-access
REFRESH_TOKEN_SECRET=super-secret-refresh
PORT=4000
```

### 3. Set up DB with Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Server

```bash
npm run dev
```

---

## 📦 API Endpoints

| Method   | Route                       | Description                |
| -------- | --------------------------- | -------------------------- |
| `POST`   | `/api/orders`               | Place buy/sell order       |
| `DELETE` | `/api/orders/:id`           | Cancel open order          |
| `GET`    | `/api/orders`               | List user's orders         |
| `GET`    | `/api/orders/:id`           | Get specific order details |
| `GET`    | `/api/stocks/:id/orderbook` | Get order book for a stock |

---

## 🧠 Redis Usage

* 💡 **BullMQ Queue backend**
* 📊 **Future: Cache public order book & stock info**
* 🔄 Easily extendable with Redis Pub/Sub for multi-node WS support

---

## 📚 Educational Value

This project demonstrates advanced backend engineering concepts:

* Queue-based decoupling (BullMQ)
* Real-time socket architecture
* ACID-safe matching engine
* Event-driven + REST hybrid system
* Scalable service structure

---

## 🏗 Future Roadmap

* ⏳ Limit orders with expiration (Time In Force)
* 🔐 Admin dashboard (NestJS or Next.js)
* 📈 Historical trade chart APIs
* 📉 Real P\&L & analytics
* 📃 Swagger API docs

---

## 👨‍💻 Maintained By

**Sherma Thangam S**
Backend Developer | System Designer | Code Performance Enthusiast
