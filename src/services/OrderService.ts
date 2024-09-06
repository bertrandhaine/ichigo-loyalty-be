import { Orders, OrderAttributes } from "../models/Order";
import { Customers, CustomerAttributes } from "../models/Customer";
import { LoyaltyService } from "./LoyaltyService";
import { Transaction } from "sequelize";
import sequelize from "../database";

interface OrderData extends OrderAttributes {
  customerName: string;
}

export class OrderService {
  private loyaltyService: LoyaltyService;

  constructor(loyaltyService: LoyaltyService = new LoyaltyService()) {
    this.loyaltyService = loyaltyService;
  }

  async createOrder(orderData: OrderData): Promise<OrderAttributes> {
    return sequelize.transaction(async (t: Transaction) => {
      const customer = await this.ensureCustomerExists(orderData, t);
      const order = await this.createOrderRecord(orderData, t);
      await this.loyaltyService.updateCustomerTier(customer.customerId);
      return order;
    });
  }

  async getCustomerOrders(
    customerId: string,
    page: number,
    limit: number
  ): Promise<{ orders: OrderAttributes[]; total: number }> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Orders.findAndCountAll({
      where: { customerId },
      limit,
      offset,
      order: [["date", "DESC"]],
    });

    return {
      orders: rows,
      total: count,
    };
  }

  private async ensureCustomerExists(
    orderData: OrderData,
    transaction: Transaction
  ): Promise<CustomerAttributes> {
    const [customer] = await Customers.findOrCreate({
      where: { customerId: orderData.customerId },
      defaults: { customerName: orderData.customerName },
      transaction,
    });

    if (!customer) {
      throw new Error("Failed to find or create customer");
    }

    return customer;
  }

  private async createOrderRecord(
    orderData: OrderData,
    transaction: Transaction
  ): Promise<OrderAttributes> {
    return Orders.create(
      {
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        totalInCents: orderData.totalInCents,
        date: new Date(orderData.date),
      },
      { transaction }
    );
  }
}
