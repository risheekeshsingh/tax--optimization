const dataAggregator = require('./dataAggregator');
const pdfGenerator = require('./pdfGenerator');

/**
 * Report Builder - The main entry point for the report generation engine.
 */
class ReportBuilder {
    async build(userId, currentPayload = null) {
        try {
            // 1. Aggregate all data
            const reportData = await dataAggregator.aggregate(userId, currentPayload);

            // 2. Generate PDF
            const pdfBuffer = await pdfGenerator.generate(reportData);

            return {
                pdfBuffer,
                fileName: `Tax_Optimization_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                reportData // Also return JSON for backup/preview if needed
            };
        } catch (error) {
            console.error('[ReportBuilder Error]', error);
            throw error;
        }
    }
}

module.exports = new ReportBuilder();
