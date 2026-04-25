const reportBuilder = require('../report-engine/reportBuilder');

/**
 * POST /api/report/generate
 */
const generateReport = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const currentPayload = req.body;

        const { pdfBuffer, fileName } = await reportBuilder.build(userId, currentPayload);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ 
            message: "Failed to generate report", 
            error: error.message
        });
    }
};

module.exports = { generateReport };
