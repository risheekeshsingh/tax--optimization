const { generateNotifications, cleanupExpired } = require('../services/notificationService');
const Notification = require('../models/Notification');

/**
 * Trigger generation of notifications based on provided financial data
 * POST /api/notifications/generate
 */
const generateUserNotifications = async (req, res) => {
    try {
        const { income, investments, insurance, nps } = req.body;
        const userId = req.user._id;

        if (income === undefined) {
             return res.status(400).json({ success: false, error: "Income is required for tax optimization analysis" });
        }

        // 1. Run lazy cleanup for 90-day old notifications
        await cleanupExpired(userId);

        // 2. Generate/Update notifications
        const notifications = await generateNotifications(userId, { income, investments, insurance, nps });

        // 3. Return a specialized message if everything is optimized
        if (notifications.length === 0) {
            return res.status(200).json({ 
                message: "Excellent! You are fully utilizing all tax-saving opportunities.",
                notifications: [] 
            });
        }

        res.status(200).json({ success: true, count: notifications.length, notifications });

    } catch (error) {
        console.error('Notification Generation Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Fetch all active notifications for the current user
 * GET /api/notifications
 */
const getActiveNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Sort by taxSaving (high to low) as primary, then by priority
        const notifications = await Notification.find({ userId, status: 'active' })
            .sort({ taxSaving: -1 });

        res.status(200).json({ 
            success: true, 
            count: notifications.length,
            notifications 
        });

    } catch (error) {
        console.error('Fetch Notifications Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    generateUserNotifications,
    getActiveNotifications
};
