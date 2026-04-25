/**
 * Error & Optimization Detector
 * Identifies missed opportunities and potential errors in tax planning.
 */
const detectErrorsAndOptimizations = (taxProfile, taxResult) => {
    const findings = [];

    // 1. Detect Missed Deductions (High income, low deductions)
    if (taxProfile.income > 1500000 && (taxProfile.investments + taxProfile.insurance + taxProfile.nps) < 100000) {
        findings.push({
            type: "OPTIMIZATION",
            title: "Major Deduction Gap",
            message: "You are paying high tax while utilizing less than 50% of available deductions.",
            correction: "Maximize 80C and 80D immediately.",
            confidence: 98
        });
    }

    // 2. Detect Incorrect Regime Choice
    if (taxResult.recommendedRegime !== (taxProfile.activeRegime || 'NEW')) {
        findings.push({
            type: "ERROR",
            title: "Suboptimal Regime Selected",
            message: `You are currently using the ${taxProfile.activeRegime || 'NEW'} regime, but ${taxResult.recommendedRegime} would save you ₹${taxResult.savingsPotential.toLocaleString('en-IN')}.`,
            correction: `Change your active regime to ${taxResult.recommendedRegime}.`,
            confidence: 100
        });
    }

    // 3. Overpaid Tax Detection (Simple logic: if TDS > Calculated Tax)
    if (taxProfile.tds && taxProfile.tds > taxResult.finalTax) {
        findings.push({
            type: "ALERT",
            title: "Potential Refund Due",
            message: `Based on your inputs, your TDS (₹${taxProfile.tds.toLocaleString()}) is higher than your liability (₹${taxResult.finalTax.toLocaleString()}).`,
            correction: "Expect a tax refund of approximately ₹" + (taxProfile.tds - taxResult.finalTax).toLocaleString(),
            confidence: 90
        });
    }

    return findings;
};

module.exports = { detectErrorsAndOptimizations };
