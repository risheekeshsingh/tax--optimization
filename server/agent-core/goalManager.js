/**
 * Goal Manager
 * Handles definition, storage, and inference of user tax goals.
 */

const GOAL_TYPES = {
    MINIMIZE_TAX: "Minimize tax liability",
    MAXIMIZE_DEDUCTIONS: "Maximize tax deductions",
    LONG_TERM_SAVINGS: "Optimize long-term savings & wealth",
    COMPLIANCE_FIRST: "Ensure 100% tax compliance"
};

class GoalManager {
    constructor() {
        this.defaultGoal = GOAL_TYPES.MINIMIZE_TAX;
    }

    /**
     * Infer user goal based on tax profile
     */
    inferGoal(taxProfile) {
        if (!taxProfile) return this.defaultGoal;

        const income = Number(taxProfile.income) || 0;
        const investments = Number(taxProfile.investments) || 0;

        // If high income but low investments, goal is likely maximizing deductions
        if (income > 1500000 && investments < 100000) {
            return GOAL_TYPES.MAXIMIZE_DEDUCTIONS;
        }

        // If moderate income and some investments, minimize tax is standard
        if (income > 700000) {
            return GOAL_TYPES.MINIMIZE_TAX;
        }

        // For long term stability
        if (taxProfile.isSenior) {
            return GOAL_TYPES.LONG_TERM_SAVINGS;
        }

        return this.defaultGoal;
    }

    getGoal(taxProfile) {
        // In a real system, we'd check if the user has explicitly set a goal in their profile
        // For now, we prioritize inference to show autonomy
        return taxProfile.explicitGoal || this.inferGoal(taxProfile);
    }
}

module.exports = new GoalManager();
