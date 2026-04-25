const agenticCoordinator = require('../agent-core/agenticCoordinator');

/**
 * POST /api/tax/suggestions
 * Accepts income + deduction inputs, returns personalized tax-saving suggestions.
 */
const getTaxSuggestions = async (req, res) => {
    try {
        const { income, investments, insurance, nps } = req.body;

        // Validate: income is required
        if (income === undefined || income === null || isNaN(Number(income))) {
            return res.status(400).json({ message: 'income is required and must be a number.' });
        }

        const userId = req.user ? req.user._id : null;
        const agenticResponse = await agenticCoordinator.process({
            income: Number(income),
            investments: Number(investments) || 0,
            insurance: Number(insurance) || 0,
            nps: Number(nps) || 0,
        }, userId);

        res.json(agenticResponse);

    } catch (error) {
        console.error('Tax Suggestions Error:', error.message);
        res.status(500).json({ message: 'Server error while generating suggestions.' });
    }
};

module.exports = { getTaxSuggestions };
