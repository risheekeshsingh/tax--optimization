const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Parses bank statement text and extracts tax-relevant transactions.
 */
const parseBankStatement = async (text) => {
    const systemPrompt = `SYSTEM: You are a Financial Intelligence AI. 
Analyze the provided bank statement text and extract tax-relevant financial insights.

MANDATORY OUTPUT FORMAT (JSON ONLY):
{
  "extractedData": {
    "salaryCredits": [],
    "rentPayments": [],
    "insurancePayments": [],
    "investments": [],
    "donations": []
  },
  "insights": [
    "Detected rent payments → HRA can be claimed",
    "Insurance payments qualify for 80D"
  ],
  "recommendations": [
    "Invest ₹30,000 more under 80C to save ₹9,000 tax"
  ],
  "alerts": []
}

CATEGORIES:
- 80C: PPF, ELSS, LIC, Tuition Fees, Home Loan Principal, PF.
- 80D: Health Insurance.
- HRA: Rent payments.
- 80G: Donations.

Return ONLY valid JSON. No conversational text.`;

    try {
        // Truncate text if it's too long for LLM context (approx 30k chars)
        const truncatedText = text.length > 30000 ? text.slice(-30000) : text;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this bank statement:\n\n${truncatedText}` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        let aiResponse = completion.choices[0]?.message?.content;
        
        // Robust JSON cleaning
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            aiResponse = jsonMatch[0];
        }
        
        return JSON.parse(aiResponse);
    } catch (error) {
        console.error("Bank Parsing Error:", error.message);
        // Fallback to empty report instead of crashing the flow
        return {
            extractedData: { salaryCredits: [], rentPayments: [], insurancePayments: [], investments: [], donations: [] },
            insights: ["The document could not be fully analyzed by AI."],
            recommendations: ["Please manually verify your bank statement for tax-saving transactions."],
            alerts: ["AI Extraction failed - results may be incomplete."]
        };
    }
};

module.exports = {
    parseBankStatement
};
