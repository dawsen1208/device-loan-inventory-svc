# Corporate Device Loan System (CDLS)

CDLS is a comprehensive microservices-based application designed to manage corporate device loans. It enables employees to browse available devices, make reservations, and return devices, while allowing administrators to oversee the lending process.

## 🏗 System Architecture

The system follows a clean architecture pattern and is composed of three main components:

1.  **Web Frontend (`device-loan-web`)**: A Single Page Application (SPA) built with React and Vite. It integrates with Auth0 for authentication and communicates with the backend services via REST APIs.
2.  **Booking Service (`device-loan-booking-svc`)**: An Azure Functions microservice responsible for managing loan reservations. It handles business logic for borrowing and returning devices and stores booking data in Azure Cosmos DB.
3.  **Inventory Service (`device-loan-inventory-svc`)**: An Azure Functions microservice that manages the device inventory. It tracks stock levels and ensures data consistency.

### Key Technologies
*   **Frontend**: React, Vite, Auth0 (OIDC/OAuth2)
*   **Backend**: Azure Functions (TypeScript), Node.js
*   **Database**: Azure Cosmos DB (NoSQL)
*   **CI/CD**: GitHub Actions (Automated build and deploy to Azure)

## 📂 Project Structure

```bash
CDLS/
├── device-loan-web/           # React Frontend Application
├── device-loan-booking-svc/   # Booking Microservice (Azure Functions)
├── device-loan-inventory-svc/ # Inventory Microservice (Azure Functions)
└── .github/workflows/         # CI/CD Pipelines
```

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
*   [Azure Cosmos DB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/local-emulator) (or a real Azure Cosmos DB account)

### 1. Installation

Navigate to each service directory and install dependencies:

```bash
# Frontend
cd device-loan-web
npm install

# Booking Service
cd ../device-loan-booking-svc
npm install

# Inventory Service
cd ../device-loan-inventory-svc
npm install
```

### 2. Configuration

You need to configure environment variables for local development.

**Backend Services (`local.settings.json`)**
Create a `local.settings.json` file in both `device-loan-booking-svc` and `device-loan-inventory-svc`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONN_STRING": "AccountEndpoint=https://localhost:8081/;AccountKey=...;",
    "AUTH0_DOMAIN": "your-tenant.auth0.com",
    "AUTH0_AUDIENCE": "https://cdls-api"
  }
}
```

**Frontend (`.env`)**
Create a `.env` file in `device-loan-web`:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://cdls-api
VITE_API_BASE_URL=http://localhost:7071/api
```

### 3. Running Locally

It is recommended to run each service in a separate terminal.

**Terminal 1: Inventory Service**
```bash
cd device-loan-inventory-svc
npm start
```

**Terminal 2: Booking Service**
```bash
cd device-loan-booking-svc
npm start
```

**Terminal 3: Web Frontend**
```bash
cd device-loan-web
npm run dev
```

## 🔌 API Overview

### Booking Service
*   `POST /api/bookings`: Create a new device reservation.
*   `GET /api/bookings/me`: Get current user's bookings.
*   `GET /api/bookings`: Get all bookings (Admin only).
*   `POST /api/bookings/return`: Return a device.

### Inventory Service
*   `GET /api/inventory/{model}`: Get stock details for a specific device model.
*   *Internal APIs*: Increment/Decrement stock (called by Booking Service).

## 🚢 Deployment

This project uses **GitHub Actions** for continuous delivery.
*   `deploy-web.yml`: Deploys the React app to Azure Static Web Apps.
*   `deploy-booking.yml`: Deploys the Booking Service to Azure Functions.
*   `deploy-inventory.yml`: Deploys the Inventory Service to Azure Functions.

## 🛡 Security

*   **Authentication**: Managed via Auth0.
*   **Authorization**: Role-Based Access Control (RBAC) is implemented. Users with the `Admin` role have access to privileged endpoints.
*   **Validation**: JWT tokens are validated on the backend using `jose`.
