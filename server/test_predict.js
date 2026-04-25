const axios = require('axios');

async function run() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'tt@tt.com', password: 'test'
  });
  const headers = { Authorization: `Bearer ${loginRes.data.token}` };

  const cases = [
    {
      label: 'Case 1: No investments — high earner (₹15L)',
      body: { income: 1500000, investments: 0, insurance: 0, nps: 0 }
    },
    {
      label: 'Case 2: Partial investments (₹8L income)',
      body: { income: 800000, investments: 100000, insurance: 15000, nps: 0 }
    },
    {
      label: 'Case 3: Already fully optimized',
      body: { income: 1200000, investments: 150000, insurance: 25000, nps: 50000 }
    },
    {
      label: 'Case 4: Low income — below tax slab',
      body: { income: 250000, investments: 0, insurance: 0, nps: 0 }
    },
    {
      label: 'Case 5: Missing income — should return 400',
      body: { investments: 50000 }
    }
  ];

  for (const tc of cases) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(`🔮 ${tc.label}`);
    try {
      const { data } = await axios.post('http://localhost:5000/api/tax/predict', tc.body, { headers });
      console.log(`   currentTax:            ₹${data.currentTax?.toLocaleString('en-IN')}`);
      console.log(`   predictedTax:          ₹${data.predictedTax?.toLocaleString('en-IN')}`);
      console.log(`   potentialSavings:      ₹${data.potentialSavings?.toLocaleString('en-IN')}`);
      console.log(`   currentTaxableIncome:  ₹${data.currentTaxableIncome?.toLocaleString('en-IN')}`);
      console.log(`   optimizedTaxableIncome:₹${data.optimizedTaxableIncome?.toLocaleString('en-IN')}`);
      console.log(`   insight: "${data.insight}"`);
    } catch (err) {
      console.log(`   ❌ ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    }
  }
  console.log(`\n${'─'.repeat(65)}\n✅ All tests done.\n`);
}

run().catch(console.error);
