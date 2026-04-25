/**
 * Action Engine
 * Converts plans into autonomous execution steps.
 * Provides proactive, explainable tax-saving actions.
 */

class ActionEngine {
    generateActions(taxProfile, taxResult) {
        const actions = [];
        const { deductions, recommendedRegime, savingsPotential, finalTax } = taxResult;

        // 1. REGIME OPTIMIZATION (PROACTIVE)
        if (savingsPotential > 0) {
            actions.push({
                type: "STRATEGY",
                action: `Switch to ${recommendedRegime} Regime`,
                impact: `Direct tax saving of ₹${savingsPotential.toLocaleString()}`,
                description: `Our analysis shows that the ${recommendedRegime} regime is currently the most tax-efficient choice for your income profile.`,
                timeline: "During ITR Filing",
                priority: "Critical",
                delta: savingsPotential
            });
        }

        // 2. SECTION 80C OPTIMIZATION
        const limit80C = 150000;
        const current80C = deductions.section80C || 0;
        if (current80C < limit80C) {
            const gap = limit80C - current80C;
            // Calculate tax saving based on slab (approximate)
            const taxSlab = this._estimateTaxSlab(taxResult.taxableIncome);
            const potentialSaving = gap * taxSlab;

            actions.push({
                type: "INVESTMENT",
                action: `Invest ₹${gap.toLocaleString()} in Section 80C`,
                impact: `Save up to ₹${potentialSaving.toLocaleString()} in taxes`,
                description: `You have an unused limit of ₹${gap.toLocaleString()} under Section 80C. Investing in ELSS, PPF, or LIC can significantly reduce your tax liability.`,
                timeline: "Before March 31st",
                priority: "High",
                gap: gap,
                saving: potentialSaving
            });
        }

        // 3. SECTION 80D (HEALTH INSURANCE)
        const limit80D = taxProfile.isSenior ? 50000 : 25000;
        const current80D = deductions.section80D || 0;
        if (current80D < limit80D) {
            const gap = limit80D - current80D;
            const taxSlab = this._estimateTaxSlab(taxResult.taxableIncome);
            const potentialSaving = gap * taxSlab;

            actions.push({
                type: "INSURANCE",
                action: `Maximize Section 80D (Health Insurance)`,
                impact: `Save ₹${potentialSaving.toLocaleString()} extra`,
                description: `Increasing your health insurance premium or paying for parents' insurance can give you an additional deduction of up to ₹${gap.toLocaleString()}.`,
                timeline: "Immediate",
                priority: "Medium",
                gap: gap,
                saving: potentialSaving
            });
        }

        // 4. SECTION 80CCD (NPS) - PROACTIVE NUDGE
        const currentNPS = deductions.nps80CCD || 0;
        if (currentNPS < 50000) {
            const gap = 50000 - currentNPS;
            const taxSlab = this._estimateTaxSlab(taxResult.taxableIncome);
            const potentialSaving = gap * taxSlab;

            actions.push({
                type: "RETIREMENT",
                action: `Contribute to NPS (Sec 80CCD(1B))`,
                impact: `Exclusive saving of ₹${potentialSaving.toLocaleString()}`,
                description: `NPS offers an additional ₹50,000 deduction over and above the ₹1.5L 80C limit. This is a highly efficient way to save for retirement while reducing tax.`,
                timeline: "Quarterly",
                priority: "High",
                gap: gap,
                saving: potentialSaving
            });
        }

        return actions;
    }

    _estimateTaxSlab(taxableIncome) {
        if (taxableIncome > 1500000) return 0.3;
        if (taxableIncome > 1200000) return 0.2;
        if (taxableIncome > 900000) return 0.15;
        if (taxableIncome > 600000) return 0.1;
        if (taxableIncome > 300000) return 0.05;
        return 0;
    }
}

module.exports = new ActionEngine();
