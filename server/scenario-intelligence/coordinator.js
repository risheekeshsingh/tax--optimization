/**
 * Scenario Intelligence Coordinator
 * Orchestrates scenarios, plans, comparisons, and recommendations.
 */

const scenarioEngine = require('./scenarioEngine');
const planner = require('./planner');
const comparisonEngine = require('./comparison');
const recommendationEngine = require('./recommendation');
const projectionModule = require('./projection');
const riskAnalyzer = require('./risk');
const proactiveSuggestions = require('./proactiveSuggestions');
const { calculateFullTax } = require('../services/universalTaxEngine');

class ScenarioIntelligenceCoordinator {
    async process(taxProfile, params = {}) {
        const baseResult = calculateFullTax(taxProfile);

        // 1. Run all core scenarios
        const scenarios = scenarioEngine.runAll(taxProfile, params);

        // 2. Proactive Scenario Analysis
        const dynamicSuggestions = proactiveSuggestions.suggest(taxProfile, baseResult);

        // 3. Enhance each scenario with plans and alerts
        const enhancedScenarios = scenarios.map(s => ({
            ...s,
            plan: planner.generatePlan(s),
            alerts: riskAnalyzer.analyze(s, taxProfile)
        }));

        // 4. Compare scenarios
        const comparison = comparisonEngine.compare(scenarios, baseResult);

        // 5. Get Agentic Recommendation
        const recommendation = recommendationEngine.recommend(scenarios, baseResult);

        // 6. Run Projections
        const projections = projectionModule.project(taxProfile);

        // 7. Consolidate Actions
        const actions = enhancedScenarios.flatMap(s => 
            s.plan.filter(p => p.step >= 3).map(p => ({
                scenario: s.name,
                action: p.description
            }))
        );

        // 8. Consolidate Alerts
        const allAlerts = enhancedScenarios.flatMap(s => s.alerts);

        return {
            scenarios: enhancedScenarios,
            comparison: comparison,
            recommendedScenario: recommendation,
            actions: actions,
            projections: projections.timeline,
            alerts: allAlerts,
            suggestions: dynamicSuggestions,
            confidence: recommendation.confidence,
            metadata: {
                totalProjectedSavings: projections.totalProjectedSavings,
                bestScenarioName: recommendation.bestScenario
            }
        };
    }
}

module.exports = new ScenarioIntelligenceCoordinator();
