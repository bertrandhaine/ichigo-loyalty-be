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
- [Recalculating Tiers](#recalculating-tiers)

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

4. Build the TypeScript code:
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

For detailed information on request/response formats, refer to the API documentation.

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

## Recalculating Tiers

The `/recalculate-tiers` endpoint is provided to manually trigger a recalculation of all customer tiers. For production use, it's recommended to set up a cron job to recalculate tiers at the end of each year.

To set up a cron job:

1. Create a script that calls the `/recalculate-tiers` endpoint
2. Use a task scheduler like cron (Linux/macOS) or Task Scheduler (Windows) to run the script at the end of each year

Example cron job (run at 23:59 on December 31st):
```
59 23 31 12 * /path/to/your/script.sh
```

Replace `/path/to/your/script.sh` with the actual path to your script.

## License

This project is licensed under the ISC License. See the LICENSE file for details.
