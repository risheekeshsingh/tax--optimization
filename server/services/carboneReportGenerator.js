const carbone = require('carbone');
const path = require('path');
const fs = require('fs');
const dataAggregator = require('../report-engine/dataAggregator');

/**
 * Carbone Report Generator Service
 */
class CarboneReportGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, '../templates/tax_report_template.html');
    }

    async generate(userId, currentPayload) {
        // 1. Aggregate Base Data
        const baseData = await dataAggregator.aggregate(userId, currentPayload);
        
        // 2. Format Data for Template
        const reportData = {
            name: userId ? 'Valued User' : 'Guest User',
            date: new Date().toLocaleDateString('en-IN'),
            income: baseData.userInputs.income.toLocaleString('en-IN'),
            deductions: (baseData.userInputs.investments + baseData.userInputs.insurance + baseData.userInputs.nps).toLocaleString('en-IN'),
            taxableIncome: baseData.taxAnalysis.taxableIncome.toLocaleString('en-IN'),
            taxLiability: baseData.taxAnalysis.taxLiability.toLocaleString('en-IN'),
            optimization: baseData.optimization,
            insights: baseData.insights,
            recommendations: baseData.recommendations,
            regimeComparison: {
                recommended: baseData.taxAnalysis.regime,
                savings: baseData.taxAnalysis.savingsPotential.toLocaleString('en-IN')
            }
        };

        // 4. Render with Carbone
        return new Promise((resolve, reject) => {
            carbone.render(this.templatePath, reportData, (err, result) => {
                if (err) {
                    console.error('[Carbone Error]', err);
                    return reject(err);
                }
                
                // Result is a Buffer of the generated file
                resolve({
                    buffer: result,
                    filename: `Tax_Report_${baseData.optimization.category}_${Date.now()}.html`
                });
            });
        });
    }
}

module.exports = new CarboneReportGenerator();
