const { calculateTax } = require('./server/controllers/taxController');

const req = {
  body: {
    income: 1200000,
    investments: 160000, // Should cap at 150000
    insurance: 30000, // Should cap at 25000
    nps: 60000 // Should cap at 50000
  }
};

const res = {
  json: (data) => console.log('Response:', data),
  status: (code) => {
    console.log('Status:', code);
    return { json: (data) => console.log('Response:', data) };
  }
};

calculateTax(req, res);
