/**
 * Future Projection Module
 * Simulates tax impact over 1-3 years.
 */
const { calculateFullTax } = require('../services/universalTaxEngine');

class ProjectionModule {
    project(taxProfile, years = 3) {
        const projections = [];
        let currentProfile = { ...taxProfile };
        let totalSaved = 0;

        for (let i = 1; i <= years; i++) {
            // Assume 10% annual increment
            currentProfile.income = (Number(currentProfile.income) || 0) * 1.1;
            const result = calculateFullTax(currentProfile);
            
            projections.push({
                year: `Year ${i}`,
                projectedIncome: currentProfile.income,
                projectedTax: result.finalTax,
                savingsPotential: result.savingsPotential
            });
            
            totalSaved += result.savingsPotential;
        }

        return {
            timeline: projections,
            totalProjectedSavings: totalSaved,
            trend: projections.map(p => p.projectedTax)
        };
    }
}

module.exports = new ProjectionModule();
