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
