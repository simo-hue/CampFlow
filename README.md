# 🏕️ CampFlow PMS
> **The Modern, Open-Source Property Management System for Campsites & Glamping ( suitable also for hotels and resorts).**

[![Website](https://img.shields.io/badge/Website-Live_Demo-2ea043?style=for-the-badge&logo=google-chrome)](https://simo-hue.github.io/CampFlow/)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)](https://simo-hue.github.io/CampFlow/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)](https://simo-hue.github.io/CampFlow/)

**CampFlow** is a next-generation **Property Management System (PMS)** engineered for speed, reliability, and ease of use. Designed specifically for campsites, RV parks, and glamping resorts, it eliminates overbooking risks with physical database constraints and offers a blazing fast Progressive Web App (PWA) experience.

---

## 🌟 Why CampFlow?

### 🛡️ Iron-Clad Reliability
- **Zero Overbooking Guarantee**: Unlike other software that relies on application-level checks, CampFlow uses **PostgreSQL Exclusion Constraints** (GIST) to physically prevent overlapping bookings at the database level.
- **Transactional Integrity**: Every booking is an atomic transaction.

### 🚀 Blazing Fast Performance
- **Instant Availability Search**: Query thousands of pitches in milliseconds using optimized database indexes.
- **PWA Ready**: Installable on iPad, Android, and Desktop. Works offline-first for critical viewing tasks.
- **Real-time Dashboard**: Live "Cockpit" heavily optimized for instant load times (<500ms).

### 💼 Professional Features
- **Dynamic Seasonal Pricing**: Configure sophisticated pricing rules (High/Low season, custom rates) with a visual "Season Stack" interface.
- **Customer Groups**: Manage VIPs, Families, and groups with automatic discounting and custom rate cards.
- **System Monitor**: Dedicated "God Mode" dashboard (`/sys-monitor`) for IT administrators to monitor logs and database health.
- **GDPR Compliant**: Built-in data separation and security best practices.

---

## ✨ Core Functionalities

### 🖥️ "The Cockpit" Dashboard
- **Real-time Stats**: Arrivi, Partenze, and Occupancy metrics updated every 30 seconds.
- **Global Search (Cmd+K)**: Instantly find any customer or reservation from anywhere in the app.
- **Weekly View**: Optimized visual timeline for managing check-ins and check-outs.

### 📅 Advanced Booking Engine
- **Smart Calendar**: Intelligent date picking with availability pre-checks.
- **Drag-and-Drop**: Intuitive visual management for allocation (Desktop/Tablet).
- **Auto-Pricing**: Calculates totals based on people, children (with age limits), vehicles, and active seasons.

### 📱 Mobile-First Experience
- **Responsive Design**: Fully optimized for mobile usage by ground staff.
- **PWA Installation**: Use it as a native app on iOS and Android.

---

## 🏗️ Technology Stack

Built on a modern, type-safe stack designed for maintainability and scale:

| Component | Technology | Why we chose it |
|-----------|-----------|-----------------|
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router) | React Server Components, SEO, Top-tier Performance |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) | Real-time, GIST Constraints, Reliable Backups |
| **UI System** | [Shadcn/UI](https://ui.shadcn.com/) + Tailwind v4 | Beautiful, accessible, and lightweight components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety for rock-solid code |
| **Deployment** | GitHub Pages / Vercel | Global edge network delivery |

---

## 🚀 Quick Start (Developers)

Ready to deploy your own instance?

### Prerequisites
- Node.js 18+
- Supabase Account (Free Tier is sufficient)

### Setup in 5 Minutes

```bash
# 1. Clone the repo
git clone https://github.com/simo-hue/CampFlow.git

# 2. Install dependencies
npm install

# 3. Configure Environment
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and ANON_KEY

# 4. Initialize Database
# Run the migrations found in supabase/migrations/ via SQL Editor

# 5. Launch
npm run dev
```

Visit `http://localhost:3000` to see your local instance.

---

## 🧪 Testing & Validation

We take stability seriously. CampFlow includes a suite of tests for critical paths.

**Test Anti-Overbooking:**
```bash
curl -X POST http://localhost:3000/api/bookings ...
# Returns 409 Conflict if dates overlap. Guaranteed.
```

---

## 📖 Documentation

- **[Live Website & Docs](https://simo-hue.github.io/CampFlow/)**: The official landing page.
- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Deep dive into architectural decisions and database schema.

---

## 🤝 Contributing

This project is currently maintained for internal use, but we welcome suggestions.
Please follow standard GitHub flow: Fork -> Branch -> PR.

---

### License
Proprietary © 2026 CampFlow. All rights reserved.
*Designed with ❤️ for the camping industry.*
