const express = require('express');
const { generateUserNotifications, getActiveNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All notification routes are protected
router.use(protect);

/**
 * @desc    Generate or update tax optimization notifications
 * @route   POST /api/notifications/generate
 */
router.post('/generate', generateUserNotifications);

/**
 * @desc    Get all active notifications sorted by impact
 * @route   GET /api/notifications
 */
router.get('/', getActiveNotifications);

module.exports = router;
