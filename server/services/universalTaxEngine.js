/**
 * Universal Tax Engine — Production-Grade Indian Tax Calculator (FY 2024-25)
 * 
 * Objectives:
 * 1. 100% Deterministic calculation for both Old and New Regimes.
 * 2. Support for Surcharge and Section 87A Marginal Relief.
 * 3. Standardized payload for both Frontend and Backend.
 */

const CONSTANTS = {
  STANDARD_DEDUCTION: 50000,
  STANDARD_DEDUCTION_NEW: 75000,
  LIMIT_80C: 150000,
  LIMIT_80D_DEFAULT: 25000,
  LIMIT_80D_SENIOR: 50000,
  LIMIT_80CCD: 50000, // NPS
  LIMIT_24B: 200000,  // Home Loan Interest
  SURCHARGE_THRESHOLD: 5000000,
  CESS_RATE: 0.04,
  
  OLD_REGIME_SLABS: [
    { min: 0,       max: 250000,   rate: 0.00 },
    { min: 250000,  max: 500000,   rate: 0.05 },
    { min: 500000,  max: 1000000,  rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 },
  ],

  NEW_REGIME_SLABS: [
    { min: 0,       max: 300000,   rate: 0.00 },
    { min: 300000,  max: 600000,   rate: 0.05 },
    { min: 600000,  max: 900000,   rate: 0.10 },
    { min: 900000,  max: 1200000,  rate: 0.15 },
    { min: 1200000, max: 1500000,  rate: 0.20 },
    { min: 1500000, max: Infinity, rate: 0.30 },
  ]
};

/**
 * Slab Calculation Helper
 */
function computeSlabTax(taxableIncome, slabs) {
  let tax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break;

    const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
    const slabTax = Math.round(taxableInSlab * slab.rate);

    if (taxableInSlab > 0) {
      breakdown.push({
        range: `₹${slab.min.toLocaleString("en-IN")} – ${slab.max === Infinity ? "Above" : "₹" + slab.max.toLocaleString("en-IN")}`,
        rate: `${(slab.rate * 100).toFixed(0)}%`,
        taxableAmount: taxableInSlab,
        tax: slabTax,
      });
      tax += slabTax;
    }
  }

  return { tax, breakdown };
}

/**
 * Main Calculation Engine
 */
function calculateFullTax(data) {
  const {
    income = 0,
    investments = 0, // 80C
    insurance = 0,   // 80D
    nps = 0,         // 80CCD
    hra = 0,         // Exemption already calculated or raw
    homeLoan = 0,    // 24b
    isSenior = false,
    profTax = 0,
    basic = 0,       // Needed if calculating HRA from raw
    da = 0,
    monthlyRent = 0,
    cityCategory = "metro",
  } = data;

  const grossSalary = Number(income);
  
  // 1. Calculate HRA Exemption if not provided
  let hraExemption = Number(hra) || 0;
  if (hraExemption === 0 && monthlyRent > 0 && basic > 0) {
    const annualRent = monthlyRent * 12;
    const annualHraReceived = (data.hraReceived || 0); // fallback if explicitly passed
    const basicPlusDa = Number(basic) + Number(da);
    const isMetro = cityCategory.toLowerCase().includes("metro");
    
    const c1 = annualHraReceived;
    const c2 = Math.round(basicPlusDa * (isMetro ? 0.50 : 0.40));
    const c3 = Math.max(0, annualRent - Math.round(basicPlusDa * 0.10));
    hraExemption = Math.min(c1, c2, c3);
  }

  // 2. Standardized Deductions
  const deduction80C = Math.min(Number(investments), CONSTANTS.LIMIT_80C);
  const limit80D = isSenior ? CONSTANTS.LIMIT_80D_SENIOR : CONSTANTS.LIMIT_80D_DEFAULT;
  const deduction80D = Math.min(Number(insurance), limit80D);
  const deductionNPS = Math.min(Number(nps), CONSTANTS.LIMIT_80CCD);
  const deduction24B = Math.min(Number(homeLoan), CONSTANTS.LIMIT_24B);
  const standardDeduction = CONSTANTS.STANDARD_DEDUCTION;

  // ──── OLD REGIME ────
  const totalOldDeductions = standardDeduction + hraExemption + deduction80C + deduction80D + deductionNPS + deduction24B + Number(profTax);
  const taxableIncomeOld = Math.max(0, grossSalary - totalOldDeductions);
  const { tax: baseTaxOld, breakdown: slabsOld } = computeSlabTax(taxableIncomeOld, CONSTANTS.OLD_REGIME_SLABS);
  
  let rebate87aOld = 0;
  if (taxableIncomeOld <= 500000) rebate87aOld = baseTaxOld;
  
  const taxAfterRebateOld = Math.max(0, baseTaxOld - rebate87aOld);
  const surchargeOld = taxableIncomeOld > CONSTANTS.SURCHARGE_THRESHOLD ? taxAfterRebateOld * 0.10 : 0;
  const cessOld = Math.round((taxAfterRebateOld + surchargeOld) * CONSTANTS.CESS_RATE);
  const finalTaxOld = taxAfterRebateOld + surchargeOld + cessOld;

  // ──── NEW REGIME ────
  // New Regime only allows Standard Deduction (and employer NPS contribution which we skip for now)
  const totalNewDeductions = CONSTANTS.STANDARD_DEDUCTION_NEW;
  const taxableIncomeNew = Math.max(0, grossSalary - totalNewDeductions);
  const { tax: baseTaxNew, breakdown: slabsNew } = computeSlabTax(taxableIncomeNew, CONSTANTS.NEW_REGIME_SLABS);

  let rebate87aNew = 0;
  let taxAfterRebateNew = baseTaxNew;
  let marginalReliefNew = 0;

  if (taxableIncomeNew <= 700000) {
    rebate87aNew = baseTaxNew;
    taxAfterRebateNew = 0;
  } else if (taxableIncomeNew > 700000 && taxableIncomeNew <= 727770) {
    const excessIncome = taxableIncomeNew - 700000;
    if (baseTaxNew > excessIncome) {
      marginalReliefNew = baseTaxNew - excessIncome;
      taxAfterRebateNew = excessIncome;
    }
  }

  const surchargeNew = taxableIncomeNew > CONSTANTS.SURCHARGE_THRESHOLD ? taxAfterRebateNew * 0.10 : 0;
  const cessNew = Math.round((taxAfterRebateNew + surchargeNew) * CONSTANTS.CESS_RATE);
  const finalTaxNew = taxAfterRebateNew + surchargeNew + cessNew;

  // ──── COMPARISON & OPTIMIZATION ────
  const recommendedRegime = finalTaxOld < finalTaxNew ? "OLD" : "NEW";
  const finalTax = recommendedRegime === "OLD" ? finalTaxOld : finalTaxNew;
  const savingsPotential = Math.abs(finalTaxOld - finalTaxNew);

  // Optimization Score (Simple 0-100 based on deduction utilization)
  const maxPossibleDeductions = CONSTANTS.LIMIT_80C + (isSenior ? CONSTANTS.LIMIT_80D_SENIOR : CONSTANTS.LIMIT_80D_DEFAULT) + CONSTANTS.LIMIT_80CCD;
  const currentUtilized = deduction80C + deduction80D + deductionNPS;
  const taxScore = Math.min(100, Math.round((currentUtilized / maxPossibleDeductions) * 100));

  return {
    income: grossSalary,
    taxableIncome: recommendedRegime === "OLD" ? taxableIncomeOld : taxableIncomeNew,
    finalTax,
    taxLiability: finalTax, // alias for consistency
    savingsPotential,
    taxScore,
    recommendedRegime,
    oldRegime: {
      taxableIncome: taxableIncomeOld,
      baseTax: baseTaxOld,
      rebate87A: rebate87aOld,
      cess: cessOld,
      finalTax: finalTaxOld,
      slabs: slabsOld
    },
    newRegime: {
      taxableIncome: taxableIncomeNew,
      baseTax: baseTaxNew,
      rebate87A: rebate87aNew,
      marginalRelief: marginalReliefNew,
      cess: cessNew,
      finalTax: finalTaxNew,
      slabs: slabsNew
    },
    deductions: {
      standard: standardDeduction,
      section80C: deduction80C,
      section80D: deduction80D,
      nps80CCD: deductionNPS,
      section24B: deduction24B,
      hraExemption,
      totalOld: totalOldDeductions,
      totalNew: totalNewDeductions
    }
  };
}

module.exports = { calculateFullTax, CONSTANTS };
