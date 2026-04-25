/**
 * Explainable Decision Engine
 * Provides reasoning, alternatives, and confidence scores for agent actions.
 * References Income Tax Act sections for transparency.
 */

class DecisionEngine {
    explain(action, taxProfile, taxResult) {
        let reason = "";
        let logic = "";
        let confidence = 90;

        switch (action.type) {
            case "INVESTMENT":
                reason = `Section 80C allows a deduction of up to ₹1.5 Lakhs for investments in specified instruments. You have utilized ₹${(taxResult.deductions?.section80C || 0).toLocaleString()} so far.`;
                logic = "Rule: Taxable Income = Gross Income - Deductions. By maximizing 80C, you move income into a lower tax bracket or reduce the overall taxable base.";
                confidence = 98;
                break;
            case "STRATEGY":
                const savings = taxResult.savingsPotential;
                reason = `The ${taxResult.recommendedRegime} Regime is more efficient for your current financial profile. Sticking to the alternative would cost you ₹${savings.toLocaleString()} extra.`;
                logic = `Comparison: New Regime (Slab-based efficiency) vs Old Regime (Deduction-based efficiency). Current delta: ₹${savings.toLocaleString()}.`;
                confidence = 100;
                break;
            case "INSURANCE":
                const limit = taxProfile.isSenior ? 50000 : 25000;
                reason = `Section 80D provides deductions for Health Insurance premiums. For ${taxProfile.isSenior ? 'Senior Citizens' : 'Non-Seniors'}, the limit is ₹${limit.toLocaleString()}.`;
                logic = "Medical insurance premiums for self/family/parents are deductible under Sec 80D, separate from Sec 80C.";
                confidence = 95;
                break;
            case "RETIREMENT":
                reason = "Section 80CCD(1B) provides an exclusive deduction of ₹50,000 for NPS contributions, over and above Section 80C.";
                logic = "This is a 'Proactive Nudge' because NPS is often overlooked but offers one of the highest tax-efficiency ratios.";
                confidence = 92;
                break;
            default:
                reason = "Based on standard Income Tax Act guidelines for the current Assessment Year.";
                logic = "General optimization heuristic applied to maximize available standard deductions.";
                confidence = 85;
        }

        // Adjust confidence based on data completeness
        if (!taxProfile.income || taxProfile.income === 0) {
            confidence -= 20;
            reason = "Warning: Income not provided. Analysis is based on default values.";
        }

        return {
            reason,
            logic,
            confidence: Math.round(confidence)
        };
    }
}

module.exports = new DecisionEngine();
