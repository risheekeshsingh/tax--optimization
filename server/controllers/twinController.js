const { analyzeTwin } = require('../services/twinService');
const TaxProfile = require('../models/TaxProfile');

/**
 * Controller to handle twin analysis request with provided data.
 */
const analyzeTwinData = async (req, res) => {
    try {
        const analysis = await analyzeTwin(req.body);
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Twin Analysis Error:', error);
        res.status(500).json({ message: 'Error analyzing twin data', error: error.message });
    }
};

/**
 * Controller to get latest twin insights based on PERSISTED user profile.
 * This ensures the AI Tax Twin feels real and effective.
 */
const getTwinInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        let profile = await TaxProfile.findOne({ user: userId });
        
        // If no profile exists, return a structured message instead of failing
        if (!profile) {
            return res.status(200).json({ 
                isNewUser: true,
                aiSummary: "I'm ready to build your Tax Twin! Upload your documents or enter your salary in the simulator to get started.",
                userType: "Unknown",
                insights: ["Please provide your financial data to unlock AI insights."],
                warnings: [],
                opportunities: [],
                events: []
            });
        }

        // Add monthly contextual data for behavior analysis
        const analysisData = {
            ...profile.toObject(),
            monthlyIncome: profile.income / 12,
            month: new Date().getMonth() + 1
        };

        const analysis = await analyzeTwin(analysisData);
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Get Twin Insights Error:', error);
        res.status(500).json({ message: 'Error fetching twin insights' });
    }
};

module.exports = {
    analyzeTwinData,
    getTwinInsights
};
