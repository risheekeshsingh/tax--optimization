const { generateTaxSuggestions } = require('./services/taxSuggestionService');

async function test() {
    console.log('--- Testing Config-Driven Suggestions ---');
    const result = generateTaxSuggestions({
        income: 1200000,
        investments: 50000,
        insurance: 0,
        nps: 0
    });

    console.log(JSON.stringify(result, null, 2));
}

test();
