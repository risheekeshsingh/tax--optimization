const { parseBankStatement } = require("../bank-parser/bankParser");

/**
 * Intelligent orchestrator for document analysis.
 * Decides whether it's a bank statement, salary slip, or form 16.
 */
const intelligentAnalysis = async (extractedText, currentData = {}) => {
    // Basic heuristic to detect bank statements
    const textToTest = typeof extractedText === 'string' ? extractedText : '';
    const isBankStatement = /transaction|balance|statement|debit|credit|account number|customer|narration|value date/i.test(textToTest);

    if (isBankStatement) {
        const bankData = await parseBankStatement(extractedText);
        return {
            type: 'BANK_STATEMENT',
            ...bankData
        };
    }

    // Default to existing salary/tax extraction (handled by service)
    return null; 
};

module.exports = {
    intelligentAnalysis
};
