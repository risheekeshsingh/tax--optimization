const express = require('express');
const { analyzeTwinData, getTwinInsights } = require('../controllers/twinController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/twin/analyze
 * @desc    Analyze user profile and generate insights
 * @access  Private
 */
router.post('/analyze', protect, analyzeTwinData);

/**
 * @route   GET /api/twin/insights
 * @desc    Return latest Twin insights
 * @access  Private
 */
router.get('/insights', protect, getTwinInsights);

module.exports = router;
