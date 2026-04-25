const { getFullIntelligencePayload } = require('./server/services/intelligenceCoordinator');

const testData = {
    income: 1200000,
    investments: 50000,
    insurance: 10000,
    nps: 0,
    activeRegime: 'OLD'
};

try {
    console.log("--- Testing AI Intelligence Engine ---");
    const result = getFullIntelligencePayload(testData);

    console.log("\n1. Optimization Score:", result.score);
    
    console.log("\n2. Recommendations:");
    result.recommendations.forEach(r => console.log(`- [${r.priority}] ${r.title}: ${r.suggestion}`));

    console.log("\n3. Insights:");
    result.insights.forEach(i => console.log(`- ${i.title}: ${i.message}`));

    console.log("\n4. Errors/Optimizations:");
    result.errors.forEach(e => console.log(`- [${e.type}] ${e.title}: ${e.message}`));

    console.log("\n5. Scenario Simulation:");
    result.simulations.forEach(s => console.log(`- ${s.name}: Impact ₹${s.impact.toLocaleString()}`));

    console.log("\n✅ Test Passed: Intelligence Engine is operational.");
} catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
}
