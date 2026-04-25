const { getTaxLimit, getInvestmentOptions } = require('../config/configLoader');

/**
 * Generates a rich, UI-ready report targeting the exact schema expected by DocumentAnalyzer.jsx
 */
const generateDocReport = (extraction, taxEngineResult) => {
  const { oldRegime, newRegime, deductions, recommendedRegime, savingsPotential } = taxEngineResult;

  // 1. Comparison Summary
  const comparison = {
    recommendedRegime,
    annualSavings: savingsPotential,
    monthlySavings: Math.round(savingsPotential / 12)
  };

  // 2. Regime Details
  const formatRegime = (regimeData, regimeType) => {
    const isOld = regimeType === 'OLD';
    
    // Deductions Array
    const regimeDeductions = [];
    regimeDeductions.push({ name: 'Standard Deduction', amount: deductions.standard, section: 'Sec 16ia' });

    if (isOld) {
      if (deductions.hraExemption > 0) regimeDeductions.push({ name: 'HRA Exemption', amount: deductions.hraExemption, section: 'Sec 10(13A)' });
      if (deductions.section80C > 0) regimeDeductions.push({ name: 'Section 80C', amount: deductions.section80C, section: '80C' });
      if (deductions.section80D > 0) regimeDeductions.push({ name: 'Section 80D', amount: deductions.section80D, section: '80D' });
      if (deductions.nps80CCD > 0) regimeDeductions.push({ name: 'NPS', amount: deductions.nps80CCD, section: '80CCD(1B)' });
      if (deductions.section24B > 0) regimeDeductions.push({ name: 'Home Loan Interest', amount: deductions.section24B, section: 'Sec 24b' });
    }

    return {
      grossSalary: extraction.grossSalary,
      taxableIncome: regimeData.taxableIncome,
      taxBeforeCess: regimeData.baseTax,
      cess: regimeData.cess,
      totalTax: regimeData.finalTax,
      monthlyTDS: Math.round(regimeData.finalTax / 12),
      deductions: regimeDeductions,
      slabBreakdown: regimeData.slabs
    };
  };

  // 3. Restructuring Advice (Schema Alignment)
  const restructuring = {
    suggestedBasic: Math.round(extraction.grossSalary * 0.4),
    suggestedHRA: Math.round(extraction.grossSalary * 0.16), // Typical optimization
    itActSection: "Section 10(13A) & 16ia",
    advice: extraction.grossSalary > 1200000 
      ? "Your salary components are highly taxable. Consider increasing HRA to 40% of basic and opting for Meal Coupons to reduce taxable income by ₹50,000 annually."
      : "Your current structure is mostly optimal, but ensuring HRA is at least 40% of basic will maximize your rent exemption benefits.",
    projectedMonthlySaving: Math.round(savingsPotential / 12) || 1200
  };

  // 4. Investment Action Plan
  const actionPlan = [];
  const secKeys = [
    { key: '80C', name: 'Section 80C' },
    { key: '80D', name: 'Section 80D' },
    { key: 'NPS', name: 'Section 80CCD' }
  ];

  secKeys.forEach(sec => {
    const limit = getTaxLimit(sec.key);
    const current = (sec.key === '80C' ? (extraction.investments80C || 0) + (extraction.employeePF || 0) : 
                     sec.key === '80D' ? (extraction.healthInsurance80D || 0) : 
                     (extraction.nps80CCD || 0));
    const gap = Math.max(0, limit - current);
    
    const options = getInvestmentOptions(sec.key);
    const suggestion = gap > 0 
      ? `You have a gap of ₹${gap.toLocaleString('en-IN')}. Consider investing in ${options[0]?.name || 'Tax Saving Schemes'} to maximize benefits.`
      : `Great! You have fully utilized your ${sec.name} limits.`;

    actionPlan.push({
      section: sec.name,
      limit,
      currentInvestment: current, // Match frontend "currentInvestment" usage
      gap,
      suggestion
    });
  });

  // 5. Verdict (Multi-line string)
  const verdict = recommendedRegime === 'OLD'
    ? `VERDICT: Stick to the OLD REGIME.\nBased on your Form 16/Slip, your deductions significantly outweigh the lower rates of the New Regime.\nYou are saving ₹${savingsPotential.toLocaleString('en-IN')} compared to the alternative.`
    : `VERDICT: Switch to the NEW REGIME.\nYour current investments are low relative to your income slab. The New Regime's lower tax rates provide a better outcome for your profile.\nYou will save ₹${savingsPotential.toLocaleString('en-IN')} immediately without additional investments.`;

  return {
    comparison,
    oldRegime: formatRegime(oldRegime, 'OLD'),
    newRegime: formatRegime(newRegime, 'NEW'),
    restructuring,
    investmentActions: actionPlan,
    verdict
  };
};

module.exports = { generateDocReport };
