/**
 * Proactive Suggestion Module
 * Autonomously identifies scenarios that would benefit the user.
 */
const scenarioEngine = require('./scenarioEngine');

class ProactiveSuggestions {
    suggest(taxProfile, taxResult) {
        const suggestions = [];

        // 1. If income is high but 80C is low
        if (taxProfile.income > 1200000 && taxProfile.investments < 150000) {
            suggestions.push({
                type: "OPTIMIZATION",
                message: "Based on your income, maximizing Section 80C would yield a massive tax reduction.",
                scenarioToTry: "INVESTMENT_BOOST"
            });
        }

        // 2. If user is in New Regime but has Home Loan
        if (taxProfile.activeRegime === 'NEW' && taxProfile.homeLoan > 0) {
            suggestions.push({
                type: "REGIME_CHECK",
                message: "You have a Home Loan but are on the New Regime. Switching to the Old Regime might save you more.",
                scenarioToTry: "COMBINED"
            });
        }

        // 3. If salary is moderate and NPS is zero
        if (taxProfile.income > 800000 && taxProfile.nps === 0) {
            suggestions.push({
                type: "NPS_NUDGE",
                message: "Adding ₹50,000 to NPS could move you to a lower tax bracket.",
                scenarioToTry: "INCREMENT" // Suggesting how an increment can be offset
            });
        }

        return suggestions;
    }
}

module.exports = new ProactiveSuggestions();
