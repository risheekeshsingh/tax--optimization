/**
 * Behavioral Intelligence Module
 * Analyzes user patterns and generates proactive nudges.
 */
const generateInsights = (taxProfile, history = []) => {
    const insights = [];
    
    // Pattern 1: Underutilized 80C
    if (taxProfile.investments < 50000 && taxProfile.income > 500000) {
        insights.push({
            type: "BEHAVIORAL",
            title: "Underutilized 80C",
            message: "You consistently miss full 80C usage. Even small monthly ELSS SIPs can bridge this gap.",
            logic: "Investments < 50k for income > 5L",
            confidence: 90
        });
    }

    // Pattern 2: Missing NPS (The extra 50k)
    if (taxProfile.nps === 0 && taxProfile.income > 1000000) {
        insights.push({
            type: "BEHAVIORAL",
            title: "NPS Opportunity Missed",
            message: "High earners typically benefit most from the extra ₹50k NPS deduction. You haven't started yet.",
            logic: "NPS = 0 for income > 10L",
            confidence: 95
        });
    }

    // Pattern 3: Late Planning (Mocked logic for demo)
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 0 && currentMonth <= 2) { // Jan, Feb, Mar
        insights.push({
            type: "NUDGE",
            title: "Last Minute Spurt",
            message: "It looks like you're optimizing in the final quarter. Next year, start in April to spread investments.",
            logic: "High activity in Q4",
            confidence: 85
        });
    }

    // Pattern 4: Suboptimal Regime Choice (If current regime is not the recommended one)
    // This will be handled by the coordinator but can be flagged here as a behavior
    
    return insights;
};

module.exports = { generateInsights };
