const { calculateFullTax, CONSTANTS } = require('../universalTaxEngine');
const { getInvestmentOptions } = require('../../config/configLoader');

/**
 * AI Recommendation Engine
 * Suggests optimal tax-saving actions based on current user profile.
 */
const generateRecommendations = (taxProfile) => {
    const recommendations = [];
    const activeRegime = taxProfile.activeRegime || 'NEW';
    
    // Convert current state to engine payload
    const currentPayload = {
        income: taxProfile.income || 0,
        investments: taxProfile.investments || 0,
        insurance: taxProfile.insurance || 0,
        nps: taxProfile.nps || 0,
        hra: taxProfile.hra || 0,
        homeLoan: taxProfile.homeLoan || 0,
        isSenior: taxProfile.isSenior || false,
    };

    const baseline = calculateFullTax(currentPayload);
    const currentRegimeTax = activeRegime === 'OLD' ? baseline.oldRegime.finalTax : baseline.newRegime.finalTax;
    const baseTax = currentRegimeTax; // Use active regime as baseline for relative savings

    // 1. Check Section 80C Gap
    const gap80C = Math.max(0, CONSTANTS.LIMIT_80C - currentPayload.investments);
    if (gap80C > 0) {
        const simPayload = { ...currentPayload, investments: CONSTANTS.LIMIT_80C };
        const simResult = calculateFullTax(simPayload);
        
        // Compare against the current regime's baseline to show potential within that regime
        const currentRegimeTax = currentPayload.activeRegime === 'OLD' ? baseline.oldRegime.finalTax : baseline.newRegime.finalTax;
        const simRegimeTax = currentPayload.activeRegime === 'OLD' ? simResult.oldRegime.finalTax : simResult.newRegime.finalTax;
        const savings = Math.max(0, currentRegimeTax - simRegimeTax);

        if (savings > 0) {
            recommendations.push({
                type: "INVESTMENT",
                section: "80C",
                title: "Maximize Section 80C",
                suggestion: `Invest ₹${gap80C.toLocaleString('en-IN')} more under 80C to save ₹${savings.toLocaleString('en-IN')} tax`,
                savings,
                priority: savings > 20000 ? "HIGH" : "MEDIUM",
                reason: `You are currently utilizing only ₹${currentPayload.investments.toLocaleString('en-IN')} out of ₹${CONSTANTS.LIMIT_80C.toLocaleString('en-IN')} limit.`,
                action: "Invest in ELSS, PPF, or Tax-Saver FDs",
                options: getInvestmentOptions("80C"),
                confidence: 100
            });
        }
    }

    // 2. Check Section 80D (Health Insurance) Gap
    const limit80D = currentPayload.isSenior ? CONSTANTS.LIMIT_80D_SENIOR : CONSTANTS.LIMIT_80D_DEFAULT;
    const gap80D = Math.max(0, limit80D - currentPayload.insurance);
    if (gap80D > 0) {
        const simPayload = { ...currentPayload, insurance: limit80D };
        const simResult = calculateFullTax(simPayload);
        
        const currentRegimeTax = currentPayload.activeRegime === 'OLD' ? baseline.oldRegime.finalTax : baseline.newRegime.finalTax;
        const simRegimeTax = currentPayload.activeRegime === 'OLD' ? simResult.oldRegime.finalTax : simResult.newRegime.finalTax;
        const savings = Math.max(0, currentRegimeTax - simRegimeTax);

        if (savings > 0) {
            recommendations.push({
                type: "INSURANCE",
                section: "80D",
                title: "Health Insurance Tax Benefit",
                suggestion: `Increase health insurance coverage to save ₹${savings.toLocaleString('en-IN')} more`,
                savings,
                priority: "MEDIUM",
                reason: `Section 80D allows up to ₹${limit80D.toLocaleString('en-IN')} for self/family.`,
                action: "Buy or increase health insurance premium",
                options: getInvestmentOptions("80D"),
                confidence: 95
            });
        }
    }

    // 3. Check NPS (80CCD) Gap
    const gapNPS = Math.max(0, CONSTANTS.LIMIT_80CCD - currentPayload.nps);
    if (gapNPS > 0) {
        const simPayload = { ...currentPayload, nps: CONSTANTS.LIMIT_80CCD };
        const simResult = calculateFullTax(simPayload);
        
        const currentRegimeTax = currentPayload.activeRegime === 'OLD' ? baseline.oldRegime.finalTax : baseline.newRegime.finalTax;
        const simRegimeTax = currentPayload.activeRegime === 'OLD' ? simResult.oldRegime.finalTax : simResult.newRegime.finalTax;
        const savings = Math.max(0, currentRegimeTax - simRegimeTax);

        if (savings > 0) {
            recommendations.push({
                type: "RETIREMENT",
                section: "80CCD(1B)",
                title: "Exclusive NPS Benefit",
                suggestion: `Contribute ₹${gapNPS.toLocaleString('en-IN')} to NPS for an extra ₹${savings.toLocaleString('en-IN')} saving`,
                savings,
                priority: "HIGH",
                reason: "NPS offers an exclusive ₹50,000 deduction over and above the ₹1.5L 80C limit.",
                action: "Open or contribute to NPS Tier 1 account",
                options: getInvestmentOptions("NPS"),
                confidence: 98
            });
        }
    }

    // 4. Regime Switch Recommendation
    const recommendedRegime = baseline.recommendedRegime;
    
    if (recommendedRegime !== activeRegime) {
        const recommendedTax = recommendedRegime === 'OLD' ? baseline.oldRegime.finalTax : baseline.newRegime.finalTax;
        const savings = Math.max(0, currentRegimeTax - recommendedTax);

        if (savings > 0) {
            recommendations.push({
                type: "STRATEGY",
                section: "REGIME",
                title: "Switch Tax Regime",
                suggestion: `Switch to ${recommendedRegime} Regime to save ₹${savings.toLocaleString('en-IN')}`,
                savings: savings,
                priority: "CRITICAL",
                reason: `Based on your current data, the ${recommendedRegime} regime is mathematically more efficient than your selected ${activeRegime} regime.`,
                action: `Select ${recommendedRegime} regime during ITR filing`,
                confidence: 100
            });
        }
    }

    return recommendations.sort((a, b) => b.savings - a.savings);
};

module.exports = { generateRecommendations };
