const axios = require('axios');
const taxDataObj = {
  taxableIncome: 1200000,
  taxLiability: 156000,
  savingsPotential: 46800,
  taxScore: 78
};

async function testFrontendChatCall() {
  try {
    const res = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'How can I increase my savings?',
      taxData: taxDataObj
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}
testFrontendChatCall();
