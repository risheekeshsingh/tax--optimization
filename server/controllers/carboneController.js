const reportGenerator = require('../services/carboneReportGenerator');

/**
 * POST /api/generate-report
 */
const generateCarboneReport = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const currentPayload = req.body;

        const { buffer, filename } = await reportGenerator.generate(userId, currentPayload);

        res.set({
            'Content-Type': 'text/html', // Fallback to HTML since LibreOffice is missing for PDF
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length
        });

        res.send(buffer);

    } catch (error) {
        console.error('Carbone Report Error:', error);
        res.status(500).json({ 
            message: "Failed to generate Carbone report", 
            error: error.message 
        });
    }
};

module.exports = { generateCarboneReport };
