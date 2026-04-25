// ─────────────────────────────────────────────
// Tax Suggestion Service — Indian Tax Laws
// ─────────────────────────────────────────────
const { getTaxLimit, getInvestmentOptions } = require('../config/configLoader');

// ──── Helpers ────────────────────────────────

/**
 * Determine applicable tax rate based on income slab.
 */
function calculateTaxRate(income) {
    return income >= 1000000 ? 0.30 : 0.20;
}

/**
 * Determine suggestion priority based on unused deduction size.
 */
function calculatePriority(unusedAmount) {
    if (unusedAmount > 50000) return 'high';
    if (unusedAmount > 15000) return 'medium';
    return 'low';
}

/**
 * Format a rupee amount as a readable string.
 */
function formatRupees(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Build a single structured suggestion object.
 */
function generateSuggestion({ type, title, message, amountToInvest, taxSaving, priority, metadata = {} }) {
    return {
        type,
        title,
        message,
        amountToInvest,
        taxSaving,
        priority,
        metadata // New: include risk, lockIn, etc.
    };
}

// ──── Suggestion Generators ───────────────────

/**
 * Generate a suggestion for a specific tax section.
 */
function getSectionSuggestion(section, currentAmount, taxRate) {
    const limit = getTaxLimit(section);
    const used = Math.min(currentAmount, limit);
    const unused = limit - used;

    if (unused <= 0) return null;

    const taxSaving = Math.round(unused * taxRate);
    const priority = calculatePriority(unused);
    const options = getInvestmentOptions(section);
    const primaryOption = options[0];

    let title, message;

    if (section === '80C') {
        title = 'Maximize your 80C deductions';
        message = `Invest ${formatRupees(unused)} more to save ${formatRupees(taxSaving)} in taxes. Recommended: ${primaryOption.name}.`;
    } else if (section === '80D') {
        title = currentAmount === 0 ? 'Get Health Insurance & Save Tax' : 'Increase your Health Insurance coverage';
        message = currentAmount === 0
            ? `Connect with ${primaryOption.name} and save ${formatRupees(taxSaving)} in taxes while protecting your family.`
            : `You can claim ${formatRupees(unused)} more under 80D. Top up your insurance to save more.`;
    } else if (section === 'NPS') {
        title = 'Unlock extra ₹50,000 deduction via NPS';
        message = `Invest ${formatRupees(unused)} in ${primaryOption.name}. This is an exclusive deduction OVER your 80C limit.`;
    }

    return generateSuggestion({
        type: section,
        title,
        message,
        amountToInvest: unused,
        taxSaving,
        priority,
        metadata: {
            recommendedInvestment: primaryOption.name,
            risk: primaryOption.risk,
            lockIn: primaryOption.lockIn,
            returns: primaryOption.returns
        }
    });
}

// ──── Priority Sorter ─────────────────────────

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

function sortSuggestions(suggestions) {
    return suggestions.sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.taxSaving - a.taxSaving;
    });
}

// ──── Main Entry Point ────────────────────────

function generateTaxSuggestions({ income = 0, investments = 0, insurance = 0, nps = 0 }) {
    const taxRate = calculateTaxRate(income);

    const raw = [
        getSectionSuggestion('80C', investments, taxRate),
        getSectionSuggestion('80D', insurance, taxRate),
        getSectionSuggestion('NPS', nps, taxRate),
    ].filter(Boolean);

    if (raw.length === 0) {
        return {
            message: 'You have already optimized your tax savings efficiently. Excellent financial discipline!',
        };
    }

    const suggestions = sortSuggestions(raw);
    return { suggestions };
}

module.exports = { generateTaxSuggestions };
