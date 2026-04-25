/**
 * AI Recommendation Engine
 * Autonomously selects the best scenario and provides actionable advice.
 */

class RecommendationEngine {
    recommend(scenarios, baseResult) {
        // Find the scenario with the most savings (or least tax increase)
        const sorted = [...scenarios].sort((a, b) => a.result.finalTax - b.result.finalTax);
        const best = sorted[0];

        let advice = "";
        if (best.id === 'COMBINED') {
            advice = "Best option: Maximize your investments immediately to offset the tax impact of your upcoming increment.";
        } else if (best.id === 'INVESTMENT_BOOST') {
            advice = "Best option: Focus on filling your investment gaps before looking at regime changes.";
        } else {
            advice = `Best option: The ${best.name} strategy yields the highest net-of-tax income.`;
        }

        return {
            bestScenario: best.name,
            reasoning: advice,
            expectedSaving: baseResult.finalTax - best.result.finalTax,
            confidence: 95
        };
    }
}

module.exports = new RecommendationEngine();
