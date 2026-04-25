const express = require('express');
const router = express.Router();
const { generateCarboneReport } = require('../controllers/carboneController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, generateCarboneReport);

module.exports = router;
