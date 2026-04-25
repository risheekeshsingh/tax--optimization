const Lead = require('../models/Lead');

/**
 * @desc  Save a new investment/quote lead
 * @route POST /api/leads
 */
const createLead = async (req, res) => {
    try {
        const { name, email, mobile, product, provider, category, amount, frequency, partnerUrl } = req.body;

        if (!name || !email || !mobile || !product || !category) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        const lead = await Lead.create({
            userId: req.user?._id || null,
            name, email, mobile, product, provider,
            category, amount, frequency, partnerUrl
        });

        return res.status(201).json({
            success: true,
            message: 'Your interest has been registered. Our partner will contact you within 2 hours.',
            leadId: lead._id,
            partnerUrl
        });
    } catch (err) {
        console.error('Lead creation error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

/**
 * @desc  Get all leads for admin / logged-in user
 * @route GET /api/leads
 */
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { createLead, getLeads };
