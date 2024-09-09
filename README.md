# Loyalty Program API

This project implements a RESTful API for a customer loyalty program using Node.js, Express, TypeScript, and PostgreSQL with Sequelize ORM.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Loyalty Tiers](#loyalty-tiers)
- [Yearly Tier Recalculation](#yearly-tier-recalculation)

## Features

- Create and manage customer orders
- Calculate and update customer loyalty tiers
- Retrieve customer tier information and order history
- Recalculate loyalty tiers for all customers

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/loyalty-program-api.git
   cd loyalty-program-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the PostgreSQL database:
   - Create a database named `loyalty_db`
   - Create a user named `loyalty_user` with password `loyalty`
   - Grant all privileges on `loyalty_db` to `loyalty_user`

4. Configure the database connection:
   Update the database configuration in `src/database.ts` if needed.

5. Build the TypeScript code:
   ```
   npm run build
   ```

## Usage

Start the server:
```
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

- `POST /order`: Create a new order
- `GET /customer/:id`: Get customer tier information
- `GET /customer/:id/orders`: Get customer orders since last year with pagination
- `POST /recalculate-tiers`: Recalculate loyalty tiers for all customers

## Database Schema

The project uses two main models:

1. Customers (src/models/Customer.ts)
2. Orders (src/models/Order.ts)

For detailed schema information, refer to the respective model files.

## Loyalty Tiers

The loyalty program has three tiers:

- Bronze (default)
- Silver (total spent >= $100)
- Gold (total spent >= $500)

Tiers are calculated based on the customer's total spending in the last year.

## Yearly Tier Recalculation

To meet the requirement of recalculating customer tiers at the end of each year, we use the `recalculateAllTiers` method in the `LoyaltyService` class. This method is executed via a cron job on January 1st of each year.

### Cron Job Setup

The yearly tier recalculation is handled by a dedicated cron job file:

```typescript:src/job/recalculateTierJob.ts
import cron from "node-cron";
import { LoyaltyService } from "../services/LoyaltyService";

async function recalculateYearlyTiers() {
  console.log("Starting yearly tier recalculation...");
  const loyaltyService = new LoyaltyService();
  try {
    await loyaltyService.recalculateAllTiers();
    console.log("Yearly tier recalculation completed successfully.");
  } catch (error) {
    console.error("Error during yearly tier recalculation:", error);
  }
}

// Schedule the job to run at 00:01 on January 1st
cron.schedule("1 0 1 1 *", recalculateYearlyTiers);

export { recalculateYearlyTiers };

```

This job is set to run automatically at 00:01 on January 1st every year.

### Implementation Details

1. The job uses the `node-cron` package to schedule the task.
2. It creates an instance of `LoyaltyService` and calls the `recalculateAllTiers` method.
3. Console logs are added for monitoring the start and completion of the recalculation process.

### Deployment Instructions

To ensure this cron job runs in your production environment:

1. Make sure the `src/job/recalculateTierJob.ts` file is included in your deployment package.
2. If you're using a process manager like PM2, include this job in your ecosystem file or start it as a separate process.
3. For containerized deployments (e.g., Docker), ensure this job is part of your application's startup process.
4. In serverless environments, you may need to adapt this to use cloud-specific scheduling services (e.g., AWS CloudWatch Events with Lambda).

Note: Ensure your server's timezone is correctly set, as the cron job timing is based on the server's local time.

## License

This project is licensed under the ISC License. See the LICENSE file for details.
