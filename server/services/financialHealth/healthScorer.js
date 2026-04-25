const { CONSTANTS } = require('../universalTaxEngine');

/**
 * Financial Health Scorer
 * Calculates a score from 0-100 based on tax efficiency and planning discipline.
 */
const calculateHealthScore = (taxProfile, taxResult) => {
    let score = 0;
    const weights = {
        efficiency: 30,    // Tax paid vs Gross Income
        utilization: 40,   // Deductions used vs Max possible
        planning: 20,      // Diversity (80C, 80D, NPS)
        regimeChoice: 10   // Is the user on the best regime?
    };

    // 1. Efficiency Score (0-30)
    const taxRatio = (taxResult.finalTax || 0) / (taxProfile.income || 1);
    // Benchmark: If tax is < 10% of income at high salary, it's very efficient
    const efficiencyScore = Math.max(0, weights.efficiency * (1 - (taxRatio / 0.25))); 
    score += efficiencyScore;

    // 2. Utilization Score (0-40)
    const maxDeductions = 150000 + 25000 + 50000; // Standard 80C + 80D + NPS
    const currentDeductions = (taxResult.deductions?.section80C || 0) + 
                             (taxResult.deductions?.section80D || 0) + 
                             (taxResult.deductions?.nps80CCD || 0);
    const utilizationScore = (Math.min(maxDeductions, currentDeductions) / maxDeductions) * weights.utilization;
    score += utilizationScore;

    // 3. Planning Score (0-20) - Diversity check
    let diversityCount = 0;
    if (taxProfile.investments > 0) diversityCount++;
    if (taxProfile.insurance > 0) diversityCount++;
    if (taxProfile.nps > 0) diversityCount++;
    if (taxProfile.homeLoan > 0) diversityCount++;
    
    const planningScore = (diversityCount / 4) * weights.planning;
    score += planningScore;

    // 4. Regime Choice Score (0-10)
    if (taxResult.recommendedRegime === taxProfile.activeRegime) {
        score += weights.regimeChoice;
    } else if (taxResult.savingsPotential < 2000) {
        score += weights.regimeChoice / 2; // Minor difference
    }

    return Math.round(Math.min(100, score));
};

module.exports = { calculateHealthScore };
