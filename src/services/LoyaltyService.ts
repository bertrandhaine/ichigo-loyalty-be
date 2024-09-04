import { Customers } from "../models/Customer";
import { Orders } from "../models/Order";
import { Op } from "sequelize";

export class LoyaltyService {
  /**
   * Calculate the start date of the last year for loyalty tier calculations.
   * @returns Date representing the start of the last year
   */
  public startOfLastYear(): Date {
    const now = new Date();
    return new Date(now.getFullYear() - 1, 0, 1);
  }

  /**
   * Calculate the loyalty tier based on the total amount spent.
   * @param totalSpent Total amount spent by the customer in cents
   * @returns The loyalty tier as a string: "Gold", "Silver", or "Bronze"
   */
  private calculateTier(totalSpent: number): string {
    if (totalSpent >= 50000) return "Gold";
    if (totalSpent >= 10000) return "Silver";
    return "Bronze";
  }

  /**
   * Update a customer's loyalty tier based on their orders from the last year.
   * @param id Customer ID
   * @throws Error if the customer is not found
   */
  async updateCustomerTier(id: string) {
    const customer = await Customers.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    const startOfLastYear = this.startOfLastYear();
    const orders = await Orders.findAll({
      where: {
        customerId: customer.customerId,
        date: {
          [Op.gte]: startOfLastYear,
        },
      },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalInCents,
      0
    );
    const currentTier = this.calculateTier(totalSpent);

    await customer.update({
      tier: currentTier,
      totalSpent,
      lastTierUpdate: new Date(),
    });
  }

  /**
   * Get detailed tier information for a customer, including current tier,
   * amount to next tier, and potential downgrade information.
   * @param id Customer ID
   * @returns Object containing detailed tier information
   * @throws Error if the customer is not found
   */
  async getCustomerTierInfo(id: string) {
    const customer = await Customers.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    const startOfLastYear = this.startOfLastYear();

    const orders = await Orders.findAll({
      where: {
        customerId: customer.customerId,
        date: {
          [Op.gte]: startOfLastYear,
        },
      },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalInCents,
      0
    );
    const currentTier = this.calculateTier(totalSpent);

    return {
      tier: currentTier,
      startOfTierCalculation: startOfLastYear,
      totalSpent,
      amountToNextTier:
        currentTier === "Gold"
          ? 0
          : currentTier === "Silver"
          ? 50000 - totalSpent
          : 10000 - totalSpent,
      downgradeTier:
        currentTier === "Gold" && totalSpent < 50000
          ? "Silver"
          : currentTier === "Silver" && totalSpent < 10000
          ? "Bronze"
          : null,
      downgradeDate: new Date(new Date().getFullYear(), 11, 31),
      amountToAvoidDowngrade:
        currentTier === "Gold"
          ? Math.max(50000 - totalSpent, 0)
          : currentTier === "Silver"
          ? Math.max(10000 - totalSpent, 0)
          : 0,
    };
  }

  /**
   * Recalculate loyalty tiers for all customers in the database.
   * This method should be called periodically to ensure tiers are up-to-date.
   */
  async recalculateAllTiers() {
    const customers = await Customers.findAll();
    for (const customer of customers) {
      await this.updateCustomerTier(customer.customerId.toString());
    }
  }
}
