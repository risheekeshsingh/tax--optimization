const Groq = require("groq-sdk");
require("dotenv").config({ path: "./server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function verifyVision() {
  console.log("Testing Groq Vision model...");
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is in this image?" },
            {
              type: "image_url",
              image_url: {
                url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Google_Vicons.png",
              },
            },
          ],
        },
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.1,
    });

    console.log("Success! Response:", completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Vision Test Failed:", error.message);
  }
}

verifyVision();
