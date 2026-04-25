const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/marketplace/recommendations
// Auth protected — requires valid JWT token
router.post('/recommendations', protect, getRecommendations);

module.exports = router;
