# BidIndia 🇮🇳

### A public bidding-based advertising platform for Indian businesses

BidIndia is a platform where businesses compete for visibility by bidding for positions on public, category-based leaderboards.

Instead of traditional advertising where businesses continuously compete for impressions through opaque ad auctions, BidIndia makes promotional placement visible:

> **Businesses pay to compete for attention. Higher eligible spend means higher position on the board.**

The initial goal is to build an India-focused advertising and discovery platform covering businesses ranging from restaurants and local services to SaaS, finance, education, healthcare, real estate, and more.

---

## 🚧 Project Status

**Status:** Active development
**Stage:** MVP / Prototype

The project is being developed with a backend-first approach, with particular attention to:

* Secure payment processing
* Transaction integrity
* Idempotency
* Concurrent bidding
* Database transactions
* Authorization
* Ranking consistency
* Analytics
* Scalable system architecture

---

# 🎯 Core Idea

A business creates a listing and participates in a relevant advertising board.

For example:

```text
Restaurants → Ghaziabad

#1  Business A       ₹25,000
#2  Business B       ₹18,500
#3  Business C       ₹12,000
#4  Business D        ₹7,500
```

A business can increase its promotional spend to compete for a higher position.

The platform transforms advertising placement into a transparent public leaderboard.

---

# 🌐 Example Boards

BidIndia is designed around **category + geography**.

Examples:

```text
Restaurants — India
Restaurants — Uttar Pradesh
Restaurants — Delhi
Restaurants — Ghaziabad

Finance — India
SaaS — India
Education — India
Healthcare — Noida
Real Estate — Bangalore
```

This allows both national companies and smaller local businesses to participate in relevant markets.

---

# 🧠 Core System

The conceptual flow is:

```text
                  BUSINESS
                      │
                      ▼
               CREATE LISTING
                      │
                      ▼
                  CATEGORY
                      │
                      ▼
                    BOARD
                      │
                      ▼
                    BID
                      │
                      ▼
                  PAYMENT
                      │
                      ▼
             PAYMENT VERIFICATION
                      │
                      ▼
              ADVERTISING SPEND
                      │
                      ▼
               RANKING ENGINE
                      │
                      ▼
                LEADERBOARD
                      │
                      ▼
                  VISITORS
                      │
                      ▼
                 BUSINESS
```

---

# 🏗️ Planned Architecture

BidIndia is being built using a separated frontend and backend architecture.

```text
                       ┌───────────────┐
                       │   Next.js     │
                       │   Frontend    │
                       └───────┬───────┘
                               │
                             HTTPS
                               │
                               ▼
                       ┌───────────────┐
                       │ Node.js API   │
                       │ TypeScript    │
                       │   Express     │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        PostgreSQL           Redis       Payment Gateway
              │
              ▼
        Prisma ORM
```

---

# 🛠️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Node.js
* Express
* TypeScript
* Zod
* Prisma ORM

## Database

* PostgreSQL

## Planned Infrastructure

* Redis
* Payment gateway integration
* Cloud deployment
* Object storage for business assets

---

# 🗃️ Initial Domain Model

The initial backend domain contains:

```text
User
  │
  └── Business
          │
          ├── Category
          │
          ├── BoardMembership
          │       │
          │       └── Bid
          │
          ├── Payment
          │
          └── Click

Board
  │
  ├── Category
  ├── BoardMembership
  └── Click
```

### Main entities

**User**

Represents a platform account.

**Business**

Represents the business being advertised.

**Category**

Defines the business type.

**Board**

Represents a specific advertising competition such as:

```text
Restaurants → Ghaziabad
```

**BoardMembership**

Connects a business to a specific board.

**Bid**

Represents promotional spend associated with a board membership.

**Payment**

Represents the financial transaction independently from advertising spend.

**Click**

Stores business interaction analytics.

---

# 💰 Financial Data Model

Money is represented using integer minor units rather than floating-point values.

For INR:

```text
₹1       = 100 paise
₹500     = 50,000 paise
₹10,000  = 1,000,000 paise
```

The system is designed so that financial state is derived from verified payment events rather than arbitrary client-provided values.

---

# 🔐 Security Philosophy

Security is a first-class requirement of the project.

The backend will follow principles including:

### Never trust the client

The client does not determine:

```text
rank
payment success
final spend
ownership
authorization
```

### Payment verification

The intended flow is:

```text
Client
   ↓
Create payment
   ↓
Payment provider
   ↓
Server-side webhook
   ↓
Signature verification
   ↓
Payment validation
   ↓
Database transaction
   ↓
Advertising spend
   ↓
Ranking update
```

### Idempotency

Repeated payment callbacks must not create duplicate financial events.

### Authorization

A user must only be able to modify resources they are authorized to manage.

### Validation

External input is validated at the application boundary before reaching business logic or the database.

### Database integrity

Financial operations and ranking-related state changes will use database transactions where atomicity is required.

---

# ⚔️ The Interesting Backend Problem

One of the central engineering challenges is **concurrent bidding**.

Consider:

```text
Current #2 = ₹10,000
```

Two businesses simultaneously attempt:

```text
Business A → ₹10,001
Business B → ₹10,001
```

A naive implementation can produce inconsistent results because both requests may read the same previous state.

BidIndia therefore treats bidding as a concurrency-sensitive financial operation and will use appropriate transaction boundaries, database constraints, and idempotency mechanisms.

---

# 📊 Analytics

The platform is intended to provide businesses with measurable advertising performance.

Initial metrics include:

```text
Impressions
Clicks
CTR
Current position
Ranking history
Advertising spend
```

This lets a business understand not only its position but also whether that position generates useful traffic.

---

# 🧭 Planned API Structure

The API will evolve around domain-oriented modules.

```text
/api/v1

/auth
/users
/businesses
/categories
/boards
/bids
/payments
/analytics
/admin
```

The exact API contracts will be documented as implementation progresses.

---

# 📁 Planned Project Structure

```text
bidindia/
│
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── businesses/
│   │   │   ├── categories/
│   │   │   ├── boards/
│   │   │   ├── bidding/
│   │   │   ├── payments/
│   │   │   └── analytics/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── prisma/
│       └── schema.prisma
│
└── README.md
```

---

# 🚀 MVP Roadmap

### Phase 1 — Foundation

* [x] Define initial product model
* [x] Define database domain
* [x] Initialize Prisma
* [ ] Finalize database schema
* [ ] Configure backend
* [ ] Add application security middleware
* [ ] Add centralized error handling
* [ ] Add health checks

### Phase 2 — Identity & Businesses

* [ ] User registration
* [ ] Authentication
* [ ] Authorization
* [ ] Business creation
* [ ] Business management
* [ ] Business profile

### Phase 3 — Discovery

* [ ] Categories
* [ ] Boards
* [ ] Geographic boards
* [ ] Public leaderboard
* [ ] Business search

### Phase 4 — Bidding

* [ ] Bid creation
* [ ] Bid validation
* [ ] Concurrent bid handling
* [ ] Transaction safety
* [ ] Ranking engine

### Phase 5 — Payments

* [ ] Payment creation
* [ ] Payment provider integration
* [ ] Webhook verification
* [ ] Idempotency
* [ ] Refund handling
* [ ] Financial audit trail

### Phase 6 — Analytics

* [ ] Impressions
* [ ] Click tracking
* [ ] CTR
* [ ] Ranking history
* [ ] Business analytics dashboard

### Phase 7 — Administration

* [ ] Admin authentication
* [ ] Business moderation
* [ ] Payment monitoring
* [ ] Fraud/report handling
* [ ] Category management

### Phase 8 — Deployment & Hardening

* [ ] Production deployment
* [ ] HTTPS
* [ ] Rate limiting
* [ ] Security testing
* [ ] Logging
* [ ] Monitoring
* [ ] Backup strategy

---

# 🧪 Engineering Priorities

The project prioritizes the following characteristics:

```text
Correctness
     ↓
Security
     ↓
Consistency
     ↓
Observability
     ↓
Performance
     ↓
Scale
```

The objective is not merely to make the application work, but to understand **why the architecture works and what happens when multiple users interact with the system simultaneously**.

---

# 🔮 Future Possibilities

The initial MVP can eventually evolve into a larger business discovery and advertising platform.

Potential future capabilities include:

```text
Local business discovery
Sponsored placements
Advanced analytics
City-level advertising
Category-level advertising
Campaigns
Business subscriptions
Promotional offers
Recommendation systems
Fraud detection
Real-time leaderboard updates
```

These features are intentionally outside the first MVP.

---

# ⚠️ Disclaimer

BidIndia is an independent project inspired by the general concept of transparent pay-to-rank advertising.

It is not affiliated with, endorsed by, or a copy of any particular advertising platform.

---

# 📜 License

License to be determined as the project develops.
