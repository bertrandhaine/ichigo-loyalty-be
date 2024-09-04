import { Orders } from "../models/Order";
import { LoyaltyService } from "./LoyaltyService";
import { Op } from "sequelize";
import { Customers } from "../models/Customer";

export class OrderService {
  /**
   * Creates a new order for a customer, ensuring the customer exists or creating them if not.
   * Also updates the customer's loyalty tier after the order is created.
   * @param orderData Object containing order details (customerId, customerName, orderId, totalInCents, date)
   * @returns The created order
   * @throws Error if the customer cannot be found or created
   */
  async createOrder(orderData: {
    customerId: string;
    customerName: string;
    orderId: string;
    totalInCents: number;
    date: string;
  }) {
    // First, ensure the customer exists or create them
    const [customer] = await Customers.findOrCreate({
      where: { id: orderData.customerId },
      defaults: { name: orderData.customerName },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Create the order
    const order = await Orders.create({
      orderId: orderData.orderId,
      customerId: orderData.customerId,
      totalInCents: orderData.totalInCents,
      date: new Date(orderData.date),
    });

    // Recalculate customer's tier
    const loyaltyService = new LoyaltyService();
    await loyaltyService.updateCustomerTier(orderData.customerId);

    return order;
  }

  /**
   * Retrieves a paginated list of orders for a specific customer.
   * @param customerId The ID of the customer
   * @param page The page number for pagination
   * @param limit The number of orders per page
   * @returns An object containing the list of orders and the total count
   */
  async getCustomerOrders(customerId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Orders.findAndCountAll({
      where: { customerId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      orders: rows,
      total: count,
    };
  }
}
