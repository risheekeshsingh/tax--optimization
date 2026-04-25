const { calculateFullTax } = require('../universalTaxEngine');

/**
 * Scenario Simulator Engine
 * Computes tax delta for various "what-if" scenarios.
 */
const runScenarios = (taxProfile) => {
    const scenarios = [];
    const basePayload = {
        income: taxProfile.income || 0,
        investments: taxProfile.investments || 0,
        insurance: taxProfile.insurance || 0,
        nps: taxProfile.nps || 0,
        hra: taxProfile.hra || 0,
        homeLoan: taxProfile.homeLoan || 0,
        isSenior: taxProfile.isSenior || false,
    };

    const baseline = calculateFullTax(basePayload);
    const baseTax = baseline.finalTax;

    // Scenario 1: Salary Hike (10%)
    const hikePayload = { ...basePayload, income: Math.round(basePayload.income * 1.1) };
    const hikeResult = calculateFullTax(hikePayload);
    scenarios.push({
        id: "SALARY_HIKE_10",
        name: "Next Promotion (+10%)",
        impact: hikeResult.finalTax - baseTax,
        newTax: hikeResult.finalTax,
        newIncome: hikePayload.income,
        description: "Estimated impact if your salary increases by 10% after your next review."
    });

    // Scenario 2: Full Deductions Utilization
    const maxDeductionsPayload = {
        ...basePayload,
        investments: 150000,
        insurance: basePayload.isSenior ? 50000 : 25000,
        nps: 50000
    };
    const maxResult = calculateFullTax(maxDeductionsPayload);
    scenarios.push({
        id: "MAX_DEDUCTIONS",
        name: "Full Optimization",
        impact: maxResult.finalTax - baseTax,
        newTax: maxResult.finalTax,
        newIncome: basePayload.income, 
        description: "Your tax liability if you aggressively maximize all 80C, 80D, and NPS limits."
    });

    // Scenario 4: Professional Career Growth (Jump +30%)
    const growthPayload = { ...basePayload, income: Math.round(basePayload.income * 1.3) };
    const growthResult = calculateFullTax(growthPayload);
    scenarios.push({
        id: "CAREER_JUMP",
        name: "Career Jump (+30%)",
        impact: growthResult.finalTax - baseTax,
        newTax: growthResult.finalTax,
        newIncome: growthPayload.income,
        description: `Strategic forecast if you secure a 30% jump to ₹${growthPayload.income.toLocaleString()}.`
    });

    // Scenario 5: Job Switch (Mid-year switch impact)
    scenarios.push({
        id: "JOB_SWITCH",
        name: "Job Switch Logic",
        impact: 0,
        newTax: baseTax,
        newIncome: basePayload.income,
        description: "Switching jobs? Ensure your TDS is calculated across both employers to avoid a large tax bill in March."
    });

    return scenarios;
};

module.exports = { runScenarios };
