const agenticCoordinator = require('../agent-core/agenticCoordinator');
const TaxProfile = require('../models/TaxProfile');
const History = require('../models/History');
const { calculateOptimizationScore } = require('../services/scoringService');

/**
 * Data Aggregator - Compiles data from all engines for the report.
 */
class DataAggregator {
    async aggregate(userId, currentPayload = null) {
        // 1. Get Base Tax Profile (from DB or current request)
        let profileData = (currentPayload && Object.keys(currentPayload).length > 0) ? currentPayload : null;
        if (userId && !profileData) {
            profileData = await TaxProfile.findOne({ user: userId });
        }

        if (!profileData) {
            throw new Error("No tax profile found for report generation");
        }

        // 2. Run through Agentic Coordinator to get full intelligence
        const agenticResponse = await agenticCoordinator.process(profileData, userId);

        // 3. Calculate Optimization Score
        const optimization = calculateOptimizationScore(profileData, agenticResponse, agenticResponse);

        // 4. Additional History for Context
        let history = [];
        if (userId) {
            history = await History.find({ user: userId }).sort({ timestamp: -1 }).limit(5);
        }

        // 5. Normalize into final Report Object
        return {
            userInputs: {
                income: profileData.income || 0,
                investments: profileData.investments || 0,
                insurance: profileData.insurance || 0,
                nps: profileData.nps || 0,
                hra: profileData.hra || 0,
                homeLoan: profileData.homeLoan || 0,
                isSenior: profileData.isSenior || false,
                activeRegime: profileData.activeRegime || 'NEW'
            },
            optimization: optimization,
            financialProfile: {
                healthScore: agenticResponse.score,
                savingsPotential: agenticResponse.savingsPotential,
                confidence: agenticResponse.confidence
            },
            categories: [
                { name: 'Income', amount: profileData.income || 0, type: 'INFLOW' },
                { name: '80C Investments', amount: profileData.investments || 0, type: 'INVESTMENT' },
                { name: 'Health Insurance', amount: profileData.insurance || 0, type: 'INSURANCE' },
                { name: 'NPS Contribution', amount: profileData.nps || 0, type: 'INVESTMENT' },
                { name: 'Housing Deduction', amount: profileData.homeLoan || 0, type: 'FIXED' }
            ],
            taxAnalysis: {
                taxableIncome: agenticResponse.taxableIncome,
                taxLiability: agenticResponse.taxLiability,
                savingsPotential: agenticResponse.savingsPotential,
                regime: profileData.activeRegime
            },
            insights: agenticResponse.insights,
            strategy: {
                roadmap: agenticResponse.timeline,
                actions: agenticResponse.recommendations
            },
            scenarios: agenticResponse.simulations,
            recommendations: agenticResponse.recommendations,
            confidence: agenticResponse.confidence,
            metadata: {
                generatedAt: new Date().toISOString(),
                version: agenticResponse.metadata.version
            }
        };
    }
}

module.exports = new DataAggregator();
