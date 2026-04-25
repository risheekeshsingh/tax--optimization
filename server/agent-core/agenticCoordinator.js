/**
 * Agentic AI Coordinator
 * The primary interface for the autonomous tax advisor system.
 */

const goalManager = require('./goalManager');
const planningEngine = require('../planner/planningEngine');
const actionEngine = require('../actions/actionEngine');
const memorySystem = require('../memory/memorySystem');
const monitorEngine = require('../monitor/monitorEngine');
const simulationModule = require('../simulation/simulationModule');
const agentOrchestrator = require('./agentOrchestrator');
const decisionEngine = require('./decisionEngine');
const behavioralIntelligence = require('./behavioralIntelligence');
const optimizationDetector = require('../monitor/optimizationDetector');
const { calculateFullTax } = require('../services/universalTaxEngine');
const { calculateHealthScore } = require('../services/financialHealth/healthScorer');

class AgenticCoordinator {
    async process(taxProfile, userId = null) {
        // 1. Initial Tax Calculation
        const taxResult = calculateFullTax(taxProfile);
        const healthScore = calculateHealthScore(taxProfile, taxResult);

        // 2. Behavioral Insights & Patterns
        const behavioralInsights = await behavioralIntelligence.analyze(userId, taxProfile, taxResult);

        // 3. Optimization & Error Detection
        const optimizationErrors = optimizationDetector.detect(taxProfile, taxResult);

        // 4. Memory Integration & Self-Improvement
        let adaptiveConfidence = 0;
        let memoryInsight = null;
        if (userId) {
            memorySystem.updateSession(userId, { taxProfile, lastResult: taxResult });
            const longTerm = await memorySystem.getLongTermMemory(userId);
            
            if (longTerm && longTerm.ignoredPatterns.section80C) {
                memoryInsight = "User consistently under-utilizes 80C. Escalating priority.";
                adaptiveConfidence = -5;
            }
        }

        // 5. Goal & Planning
        const goal = goalManager.getGoal(taxProfile);
        const plan = planningEngine.generatePlan(goal, taxProfile, taxResult);

        // 6. Action Generation (AI Decision Engine)
        const rawActions = actionEngine.generateActions(taxProfile, taxResult);
        const actions = rawActions.map(action => {
            const explanation = decisionEngine.explain(action, taxProfile, taxResult);
            return {
                ...action,
                explanation: explanation.reason,
                logic: explanation.logic,
                confidence: explanation.confidence
            };
        });

        // 7. Multi-Agent Insights (Rule-based + LLM hybrid)
        const agentInsights = await agentOrchestrator.coordinate(taxProfile, taxResult);
        
        // Combine all insights
        const combinedInsights = [
            ...behavioralInsights,
            ...agentInsights.map(i => ({ ...i, type: 'AGENT_INSIGHT' }))
        ];

        // 8. Simulations
        const scenarioIntelligence = await simulationModule.runWhatIf(taxProfile, taxProfile.scenarioParams);

        // 9. Overall Confidence
        const baseConfidence = actions.length > 0 ? actions.reduce((acc, curr) => acc + curr.confidence, 0) / actions.length : 95;

        // Structured JSON Response
        return {
            // Core Identification
            success: true,
            score: healthScore,
            
            // Intelligence Features
            recommendations: actions,
            insights: combinedInsights,
            errors: optimizationErrors,
            simulations: scenarioIntelligence.scenarios,
            comparison: scenarioIntelligence.comparison,
            recommendedScenario: scenarioIntelligence.recommendedScenario,
            scenarioActions: scenarioIntelligence.actions,
            projections: scenarioIntelligence.projections,
            scenarioAlerts: scenarioIntelligence.alerts,
            
            // Legacy/Display fields for UI compatibility
            taxableIncome: taxResult.taxableIncome,
            taxLiability: taxResult.finalTax,
            savingsPotential: taxResult.savingsPotential,
            taxScore: healthScore,
            timeline: planningEngine.generateRoadmap(taxProfile, taxResult),
            alerts: [...optimizationErrors, ...scenarioIntelligence.alerts],
            
            // Metadata
            confidence: Math.round(baseConfidence + adaptiveConfidence),
            metadata: {
                timestamp: new Date().toISOString(),
                version: "Intelligent-Advisor-v2.0",
                selfImprovement: memoryInsight || "Continuous learning active"
            }
        };
    }
}

module.exports = new AgenticCoordinator();
