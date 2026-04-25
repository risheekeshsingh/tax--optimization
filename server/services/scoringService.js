/**
 * Optimization Scoring System
 * Calculates a 0-100 score based on tax efficiency.
 */
const calculateOptimizationScore = (taxProfile, taxResult, agenticInsights = {}) => {
    // 1. Deduction Utilization (0-40 points)
    const max80C = 150000;
    const max80D = taxProfile.isSenior ? 50000 : 25000;
    const maxNPS = 50000;
    const maxPossible = max80C + max80D + maxNPS;
    
    const currentUtilized = (Number(taxProfile.investments) || 0) + (Number(taxProfile.insurance) || 0) + (Number(taxProfile.nps) || 0);
    const utilizationScore = Math.min(40, (currentUtilized / maxPossible) * 40);

    // 2. Savings Efficiency (0-30 points)
    const liability = taxResult.finalTax || 1;
    const savings = taxResult.savingsPotential || 0;
    // Lower potential savings means they are ALREADY optimized.
    const efficiencyScore = Math.max(0, 30 - Math.min(30, (savings / (liability + savings)) * 100));

    // 3. Regime Efficiency (0-20 points)
    const regimeScore = (taxProfile.activeRegime === taxResult.recommendedRegime) ? 20 : 0;

    // 4. Missed Opportunities (0-10 points)
    const missedOpsCount = (agenticInsights.errors || []).length;
    const cleanlinessScore = Math.max(0, 10 - (missedOpsCount * 2));

    const totalScore = Math.round(utilizationScore + efficiencyScore + regimeScore + cleanlinessScore);

    let category = '';
    let explanation = '';

    if (totalScore <= 40) {
        category = 'Poor';
        explanation = 'Significant tax leakage detected. Many available deductions are under-utilized, and your current regime may not be optimal for your profile.';
    } else if (totalScore <= 60) {
        category = 'Average';
        explanation = 'You are utilizing some tax benefits, but there is substantial room for improvement in your investment strategy and regime selection.';
    } else if (totalScore <= 80) {
        category = 'Good';
        explanation = 'Effective tax management. Most primary deductions are well-utilized. Minor adjustments could still lead to incremental savings.';
    } else {
        category = 'Excellent';
        explanation = 'Highly optimized financial profile. You are maximizing tax benefits across all major categories with minimal tax liability.';
    }

    return {
        score: totalScore,
        category,
        explanation,
        breakdown: {
            utilization: Math.round(utilizationScore),
            efficiency: Math.round(efficiencyScore),
            regime: regimeScore,
            cleanliness: cleanlinessScore
        }
    };
};

module.exports = { calculateOptimizationScore };
