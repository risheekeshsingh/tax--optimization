const agenticCoordinator = require('../agent-core/agenticCoordinator');
const TaxProfile = require('../models/TaxProfile');
const History = require('../models/History');

/**
 * POST /api/tax/calculate
 * Fully Agentic Autonomous Tax Advisor Engine.
 */
const calculateTaxController = async (req, res) => {
    try {
        const payload = {
            income: req.body.income || 0,
            investments: req.body.investments || 0,
            insurance: req.body.insurance || 0,
            nps: req.body.nps || 0,
            hra: req.body.hra || 0,
            homeLoan: req.body.homeLoan || 0,
            isSenior: req.body.isSenior || false,
            profTax: req.body.profTax || 0,
            basic: req.body.basic || 0,
            da: req.body.da || 0,
            monthlyRent: req.body.monthlyRent || 0,
            cityCategory: req.body.cityCategory || "metro",
            activeRegime: req.body.activeRegime || 'NEW',
            tds: req.body.tds || 0,
            scenarioParams: req.body.scenarioParams || {}
        };

        const userId = req.user ? req.user._id : null;
        const agenticResponse = await agenticCoordinator.process(payload, userId);

        res.json(agenticResponse);

    } catch (error) {
        console.error('Agentic Engine Error:', error.message);
        res.status(500).json({ message: "Agentic Engine Error", error: error.message });
    }
};

/**
 * POST /api/tax/profile
 * Save or update persistent tax profile for the user and capture history.
 */
const saveTaxProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        let profile = await TaxProfile.findOne({ user: userId });
        
        // Determine action description
        let desc = "Initial Profile Created";
        if (profile) {
            const changes = [];
            if (data.income !== profile.income) changes.push(`Income: ${data.income}`);
            if (data.investments !== profile.investments) changes.push(`80C: ${data.investments}`);
            if (data.nps !== profile.nps) changes.push(`NPS: ${data.nps}`);
            desc = changes.length > 0 ? `Updated: ${changes.join(', ')}` : "Profile Synced";
            
            profile = await TaxProfile.findOneAndUpdate(
                { user: userId },
                { $set: data },
                { new: true }
            );
        } else {
            profile = await TaxProfile.create({
                user: userId,
                ...data
            });
        }

        // CREATE HISTORY SNAPSHOT
        await History.create({
            user: userId,
            snapshot: {
                income: profile.income,
                investments: profile.investments,
                insurance: profile.insurance,
                nps: profile.nps,
                hra: profile.hra,
                homeLoan: profile.homeLoan,
                activeRegime: profile.activeRegime,
                cityCategory: profile.cityCategory,
                isSenior: profile.isSenior
            },
            description: desc
        });

        res.status(200).json(profile);
    } catch (error) {
        console.error('Save Profile Error:', error.message);
        res.status(500).json({ message: "Error saving tax profile" });
    }
};

/**
 * GET /api/tax/profile
 * Retrieve the persistent tax profile.
 */
const getTaxProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const profile = await TaxProfile.findOne({ user: userId });
        
        if (!profile) {
            return res.status(404).json({ message: "No tax profile found" });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};

/**
 * GET /api/tax/history
 * Retrieve the chronological history log.
 */
const getTaxHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await History.find({ user: userId }).sort({ timestamp: -1 }).limit(20);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history" });
    }
};

module.exports = { 
    calculateTax: calculateTaxController,
    saveTaxProfile,
    getTaxProfile,
    getTaxHistory
};
