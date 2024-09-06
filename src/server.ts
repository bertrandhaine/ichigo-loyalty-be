// src/server.ts
import express from "express";
import sequelize from "./database";
import { LoyaltyService } from "./services/LoyaltyService";
import { OrderService } from "./services/OrderService";
import cors from "cors";

/**
 * Express application instance.
 */
const app = express();

/**
 * Port number for the server to listen on.
 * Uses the PORT environment variable if set, otherwise defaults to 3000.
 */
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

/**
 * Create a new order.
 * @route POST /order
 * @param {Object} req.body - The order data.
 * @returns {Object} The created order.
 */
app.post("/order", async (req, res) => {
  const orderData = req.body;
  try {
    const orderService = new OrderService();
    const order = await orderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
});

/**
 * Get customer tier information.
 * @route GET /customer/:id
 * @param {string} req.params.id - The customer ID.
 * @returns {Object} The customer's tier information.
 */
app.get("/customer/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const loyaltyService = new LoyaltyService();
    const customerData = await loyaltyService.getCustomerTierInfo(id);
    res.status(200).json(customerData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  }
});

/**
 * Get customer orders since last year with pagination.
 * @route GET /customer/:id/orders
 * @param {string} req.params.id - The customer ID.
 * @param {number} [req.query.page=1] - The page number for pagination.
 * @param {number} [req.query.limit=10] - The number of orders per page.
 * @returns {Object} Paginated customer orders and metadata.
 */
app.get("/customer/:id/orders", async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const orderService = new OrderService();
    const { orders, total } = await orderService.getCustomerOrders(
      id,
      page,
      limit
    );

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  }
});

/**
 * Recalculate loyalty tiers for all customers.
 * This endpoint is intended to be called by a cron job.
 * @route POST /recalculate-tiers
 * @returns {Object} A message indicating the result of the operation.
 */
app.post("/recalculate-tiers", async (_req, res) => {
  try {
    const loyaltyService = new LoyaltyService();
    await loyaltyService.recalculateAllTiers();
    res.status(200).json({ message: "Tiers recalculated" });
  } catch (error) {
    res.status(500).json({ error: "Error recalculating tiers" });
  }
});

/**
 * Start the server and establish database connection.
 */
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
