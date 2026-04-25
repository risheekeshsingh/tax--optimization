// const axios = require('axios');
require('dotenv').config();

const testTwin = async () => {
    try {
        console.log("🚀 Testing Tax Twin Analysis...");
        
        // Mock data
        const payload = {
            income: 1500000,
            monthlyIncome: 125000,
            investments: 120000,
            insurance: 25000,
            nps: 20000,
            monthlyExpenses: 60000,
            investmentHistory: [10000, 20000, 50000, 40000],
            month: 4 // April - Early in the year
        };

        // Note: We need a valid token to bypass auth middleware.
        // For testing purposes, we might temporarily disable auth or use a test account.
        // Assuming we are testing the service logic directly in this script.
        
        const { analyzeTwin } = require('./services/twinService');
        
        const analysis = await analyzeTwin(payload);
        
        console.log("\n✅ Analysis Result:");
        console.log(JSON.stringify(analysis, null, 2));
        
        if (analysis.userType === "Early Planner") {
            console.log("\n🎯 Behavior modeling works: Correctly identified as Early Planner.");
        } else {
            console.log("\n⚠️ Behavior modeling check failed. Expected Early Planner.");
        }

        if (analysis.aiSummary && analysis.aiSummary.length > 0) {
            console.log("\n🤖 AI Summary generated successfully!");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
};

testTwin();
