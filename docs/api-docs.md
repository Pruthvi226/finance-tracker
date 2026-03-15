# Backend API References

The core backend exposes a RESTful API wrapped in Spring Security filters for maximum safety.

**Base URL**: `http://localhost:8080/api`

> [!IMPORTANT]  
> All endpoints under `/api/*` (except `/auth/**`) require the HTTP Authorization Context initialized: `Authorization: Bearer <your_jwt_token>`

## Auth Domain
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Open registration. Expects JSON `{ name, email, password }` |
| `POST` | `/auth/login` | Yields a standard JWT upon correct evaluation. |

## Users Profile
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users/me` | Fetch the active logged-in User profile securely from JWT Claims. |
| `PUT` | `/users/me` | Update public profile (Name, Emails). |

## Core Transactions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/transactions` | View authenticated transactions. Supports advanced query parameters (`?startDate=2023-01-01&category=Food`). |
| `POST` | `/transactions` | Log new manual transaction into the global ledger. |
| `POST` | `/transactions/{id}/receipt` | Attach scanned documents securely supporting images and PDF `multipart/form-data: file=***`. |
| `PUT` | `/transactions/{id}` | Update existing record. |
| `DELETE` | `/transactions/{id}` | Hard delete of a transaction entry. |

## AI Insights via Google Gemini
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/insights/generate` | Calls out to Google Gemini parsing real-world transaction patterns to establish recommendations customized per-user! |

## Additional Components
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/budgets` | Aggregate and filter active budgets against live usage. |
| `POST` | `/budgets` | Set threshold per calendar month and category. |
| `GET` | `/recurring-transactions` | View subscriptions. |
| `POST` | `/recurring-transactions` | Install cron rules defining recurrent transfers (`DAILY, WEEKLY, MONTHLY, YEARLY`). Backend scheduler generates entries dynamically. |
| `GET` | `/notifications` | Live pull for alerts (Budget Exceeded threshold rules). |
| `PUT` | `/notifications/{id}/read` | Flag the alert as successfully acknowledged by the client UI. |
