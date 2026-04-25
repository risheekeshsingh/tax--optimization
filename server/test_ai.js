const axios = require('axios');

async function test() {
  try {
    // First login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tt@tt.com', password: 'test'
    });
    const token = loginRes.data.token;
    console.log('✅ Login OK, token:', token?.substring(0, 30) + '...');

    // Test AI chat
    const aiRes = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'How can I save tax with 80C?',
      taxData: { taxableIncome: 900000, taxLiability: 107500, savingsPotential: 65000 }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ AI Reply:', aiRes.data.reply?.substring(0, 200));
  } catch (err) {
    console.error('❌ Error:', err.response?.status, JSON.stringify(err.response?.data));
    console.error('Message:', err.message);
  }
}
test();
