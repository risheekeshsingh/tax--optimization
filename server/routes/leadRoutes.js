const express = require('express');
const { createLead, getLeads } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Optional auth — guests can also submit leads
router.post('/', (req, res, next) => {
    // Try to attach user but don't block if no token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        protect(req, res, next);
    } else {
        next();
    }
}, createLead);

// Protected — get own leads
router.get('/', protect, getLeads);

module.exports = router;
