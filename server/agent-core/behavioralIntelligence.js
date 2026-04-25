const History = require('../models/History');

/**
 * Behavioral Intelligence Module
 * Tracks user patterns and generates proactive "nudges" based on historical data.
 */
class BehavioralIntelligence {
    async analyze(userId, currentProfile, currentResult) {
        const insights = [];
        
        if (!userId) return insights;

        try {
            // Fetch last 10 snapshots
            const history = await History.find({ user: userId }).sort({ timestamp: -1 }).limit(10);
            
            if (history.length < 2) return insights;

            // 1. Pattern: Consistent Under-utilization
            const avg80C = history.reduce((acc, h) => acc + (h.snapshot.investments || 0), 0) / history.length;
            if (avg80C < 50000 && currentProfile.income > 800000) {
                insights.push({
                    type: "PATTERN_DETECTED",
                    message: "You consistently under-utilize Section 80C deductions despite your income bracket.",
                    nudge: "Consider automating a monthly SIP in ELSS to hit the ₹1.5L limit effortlessly.",
                    confidence: 85
                });
            }

            // 2. Pattern: Regime Inertia
            const lastRegime = history[0].snapshot.activeRegime;
            const currentBetterRegime = currentResult.recommendedRegime;
            if (lastRegime !== currentBetterRegime && currentProfile.activeRegime === lastRegime) {
                insights.push({
                    type: "REGIME_INERTIA",
                    message: `You are sticking to the ${lastRegime} regime, but calculations show ${currentBetterRegime} is now more beneficial.`,
                    nudge: "Verify if your current year's investment plan has changed, making the other regime better.",
                    confidence: 90
                });
            }

            // 3. Pattern: Late Planning
            const lateMonths = [1, 2, 3]; // Feb, March
            const currentMonth = new Date().getMonth() + 1;
            if (lateMonths.includes(currentMonth)) {
                insights.push({
                    type: "PLANNING_HYGIENE",
                    message: "Investment detected in the last quarter of the financial year.",
                    nudge: "Planning early (April-June) allows for better cash flow management and higher compounded returns.",
                    confidence: 70
                });
            }

        } catch (error) {
            console.error("Behavioral Intelligence Error:", error.message);
        }

        return insights;
    }
}

module.exports = new BehavioralIntelligence();
