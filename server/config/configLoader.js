const fs = require('fs');
const path = require('path');

let taxRules = {};
let investmentOptions = [];

/**
 * Load configuration files from disk
 */
const loadConfigs = () => {
    try {
        const rulesPath = path.join(__dirname, 'taxRules.json');
        const optionsPath = path.join(__dirname, 'investmentOptions.json');

        if (fs.existsSync(rulesPath)) {
            const rawRules = fs.readFileSync(rulesPath, 'utf8');
            taxRules = JSON.parse(rawRules);
        }

        if (fs.existsSync(optionsPath)) {
            const rawOptions = fs.readFileSync(optionsPath, 'utf8');
            investmentOptions = JSON.parse(rawOptions);
        }

        console.log('✅ Tax configurations loaded successfully.');
    } catch (error) {
        console.error('❌ Error loading tax configurations:', error.message);
    }
};

// Initial load
loadConfigs();

/**
 * Get the limit for a specific tax section
 */
const getTaxLimit = (section) => {
    return taxRules[section]?.limit || 0;
};

/**
 * Get all available rules
 */
const getAllTaxRules = () => taxRules;

/**
 * Get investment options filtered by category (e.g., 80C)
 */
const getInvestmentOptions = (category) => {
    if (!category) return investmentOptions;
    return investmentOptions.filter(opt => opt.category === category);
};

module.exports = {
    getTaxLimit,
    getAllTaxRules,
    getInvestmentOptions,
    loadConfigs 
};
