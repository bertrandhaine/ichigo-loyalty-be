import { Customers } from "../models/Customer";
import { Orders } from "../models/Order";
import { Op } from "sequelize";

export class LoyaltyService {
  private static readonly GOLD_THRESHOLD = 50000;
  private static readonly SILVER_THRESHOLD = 10000;

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
  private calculateTier(totalSpent: number): "Gold" | "Silver" | "Bronze" {
    if (totalSpent >= LoyaltyService.GOLD_THRESHOLD) return "Gold";
    if (totalSpent >= LoyaltyService.SILVER_THRESHOLD) return "Silver";
    return "Bronze";
  }

  /**
   * Update a customer's loyalty tier based on their orders from the last year.
   * @param id Customer ID
   * @throws Error if the customer is not found
   */
  async updateCustomerTier(id: string): Promise<void> {
    const customer = await Customers.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    const startOfLastYear = this.startOfLastYear();
    const totalSpent = await this.calculateTotalSpent(
      customer.customerId,
      startOfLastYear
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
  async getCustomerTierInfo(id: string): Promise<CustomerTierInfo> {
    const customer = await Customers.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    const startOfLastYear = this.startOfLastYear();
    const startOfCurrentYear = new Date(new Date().getFullYear(), 0, 1);

    const totalSpentLastYear = await this.calculateTotalSpent(
      customer.customerId,
      startOfLastYear
    );
    const totalSpentCurrentYear = await this.calculateTotalSpent(
      customer.customerId,
      startOfCurrentYear
    );

    const currentTier = this.calculateTier(totalSpentLastYear);

    const tierInfo = this.calculateTierInfo(
      currentTier,
      totalSpentLastYear,
      totalSpentCurrentYear
    );

    return {
      name: customer.customerName,
      tier: currentTier,
      startOfTierCalculation: startOfLastYear,
      totalSpent: totalSpentLastYear,
      ...tierInfo,
      totalSpentCurrentYear,
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

  private async calculateTotalSpent(
    customerId: string,
    startDate: Date
  ): Promise<number> {
    const orders = await Orders.findAll({
      where: {
        customerId,
        date: { [Op.gte]: startDate },
      },
    });

    return orders.reduce((sum, order) => sum + order.totalInCents, 0);
  }

  private calculateTierInfo(
    currentTier: string,
    totalSpentLastYear: number,
    totalSpentCurrentYear: number
  ) {
    let amountToNextTier = 0;
    let downgradeTier: string | null = null;
    let amountToAvoidDowngrade = 0;

    switch (currentTier) {
      case "Gold":
        amountToAvoidDowngrade = Math.max(
          LoyaltyService.GOLD_THRESHOLD - totalSpentCurrentYear,
          0
        );
        downgradeTier =
          totalSpentCurrentYear < LoyaltyService.GOLD_THRESHOLD
            ? "Silver"
            : null;
        break;
      case "Silver":
        amountToNextTier = LoyaltyService.GOLD_THRESHOLD - totalSpentLastYear;
        amountToAvoidDowngrade = Math.max(
          LoyaltyService.SILVER_THRESHOLD - totalSpentCurrentYear,
          0
        );
        downgradeTier =
          totalSpentCurrentYear < LoyaltyService.SILVER_THRESHOLD
            ? "Bronze"
            : null;
        break;
      default:
        amountToNextTier = LoyaltyService.SILVER_THRESHOLD - totalSpentLastYear;
    }

    return {
      amountToNextTier,
      downgradeTier,
      downgradeDate: new Date(new Date().getFullYear() + 1, 0, 1),
      amountToAvoidDowngrade,
    };
  }
}

interface CustomerTierInfo {
  name: string;
  tier: string;
  startOfTierCalculation: Date;
  totalSpent: number;
  amountToNextTier: number;
  downgradeTier: string | null;
  downgradeDate: Date;
  amountToAvoidDowngrade: number;
  totalSpentCurrentYear: number;
}
