/**
 * Multi-Step Planning Engine
 * Generates structured execution plans for tax scenarios.
 */

class Planner {
    generatePlan(scenario) {
        const steps = [];
        const { id, result, taxDifference } = scenario;

        steps.push({
            step: 1,
            title: "Analyze Change",
            description: `Analyzing the impact of ${scenario.name}. New taxable income estimated at ₹${result.taxableIncome.toLocaleString()}.`
        });

        steps.push({
            step: 2,
            title: "Identify Gaps",
            description: result.savingsPotential > 0 
                ? `Identified ₹${result.savingsPotential.toLocaleString()} in unutilized tax-saving potential.`
                : "Current tax planning is optimal for this income level."
        });

        steps.push({
            step: 3,
            title: "Optimize Deductions",
            description: "Evaluating 80C, 80D, and NPS allocations based on the new income bracket."
        });

        steps.push({
            step: 4,
            title: "Final Recommendation",
            description: `Best action: Stay on ${result.recommendedRegime} regime and ${taxDifference > 0 ? 'prepare for higher TDS' : 'enjoy tax savings'}.`
        });

        return steps;
    }
}

module.exports = new Planner();
