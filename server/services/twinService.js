const { calculateFullTax, CONSTANTS } = require('./universalTaxEngine');
const { getTaxLimit } = require('../config/configLoader');
const { OpenAI } = require('openai');

// Initialize Groq/OpenAI client
const aiClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined
});

/**
 * Analyzes investment history and month to determine user type.
 */
function analyzeBehavior(data) {
    const { investmentHistory = [], month = new Date().getMonth() + 1 } = data;
    
    if (investmentHistory.length === 0) {
        if (data.investments > 100000) return "Early Planner";
        if (data.investments > 0 && month >= 10) return "Last-Minute Saver";
        if (data.investments > 0) return "Smart Optimizer";
        return "Passive Investor";
    }

    const totalInvested = investmentHistory.reduce((a, b) => a + b, 0);
    const isLateHitter = month >= 10;
    
    if (totalInvested > 150000 && !isLateHitter) return "Early Planner";
    if (isLateHitter) return "Last-Minute Saver";
    if (totalInvested < 50000) return "Passive Investor";
    
    return "Smart Optimizer";
}

/**
 * Detects financial events like income spikes.
 */
function detectEvents(data) {
    const events = [];
    const { monthlyIncome, investments } = data;

    if (monthlyIncome > 100000) {
        events.push({ type: 'spike', message: "Looks like you received a bonus or a raise! 🚀" });
    }

    if (investments < 5000 && (new Date().getMonth() + 1) >= 1) {
        events.push({ type: 'warning', message: "Investments are low for the quarter. Don't wait until March!" });
    }

    return events;
}

/**
 * Generates proactive insights based on universal engine.
 */
function generateInsights(data) {
    // Scenario 1: Current
    const current = calculateFullTax(data);

    // Scenario 2: Optimized (Fill all limits)
    const optimizedPayload = {
        ...data,
        investments: CONSTANTS.LIMIT_80C,
        insurance: data.isSenior ? CONSTANTS.LIMIT_80D_SENIOR : CONSTANTS.LIMIT_80D_DEFAULT,
        nps: CONSTANTS.LIMIT_80CCD
    };
    const optimized = calculateFullTax(optimizedPayload);

    const potentialSavings = Math.max(0, current.finalTax - optimized.finalTax);
    const insights = [];

    const unused80C = CONSTANTS.LIMIT_80C - (data.investments || 0);
    if (unused80C > 0) {
        insights.push(`You are underutilizing 80C by ₹${unused80C.toLocaleString('en-IN')}.`);
    }

    if (potentialSavings > 20000) {
        insights.push(`Act now to save ₹${potentialSavings.toLocaleString('en-IN')} in taxes before the deadline.`);
    }

    return { insights, prediction: { potentialSavings, predictedTax: optimized.finalTax } };
}

/**
 * Generates AI-powered conversational summary.
 */
async function generateAISummary(analysis) {
    const { userType, predictedTax, insights } = analysis;
    
    const prompt = `
        You are "Tax Twin", a user's intelligent financial clone. 
        Tone: Friendly, slightly witty, advisory.
        User Data:
        - Type: ${userType}
        - Predicted Tax: ₹${predictedTax}
        - Insights: ${insights.join(' ')}
        
        Generate a short (2-3 sentence) summary for the user about their financial health and what they should do.
    `;

    try {
        const response = await aiClient.chat.completions.create({
            model: process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an expert AI financial advisor called Tax Twin." },
                { role: "user", content: prompt }
            ],
            max_tokens: 150
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI Summary Error:", error);
        return "Your Twin is analyzing your data. Keep up the good work and stay focused on your tax goals!";
    }
}

async function analyzeTwin(data) {
    const userType = analyzeBehavior(data);
    const events = detectEvents(data);
    const { insights, prediction } = generateInsights(data);
    
    const warnings = [];
    if (prediction.potentialSavings > 10000) {
        warnings.push(`Skipping investments now may cost you ₹${prediction.potentialSavings.toLocaleString('en-IN')} in taxes.`);
    }

    const opportunities = [];
    const limit80C = CONSTANTS.LIMIT_80C;
    if (limit80C - (data.investments || 0) > 20000) {
        opportunities.push({
            action: "Invest in ELSS",
            amount: 40000,
            taxSaving: 12000
        });
    }

    const analysis = {
        userType,
        insights,
        warnings,
        opportunities,
        events,
        predictedTax: prediction.predictedTax || 0
    };

    analysis.aiSummary = await generateAISummary(analysis);

    return analysis;
}

module.exports = { analyzeTwin };
