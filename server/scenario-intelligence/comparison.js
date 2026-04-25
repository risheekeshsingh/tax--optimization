/**
 * Scenario Comparison Engine
 * Compares multiple tax simulations to find the optimal strategy.
 */

class ComparisonEngine {
    compare(scenarios, baseResult) {
        const comparisons = scenarios.map(s => ({
            scenario: s.name,
            tax: s.result.finalTax,
            savings: baseResult.finalTax - s.result.finalTax,
            impact: s.taxDifference,
            efficiency: (s.result.savingsPotential / (s.result.taxableIncome || 1)) * 100
        }));

        // Sort by tax efficiency or absolute savings
        return comparisons.sort((a, b) => b.savings - a.savings);
    }
}

module.exports = new ComparisonEngine();
