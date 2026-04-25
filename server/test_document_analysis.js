const { analyzeDocumentContent } = require('./services/documentAnalysisService');
require('dotenv').config();

async function test() {
  console.log('--- Testing Document Analysis Service ---');
  const mockText = `
    SALARY SLIP - MARCH 2024
    Employer: ACME CORP PVT LTD
    Employee: RAVI KUMAR
    PAN: ABCDE1234F
    
    EARNINGS:
    Basic Salary: 50,000
    HRA: 20,000
    Special Allowance: 10,000
    Gross Salary: 80,000
    
    DEDUCTIONS:
    Professional Tax: 200
    EPF: 1,800
    TDS: 5,000
  `;

  try {
    const result = await analyzeDocumentContent(mockText);
    console.log('Result Status:', result.status);
    console.log('Employer:', result.employer_name);
    console.log('Income:', JSON.stringify(result.income, null, 2));
    console.log('Optimization Hints:', result.optimization_hints);
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

test();
