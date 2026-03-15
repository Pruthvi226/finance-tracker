# 💸 Finova - Next-Gen Personal# 🚀 Finova - Premium Personal Finance Trackers a premium, production-ready fintech application that helps you track your income, expenses, set saving goals, and get deep insights into your spending habits powered by an advanced Artificial Intelligence assistant.

Built with **Java Spring Boot 3 & Spring Security** on the backend, and an ultra-modern, glassmorphism **React 18 & Tailwind CSS** dashboard on the frontend.

## ✨ Features
* **Authentication**: Secure JWT-based registration and login system.
* **Unified Transactions**: Track income and expenses seamlessly with multi-currency support and advanced filtering capabilities.
* **Dashboard Analytics**: Visualize spending patterns over time using rich charts and real-time summaries.
* **AI Financial Assistant**: Receive personalized financial context and advice via the Google Gemini LLM API integration.
* **Receipt Capture**: Attach digital receipts directly to your transactions for seamless record-keeping.
* **Budget Tracking & Alerts**: Set monthly budget caps and get notified when you're approaching your limits.

## 🚀 Quick Start (Docker)

The fastest way to run Finova locally is using Docker Compose.

1. Clone the repository
2. Provide your AI API Key securely in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env and supply your AI_GEMINI_API_KEY
   ```
3. Start the application stack:
   ```bash
   docker-compose up -d --build
   ```
4. Access the web dashboard at `http://localhost:80` and the API at `http://localhost:8080/api`

## 📦 Local Development Setup

### Backend (Spring Boot)
1. Ensure Java 17 and Maven are installed.
2. Spin up a local MySQL instance (or use the Docker one: `docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=finance_tracker -p 3306:3306 -d mysql:8.0`).
3. Set your environment variables (see `.env.example`).
4. Run `mvn spring-boot:run` in the `backend/` directory.

### Frontend (React)
1. Ensure Node.js 18+ is installed.
2. Run `npm install` inside the `frontend/` directory.
3. Start the Vite React development server: `npm run dev`.

## ☁️ Deployment Guides

### 1. Database (PlanetScale / AWS RDS)
* **PlanetScale (Serverless MySQL):** Create a database, grab your connection URL (`jdbc:mysql://...`), and inject it into your backend using the `SPRING_DATASOURCE_URL` variable.

### 2. Backend API (Render.com / Heroku)
* Select "Web Service", connect the repository, and select the `backend` folder as your root directory.
* Set the build command to `mvn clean package -DskipTests` and start command to `java -jar target/*.jar`.
* Ensure you configure Environment Variables for `SPRING_DATASOURCE_*`, `JWT_SECRET`, `AI_GEMINI_API_KEY`, etc.

### 3. Frontend Web App (Vercel / Netlify)
* Import the repository to Vercel and point the Root Directory to `frontend`.
* Vercel will auto-detect Vite. Approve the Build Command (`npm run build`) and Output Directory (`dist`).
* Set the `VITE_API_URL` environment variable to point to your live Render/Heroku backend URL. Let it deploy!

---

## 📚 Technical Documentation
Check out the dedicated documentation artifacts generated for this suite:
* [Architecture Diagram](docs/architecture.md)
* [Database ER Diagram](docs/er-diagram.md)
* [API References](docs/api-docs.md)
