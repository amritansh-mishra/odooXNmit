VIDEO LINK : https://drive.google.com/file/d/12hFWn7zcDldWSgHu7rmiRsVOhNnG5qVJ/view?usp=sharing


# OdooXNmit ERP (Frontend)

A modern ERP user interface built with React + Vite that connects to a Node.js/Express backend with a MySQL (SQL) database. This app helps small and medium businesses manage products, customers/vendors, taxes, orders, invoices, bills, and dashboards.

## What this project does
- Provides an easy-to-use web UI for day-to-day business operations
- Talks to a secure backend API for all data actions (create, read, update, delete)
- Stores data in a SQL database (MySQL) for reliability and reporting

## Key Features (simple overview)
- Products: add/update items with prices and HSN
- Contacts: manage customers and vendors (with GST/address info)
- Taxes: maintain tax rates and apply them to items
- Chart of Accounts: organize accounts for reporting
- Sales Orders & Purchase Orders: create, confirm, print
- Customer Invoices & Vendor Bills: item-level totals and payments
- Dashboard: quick KPIs, charts (Sales vs Purchases), recent transactions
- Reports: Stock, Profit & Loss, Balance Sheet

## How to run the app
1) Install and start the backend API first (required)
   - The backend runs at: http://localhost:5001
   - It uses MySQL as the database.
   - Ensure the backend README is followed for environment setup and DB seeding.

2) Start the frontend
```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:3000
```

3) Open the app
- Visit http://localhost:3000 in your browser
- Login with one of the test users (see below)

## Login credentials (for testing)
- Admin: `adminuser1` / `password123`
- Invoicing/Accountant:
  - `accountant1` / `password123`
  - `testuser1` / `password123`
  - `newuser` / `password123`
  - `newaccountant` / `password123`
  - `testuser123` / `password123`

Role behavior
- Admin: full access to masters, orders, invoices, reports
- Invoicing/Accountant: day-to-day transactions and reports
- Contact (client portal): restricted UI (if contact users exist)

## Tech Stack
- React + Vite (with HMR), Framer Motion for animations
- Centralized API client (`src/services/api.js`) with JWT auth support
- SQL database: MySQL (via backend)

## API endpoints (consumed by frontend)
- Base API prefix: `/api` (proxied to http://localhost:5001)
- Examples used by the UI:
  - `/api/auth/login`, `/api/auth/me`
  - `/api/master/products`, `/api/master/contacts`, `/api/master/taxes`, `/api/master/coa`
  - `/api/sales-orders`, `/api/purchase-orders`, `/api/customer-invoices`, `/api/vendor-bills`
  - `/api/reports/*` (stock, P&L, balance-sheet, dashboard)

## Notes
- If the dashboard shows all zeros, ensure the backend database has at least one confirmed invoice and vendor bill in the last 30 days. The frontend can also display role-based demo data if the dashboard endpoint is unavailable.
- Keep your backend running and logged-in so the frontend automatically includes the JWT in API calls.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build locally

---

### Problem We Solve
- Fragmented tooling for MSMEs leads to spreadsheets and manual processes.
- Hard to get unified visibility (sales vs purchases, tax totals, stock).
- Existing ERPs are heavy/complex to adopt in a hackathon timeframe.

### Why Our Solution
- **Modern UX** (React + Vite + Framer Motion).
- **Clean API** (Express + Sequelize) with JWT auth and role control.
- **SQL-first** persistence (MySQL) for reliable reporting and analytics.
- **Modular**: masters, transactions, reporting, and a dynamic dashboard.
- **Extensible**: centralized tax + PDF services, easy to plug in features.