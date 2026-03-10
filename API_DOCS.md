## Finance Tracker API Documentation

Base URL: `http://localhost:8080/api`

### Authentication

- **POST** `/auth/register`
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }`
  - Response: `200 OK` (created user object)

- **POST** `/auth/login`
  - Body: `{ "email": "john@example.com", "password": "secret123" }`
  - Response: `200 OK` `{ "token": "<JWT_TOKEN>" }`
  - Use header `Authorization: Bearer <JWT_TOKEN>` for protected endpoints.

### User Management

- **GET** `/users/me`
  - Response: `{ "id": 1, "name": "John", "email": "john@example.com" }`

- **PUT** `/users/me`
  - Body: `{ "id": 1, "name": "New Name", "email": "new@example.com" }`
  - Response: updated profile.

### Income

- **GET** `/income`
  - Optional query params: `startDate=2026-01-01&endDate=2026-01-31`
  - Response: `[{ "id": 1, "amount": 50000, "source": "Salary", "date": "2026-01-01", "description": "Jan" }]`

- **POST** `/income`
  - Body: `{ "amount": 50000, "source": "Salary", "date": "2026-01-01", "description": "Jan" }`

- **PUT** `/income/{id}`
  - Body same as POST.

- **DELETE** `/income/{id}`

### Expenses

- **GET** `/expenses`
  - Optional query params:
    - `category=Food`
    - `startDate=2026-01-01&endDate=2026-01-31`
  - Response: `[{ "id": 1, "amount": 500, "category": "Food", "date": "2026-01-02", "description": "Dinner" }]`

- **POST** `/expenses`
  - Body: `{ "amount": 500, "category": "Food", "date": "2026-01-02", "description": "Dinner" }`

- **PUT** `/expenses/{id}`
  - Body same as POST.

- **DELETE** `/expenses/{id}`

### Budget

- **POST** `/budget`
  - Body: `{ "monthlyLimit": 20000 }`

- **GET** `/budget`
  - Response: `{ "monthlyLimit": 20000 }` or `null` if not set.

- **GET** `/budget/status`
  - Response: `{ "remaining": 15234.5, "exceeded": false }`

### Dashboard

- **GET** `/dashboard`
  - Response:
    ```json
    {
      "totalIncome": 100000,
      "totalExpense": 40000,
      "remainingBalance": 60000,
      "monthlySummary": {
        "2026-01": 20000,
        "2026-02": 15000
      }
    }
    ```

### Analytics

- **GET** `/analytics`
  - Response:
    ```json
    {
      "categorySpending": {
        "Food": 5000,
        "Travel": 3000
      },
      "monthlyExpenses": {
        "2026-01": 8000
      },
      "monthlyIncome": {
        "2026-01": 50000
      }
    }
    ```

