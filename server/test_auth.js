const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Test", email: "tt@tt.com", password: "test"
    });
    console.log("Register response:", res.data);
  } catch (err) {
    console.log("Register error:", err.response?.data || err.message);
  }
}
test();
