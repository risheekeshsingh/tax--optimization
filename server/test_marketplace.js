require('dotenv').config();
const { getMarketplaceRecommendations } = require('./services/marketplaceService');

const testData = {
  annualIncome: 1500000,
  age: 30,
  regime: 'old',
  investments80C: 0,
  healthInsurance80D: 0,
  nps80CCD: 0,
};

console.log('Testing marketplace service with taxData:', testData);

getMarketplaceRecommendations(testData)
  .then(result => {
    console.log('\nSUCCESS');
    console.log('Meta:', JSON.stringify(result.meta, null, 2));
    console.log('Total Recommendations:', result.recommendations.length);
    result.recommendations.forEach((r, i) => {
      console.log(`\n[${i+1}] ${r.productName}`);
      console.log(`    Category: ${r.category} | NAV: ${r.nav} | Risk: ${r.riskLevel}`);
      console.log(`    AI Confidence: ${r.confidenceScore}%`);
      console.log(`    Benefit: ${r.expectedBenefit}`);
    });
  })
  .catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
