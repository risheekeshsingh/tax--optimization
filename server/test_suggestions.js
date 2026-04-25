const axios = require('axios');

async function runTests() {
  // Get auth token first
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'tt@tt.com', password: 'test'
  });
  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const cases = [
    {
      label: 'Case 1: No investments at all (high earner)',
      body: { income: 1500000, investments: 0, insurance: 0, nps: 0 }
    },
    {
      label: 'Case 2: Partial investments (moderate earner)',
      body: { income: 800000, investments: 100000, insurance: 0, nps: 30000 }
    },
    {
      label: 'Case 3: Near-maxed (light top-up needed)',
      body: { income: 1200000, investments: 140000, insurance: 20000, nps: 45000 }
    },
    {
      label: 'Case 4: Fully optimized (should get "perfect" message)',
      body: { income: 1200000, investments: 150000, insurance: 25000, nps: 50000 }
    },
    {
      label: 'Case 5: Missing income (should give 400 error)',
      body: { investments: 50000, insurance: 10000 }
    },
  ];

  for (const tc of cases) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🧪 ${tc.label}`);
    console.log('   Input:', tc.body);
    try {
      const res = await axios.post('http://localhost:5000/api/tax/suggestions', tc.body, { headers });
      if (res.data.suggestions) {
        res.data.suggestions.forEach(s => {
          console.log(`   ✅ [${s.priority.toUpperCase()}] ${s.type} — ${s.title}`);
          console.log(`      → ${s.message}`);
          console.log(`      amountToInvest: ₹${s.amountToInvest.toLocaleString('en-IN')}  |  taxSaving: ₹${s.taxSaving.toLocaleString('en-IN')}`);
        });
      } else {
        console.log(`   ✅ ${res.data.message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    }
  }
  console.log(`\n${'─'.repeat(60)}\n✅ All tests done.\n`);
}

runTests().catch(console.error);
