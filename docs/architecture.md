# System Architecture Diagram

This document illustrates the high-level architecture of the Finova application.

```mermaid
graph TD
    %% Clients
    Client_Browser["💻 Web Browser (React + Vite)"]

    %% Frontend App
    subgraph Frontend [React Frontend Application]
        UI["Tailwind + Framer Motion (Glassmorphic UI)"]
        Components["React Components & Pages"]
        API_Client["Axios API Client"]
        Auth_State["JWT State Management"]

        UI --> Components
        Components --> API_Client
    end

    %% Backend Services
    subgraph Backend [Spring Boot Backend Application]
        Gateway["Controller Layer (REST API)"]
        Security["Spring Security (JWT Filter + Rate Limiting)"]
        Service["Service Layer (Business Logic)"]
        LLM_Service["AI Insights Service"]
        Storage["Local File Storage (Receipts)"]
        Repo["Repository Layer (Spring Data JPA)"]

        Gateway --> Security
        Security --> Service
        Service --> LLM_Service
        Service --> Repo
        Service --> Storage
    end

    %% Data Stores & External APIs
    subgraph Infra [Infrastructure & External]
        DB[("MySQL Database")]
        Gemini{"Google Gemini API (LLM Insights)"}
    end

    %% Connections
    Client_Browser -->|HTTP/REST| Frontend
    API_Client -->|HTTP/REST (JSON + JWT)| Gateway
    Repo <-->|JPA/Hibernate| DB
    LLM_Service <-->|HTTP/REST| Gemini
    
    %% Styling
    classDef frontend fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef backend fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef database fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef external fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff;

    class Frontend frontend;
    class Backend backend;
    class DB database;
    class Gemini external;
```

## Details and Data Flow

1. **Frontend Presentation**: Served as static files, running in the user's browser processing rich visualizations natively.
2. **Security Edge**: Backend requests pass through the `RateLimitFilter` (Bucket4j) and the `JwtAuthenticationFilter` before reaching business logic controllers.
3. **Data Access**: Spring Data JPA leverages Hibernate ORM to construct dynamic MySQL queries, particularly utilizing `JpaSpecification` to achieve highly advanced frontend filters for the unified `Transaction` entity.
4. **Third-party Compute**: AI computations are offloaded to Google's Gemini models synchronously upon a user requesting financial insights in the dashboard.
