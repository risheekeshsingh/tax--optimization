const express = require('express');
const multer = require('multer');
const { calculateTax, saveTaxProfile, getTaxProfile, getTaxHistory } = require('../controllers/taxController');
const { getTaxSuggestions } = require('../controllers/taxSuggestionsController');
const { getTaxPrediction }  = require('../controllers/taxPredictionController');
const { analyzeDocument }   = require('../controllers/documentAnalysisController');
const { protect }           = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Config for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'), false);
        }
    }
});

// Tax Calculation & Profile
router.post('/calculate',   protect, calculateTax);
router.post('/profile',     protect, saveTaxProfile);
router.get('/profile',      protect, getTaxProfile);
router.get('/history',      protect, getTaxHistory);

// Insights & Predictions
router.post('/suggestions', protect, getTaxSuggestions);
router.post('/predict',     protect, getTaxPrediction);

// AI Document OCR
router.post('/analyze-document', protect, upload.single('document'), analyzeDocument);

module.exports = router;
