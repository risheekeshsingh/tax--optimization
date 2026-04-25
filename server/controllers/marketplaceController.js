const { getMarketplaceRecommendations } = require('../services/marketplaceService');

// ─────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────
function validateTaxData(taxData) {
  const errors = [];

  if (!taxData || typeof taxData !== 'object') {
    return ['taxData payload is missing or invalid.'];
  }

  const annualIncome = parseInt(taxData.annualIncome);
  if (!annualIncome || annualIncome <= 0) {
    errors.push('annualIncome is required and must be a positive number.');
  }

  // age can be optional (we derive defaults)
  if (taxData.age !== undefined && (parseInt(taxData.age) < 18 || parseInt(taxData.age) > 100)) {
    errors.push('age must be between 18 and 100.');
  }

  // regime optional — defaults to 'old'
  const validRegimes = ['old', 'new'];
  if (taxData.regime && !validRegimes.includes(taxData.regime)) {
    errors.push(`regime must be one of: ${validRegimes.join(', ')}.`);
  }

  // At least one gap should be non-zero to make a meaningful recommendation
  const gap80C = Math.max(0, 150000 - (parseInt(taxData.investments80C) || 0));
  const gap80D = Math.max(0, 25000 - (parseInt(taxData.healthInsurance80D) || 0));
  const gapNPS = Math.max(0, 50000 - (parseInt(taxData.nps80CCD) || 0));
  if (gap80C === 0 && gap80D === 0 && gapNPS === 0) {
    errors.push('All tax deduction limits are already fully utilized. No recommendations available.');
  }

  return errors;
}

// ─────────────────────────────────────────────────────────
// CONTROLLER — POST /api/marketplace/recommendations
// ─────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    const taxData = req.body.taxData;

    // Validate
    const validationErrors = validateTaxData(taxData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    // Orchestrate: MFAPI + Groq
    const result = await getMarketplaceRecommendations(taxData);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[MarketplaceController] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Marketplace recommendation engine failed.',
      details: err.message,
    });
  }
};

module.exports = { getRecommendations };
