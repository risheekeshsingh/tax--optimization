require("dotenv").config();
const { chatWithAI } = require("./controllers/aiController.js");

const req = {
  body: {
    message: "How can I increase my savings?",
    taxData: {
      taxableIncome: 1200000,
      taxLiability: 156000,
      savingsPotential: 46800,
      taxScore: 78
    }
  }
};
const res = {
  json: (data) => console.log("Success:", data),
  status: (code) => {
    console.log("Status code:", code);
    return { json: (data) => console.log("Failed:", data) };
  }
};

async function test() {
   await chatWithAI(req, res);
}
test();
