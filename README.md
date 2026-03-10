## Finance Tracker

Personal Finance Tracking System built with **Spring Boot (Java)** and **React + Vite + Tailwind**. It provides JWT‑secured APIs and a modern fintech‑style dashboard for tracking income, expenses, budgets and analytics.

### Tech Stack

- **Backend**: Java 17, Spring Boot, Spring Security (JWT), JPA/Hibernate, MySQL
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Axios, React Router, Recharts

### Project Structure

`finance-tracker/`

- `backend/` – Spring Boot API
- `frontend/` – React SPA

### Backend – Getting Started

1. Create a MySQL database (or let Hibernate auto‑create):
   - Recommended name: `finance_tracker`
2. Update `backend/src/main/resources/application.properties` with your MySQL username/password.
3. From `finance-tracker/backend`:
   - `mvn clean install`
   - `mvn spring-boot:run`
4. Backend will run on `http://localhost:8080`.

#### Key API Modules

- **Auth**: `/api/auth/register`, `/api/auth/login` (returns JWT)
- **Users**: `/api/users/me` (get/update profile)
- **Income**: CRUD + date filters via `/api/income`
- **Expenses**: CRUD + category/date filters via `/api/expenses`
- **Budget**: `/api/budget`, `/api/budget/status`
- **Dashboard**: `/api/dashboard`
- **Analytics**: `/api/analytics`

See `API_DOCS.md` for full request/response examples.

### Frontend – Getting Started

1. From `finance-tracker/frontend`:
   - `npm install`
   - `npm run dev`
2. Frontend will run on `http://localhost:5173` (default Vite port).
3. Ensure backend is running on `http://localhost:8080` (the Axios base URL).

### Features

- JWT authentication with login/register
- Dashboard with total income/expense and balance
- Income & Expense CRUD with search and filters
- Expense category dropdown (Food, Travel, Bills, Shopping, Entertainment, Other)
- Monthly budget management with remaining amount and alert when exceeded
- Analytics charts (category spending, monthly expenses, income vs expense)
- Transaction search, date filters (via API), CSV export skeleton (ready to extend)
- Responsive layout with navbar, sidebar, reusable forms, tables and chart cards

### Production Notes

- Change `app.jwt.secret` in `application.properties` to a strong secret.
- Configure proper CORS and HTTPS/Reverse proxy (Nginx/Ingress) for real deployments.
- Add error logging/monitoring (e.g. ELK, Sentry) before production use.

