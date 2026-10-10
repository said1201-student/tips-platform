# TipSlip — Betting Tips & Slip Code Sharing Platform

A professional, responsive platform where **tipsters share betting tips and slip
codes** and visitors discover them and copy the code to use on an external
betting company.

> **Important:** This is **not** a bookmaker. It does not accept bets, process
> payments, hold money, or store matches/teams/predictions. It only shares a
> tip's title, company, slip code, odds and description. Actual betting happens
> on the external betting company's website.

---

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | Next.js 14 (App Router), React, Tailwind CSS |
| Backend   | Node.js, Express.js (REST API)               |
| Database  | MySQL / MariaDB (XAMPP, phpMyAdmin)          |
| Auth      | JWT in an httpOnly cookie + bcrypt hashing   |
| Email     | Nodemailer (with console fallback in dev)    |

---

## Project Structure

```
tips platform/
├── backend/          Express REST API
│   ├── config/       db.js
│   ├── routes/        auth, tips, tipsters, companies, admin
│   ├── controllers/   request handlers
│   ├── middleware/    auth, validate, error handler
│   ├── models/        database queries
│   ├── services/      token + email services
│   ├── utils/         validators, helpers
│   ├── seed.js        create DB + tables + demo data
│   ├── server.js      app entry point
│   └── .env
├── frontend/         Next.js app
│   ├── app/          pages (public + dashboards)
│   ├── components/   UI components
│   └── lib/          api client, auth context, formatters
├── database/
│   └── schema.sql    the 3 tables
└── README.md
```

---

## The Database (only 3 tables)

- **users** — admins and tipsters (roles, statuses)
- **betting_companies** — name, logo, website_url, status
- **tips** — tipster + company + title, slip_code, total_odds, status, views, copy_count

No matches, teams, leagues, predictions or public-user tables.

---

## Prerequisites

- **Node.js** (v18+)
- **XAMPP** with MySQL running (start MySQL from the XAMPP Control Panel)

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Check `.env` (already provided). Defaults match a standard XAMPP install
(user `root`, no password, database `tips_platform`).

### 2. Create the database and demo data

```bash
npm run seed
```

This creates the database, the three tables, and seeds:

- **Admin:** `admin` / `Admin@12345`
- **Demo tipsters:** `saidtips`, `alphatips`, `smarttips` — password `Tryit@123`
- 4 betting companies and 9 sample tips

### 3. Start the backend

```bash
npm run dev      # auto-restarts on changes
# or
npm start
```

API runs at **http://localhost:5000** (health check: `/api/health`).

### 4. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Site runs at **http://localhost:3000**.

---

## Demo Logins

| Role     | Username    | Password      |
| -------- | ----------- | ------------- |
| Admin    | `admin`     | `Admin@12345` |
| Tipster  | `saidtips`  | `Tryit@123`   |
| Tipster  | `alphatips` | `Tryit@123`   |
| Tipster  | `smarttips` | `Tryit@123`   |

> There is **no public registration**. Tipsters are created only by an admin,
> who gets a generated temporary password (emailed; shown in dev mode).

---

## User Flow

**Public visitor:** Home → Tips → Tip details → **Copy slip code** → Open
betting company.

**Tipster:** Admin creates account → receives credentials → logs in → changes
password → dashboard → create/manage tips → track performance.

**Admin:** Login → dashboard → manage tipsters → manage tips (set results) →
manage betting companies → view statistics.

---

## Pages

**Public**
`/` · `/tips` · `/tips/[id]` · `/tipsters` · `/tipsters/[username]` ·
`/companies` · `/login` · `/forgot-password` · `/reset-password`

**Tipster dashboard**
`/tipster` · `/tipster/tips` · `/tipster/tips/create` ·
`/tipster/tips/[id]/edit` · `/tipster/profile` · `/tipster/settings`

**Admin dashboard**
`/admin` · `/admin/tipsters` (+`/create`, `/[id]/edit`) · `/admin/tips`
(+`/[id]/edit`) · `/admin/companies` (+`/create`, `/[id]/edit`)

---

## API Overview

```
Auth
  POST   /api/auth/login            POST /api/auth/logout
  GET    /api/auth/me               PATCH /api/auth/profile
  POST   /api/auth/change-password  POST /api/auth/forgot-password
  POST   /api/auth/reset-password

Tips
  GET    /api/tips                  GET  /api/tips/:id
  POST   /api/tips                  PUT  /api/tips/:id
  DELETE /api/tips/:id              GET  /api/tips/mine        (tipster)
  GET    /api/tips/stats/me         (tipster)
  POST   /api/tips/:id/view         POST /api/tips/:id/copy

Tipsters
  GET    /api/tipsters              GET  /api/tipsters/:username

Companies
  GET    /api/companies             POST /api/companies        (admin)
  PUT    /api/companies/:id         DELETE /api/companies/:id   (admin)

Admin
  GET    /api/admin/stats           GET/POST /api/admin/tipsters
  PUT/DELETE /api/admin/tipsters/:id
  POST   /api/admin/tipsters/:id/reset-password
  GET    /api/admin/tips            PATCH /api/admin/tips/:id/status
  PUT/DELETE /api/admin/tips/:id
```

---

## Security

- Passwords hashed with bcrypt (never stored or returned in plain text)
- JWT stored in an httpOnly cookie; role-based authorization middleware
- Parameterized SQL queries (no injection)
- Input validation on every write endpoint
- Rate limiting on authentication endpoints
- Password reset uses random, hashed, short-lived tokens
- Friendly, non-revealing error messages

---

## Notes

- **Logo field:** companies store a logo **URL**. File uploads can be added
  later if required.
- **Forgot password:** tokens are kept in memory (hashed) to honour the
  "3 tables only" rule; they expire after 30 minutes and are lost on restart.
- **Email:** with `MAIL_ENABLED=false`, credentials/reset links are printed to
  the backend console instead of being sent — safe for development.

18+ | Gamble Responsibly
