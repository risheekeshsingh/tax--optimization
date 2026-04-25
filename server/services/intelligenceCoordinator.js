const { generateRecommendations } = require('./ai-engine/recommendationEngine');
const { runScenarios } = require('./simulation/scenarioSimulator');
const { generateInsights } = require('./insights/behavioralIntelligence');
const { detectErrorsAndOptimizations } = require('./insights/errorOptimizer');
const { calculateHealthScore } = require('./financialHealth/healthScorer');
const { calculateFullTax } = require('./universalTaxEngine');

/**
 * Planning Timeline Generator
 */
const getTimeline = (taxProfile) => {
    return [
        { month: "April", action: "Plan Investments", detail: "Declare your 80C and 80D intentions to HR to reduce monthly TDS." },
        { month: "July", action: "ITR Filing", detail: "Last date to file for previous FY. Use Your Money for 1-click filing." },
        { month: "Oct", action: "Review Gaps", detail: "Half-year check. Are your investments on track?" },
        { month: "Jan", action: "Submit Proofs", detail: "HR will start asking for documentation. Scan them using our analyzer." },
        { month: "March", action: "Final Optimize", detail: "Last chance to save tax. Maximize 80C and NPS now." }
    ];
};

/**
 * Intelligence Coordinator
 * Aggregates all AI features into a single structured response.
 */
const getFullIntelligencePayload = (taxProfile) => {
    // 1. Core Tax Calculation
    const taxResult = calculateFullTax(taxProfile);

    // 2. Generate Recommendations
    const recommendations = generateRecommendations(taxProfile);

    // 3. Run Simulations
    const simulations = runScenarios(taxProfile);

    // 4. Generate Behavioral Insights
    const insights = generateInsights(taxProfile);

    // 5. Detect Errors & Optimizations
    const errors = detectErrorsAndOptimizations(taxProfile, taxResult);

    // 6. Compute Health Score
    const score = calculateHealthScore(taxProfile, taxResult);

    // 7. Get Roadmap Timeline
    const timeline = getTimeline(taxProfile);

    return {
        recommendations,
        insights,
        errors,
        simulations,
        score,
        timeline,
        taxResult // include the core calculation for convenience
    };
};

module.exports = { getFullIntelligencePayload };
