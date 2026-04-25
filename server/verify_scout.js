const Groq = require("groq-sdk");
require("dotenv").config({ path: "./server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = "Return a JSON object with status: 'success'.";

async function verifyScout() {
  console.log("Testing Llama 4 Scout...");
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Tell me status" }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      response_format: { type: "json_object" },
    });

    console.log("Success! Response:", completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Scout Test Failed:", error.message);
  }
}

verifyScout();
