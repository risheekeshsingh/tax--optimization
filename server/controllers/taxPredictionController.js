const agenticCoordinator = require('../agent-core/agenticCoordinator');

/**
 * POST /api/tax/predict
 * Returns current tax vs. fully-optimized tax scenario with savings insight.
 */
const getTaxPrediction = async (req, res) => {
    try {
        const payload = req.body;
        const userId = req.user ? req.user._id : null;
        
        const agenticResponse = await agenticCoordinator.process(payload, userId);

        // Add legacy prediction fields for backward compatibility
        const currentTax = agenticResponse.taxLiability;
        const optimizedSimulation = agenticResponse.simulations.find(s => s.scenario === "Full Deduction Utilization");
        const predictedTax = optimizedSimulation ? optimizedSimulation.result.finalTax : currentTax;
        const potentialSavings = Math.max(0, currentTax - predictedTax);

        res.json({
            ...agenticResponse,
            currentTax,
            predictedTax,
            potentialSavings,
            insight: agenticResponse.alerts[0]?.message || "Calculation complete.",
            breakdown: {
                current: agenticResponse.taxResult,
                optimized: optimizedSimulation?.result || agenticResponse.taxResult
            }
        });

    } catch (error) {
        console.error('Tax Prediction Error:', error.message);
        res.status(500).json({ message: 'Server error while generating tax prediction.' });
    }
};

module.exports = { getTaxPrediction };
