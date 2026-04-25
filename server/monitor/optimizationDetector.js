/**
 * Optimization Detector
 * Scans current inputs for missed deductions, logical inconsistencies, and optimization gaps.
 */
class OptimizationDetector {
    detect(taxProfile, taxResult) {
        const errors = [];
        const { income, basic, hra, monthlyRent, investments, insurance, nps, homeLoan } = taxProfile;

        // 1. HRA Optimization Gap
        if (basic > 0 && monthlyRent > 0 && hra === 0) {
            errors.push({
                code: "MISSED_HRA",
                severity: "High",
                message: "You are paying rent but haven't configured your HRA exemption.",
                action: "Calculate your HRA eligibility to reduce taxable income."
            });
        }

        // 2. High Income - Low Deduction Pattern
        if (income > 1500000 && (investments + insurance + nps) < 50000) {
            errors.push({
                code: "SUBOPTIMAL_PLANNING",
                severity: "Medium",
                message: "High income detected with minimal deductions.",
                action: "You are in the 30% slab. Every ₹1,000 invested saves you ₹300 directly."
            });
        }

        // 3. Home Loan Interest Gap
        if (homeLoan === 0 && income > 2000000) {
            errors.push({
                code: "ASSET_EFFICIENCY",
                severity: "Low",
                message: "No Home Loan interest deduction claimed.",
                action: "Section 24(b) offers up to ₹2L deduction. Consider if a home purchase fits your long-term goal."
            });
        }

        // 4. Regime Mismatch
        if (taxResult.savingsPotential > 10000 && taxResult.recommendedRegime !== taxProfile.activeRegime) {
            errors.push({
                code: "INCORRECT_REGIME",
                severity: "Critical",
                message: `You are currently on the ${taxProfile.activeRegime} Regime, but ${taxResult.recommendedRegime} saves you ₹${taxResult.savingsPotential.toLocaleString()}!`,
                action: "Switch regimes immediately to stop overpaying tax."
            });
        }

        return errors;
    }
}

module.exports = new OptimizationDetector();
