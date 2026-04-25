const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatWithAI = async (req, res) => {
    try {
        const { message, taxData } = req.body;

        const apiKey = process.env.GROQ_API_KEY;

        // Fallback mock response if no Groq key
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            const mock = buildMockResponse(message, taxData);
            return res.json({ reply: mock, actionableAdvice: true });
        }

        const systemContext = `You are the "Your Money" AI Tax Advisor, a proactive and highly intelligent financial companion.
        Your goal is to provide actionable, deep tax strategies based on the user's data.

        MANDATORY RESPONSE STRUCTURE:
        1. Contextual Advice: Give the main answer first in 2-3 sentences.
        2. Reason: Explain the 'WHY' behind this advice in a new line starting with "Reason: ".
        3. Rule: Cite the specific Income Tax Section (e.g., "Rule: Section 80C") in a new line starting with "Rule: ".
        4. Confidence: Provide a confidence score (e.g., "Confidence: 95%") in a new line starting with "Confidence: ".

        USER DATA:
        - Income: ₹${taxData.income || taxData.taxableIncome}
        - Current Tax: ₹${taxData.taxLiability}
        - Potential Savings: ₹${taxData.savingsPotential}
        - Regimes: ${taxData.recommendedRegime === 'OLD' ? 'Old Regime is currently better for this user.' : 'New Regime is currently better for this user.'}

        Tone: Professional, futuristic, and encouraging. Focus on forward-thinking strategies like career growth and long-term wealth.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemContext },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content;

        res.json({ reply, actionableAdvice: true });

    } catch (error) {
        console.error('AI Chat Error:', error.message);
        res.status(500).json({
            reply: `Sorry, I am having trouble connecting right now. (${error.message?.substring(0, 80)})`
        });
    }
};

function buildMockResponse(message, taxData) {
    const income = taxData?.income || taxData?.taxableIncome || 0;
    const savings = taxData?.savingsPotential || 0;
    const msg = message?.toLowerCase() || '';

    if (msg.includes('80c') || msg.includes('save') || msg.includes('how')) {
        return `You can maximize your savings by focusing on ELSS (Mutual Funds) which offers both tax benefits and wealth creation.
Reason: You have an untapped potential in Section 80C which is the foundation of tax optimization.
Rule: Section 80C
Confidence: 100%`;
    }
    if (msg.includes('80d') || msg.includes('health')) {
        return `A comprehensive family health insurance is recommended.
Reason: It provides a double benefit of medical security and significant tax deductions.
Rule: Section 80D
Confidence: 98%`;
    }
    if (msg.includes('nps') || msg.includes('extra')) {
        return `The National Pension System (NPS) is your best tool for an additional ₹50,000 deduction.
Reason: You are in a high tax bracket where every extra deduction yields 30% instant savings.
Rule: Section 80CCD(1B)
Confidence: 95%`;
    }
    return `Your overall tax strategy should be to maximize 80C first, then move to 80D and NPS for supplemental savings.
Reason: This sequential approach ensures you consolidate the highest-impact deductions first.
Rule: FY 2024-25 Guidelines
Confidence: 92%`;
}

module.exports = { chatWithAI };
