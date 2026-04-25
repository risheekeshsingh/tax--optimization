const PDFDocument = require('pdfkit-table');

/**
 * PDF Generator - Creates a professional styled report.
 */
class PDFGenerator {
    async generate(reportData) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => {
                    console.error('[PDF doc error]', err);
                    reject(err);
                });

                // ... (existing code remains same, wrapped in try block)
                // --- HEADER ---
                doc.rect(0, 0, doc.page.width, 100).fill('#6366f1');
                doc.fillColor('#ffffff').fontSize(24).text('Financial & Tax Optimization Report', 30, 40);
                doc.fontSize(10).text(`Generated on: ${new Date(reportData.metadata.generatedAt).toLocaleDateString()}`, 30, 70);
                doc.text(`Report Version: ${reportData.metadata.version || '1.0'}`, 30, 85);

                // --- 1. EXECUTIVE SUMMARY ---
                doc.moveDown(4);
                doc.fillColor('#1e293b').fontSize(18).text('Executive Summary', { underline: true });
                doc.moveDown();
                doc.fontSize(12).fillColor('#475569');
                doc.text(`Current Tax Liability: ₹${(reportData.taxAnalysis?.taxLiability || 0).toLocaleString('en-IN')}`);
                doc.text(`Savings Potential: ₹${(reportData.taxAnalysis?.savingsPotential || 0).toLocaleString('en-IN')}`);
                doc.text(`Financial Health Score: ${reportData.financialProfile?.healthScore || 0}/100`);
                doc.text(`Optimization Score: ${reportData.optimization?.score || 0}/100 (${reportData.optimization?.category || 'N/A'})`);
                doc.text(`AI Confidence: ${reportData.confidence || 0}%`);

                // --- 2. USER INPUTS ---
                doc.moveDown(2);
                doc.fillColor('#1e293b').fontSize(16).text('1. User Input Summary');
                doc.moveDown();
                const inputTable = {
                    headers: ['Parameter', 'Value'],
                    rows: [
                        ['Annual Gross Income', `₹${(reportData.userInputs?.income || 0).toLocaleString('en-IN')}`],
                        ['80C Investments', `₹${(reportData.userInputs?.investments || 0).toLocaleString('en-IN')}`],
                        ['80D Insurance', `₹${(reportData.userInputs?.insurance || 0).toLocaleString('en-IN')}`],
                        ['NPS Contribution', `₹${(reportData.userInputs?.nps || 0).toLocaleString('en-IN')}`],
                        ['Active Regime', reportData.userInputs?.activeRegime || 'N/A']
                    ]
                };
                await doc.table(inputTable, { width: 500 });

                // --- 3. CATEGORY ANALYSIS ---
                doc.moveDown();
                doc.fontSize(16).text('2. Financial Reconstruction & Category Analysis');
                doc.moveDown();
                const categoryTable = {
                    headers: ['Category', 'Amount', 'Type'],
                    rows: (reportData.categories || []).map(c => [c.name, `₹${(c.amount || 0).toLocaleString('en-IN')}`, c.type])
                };
                await doc.table(categoryTable, { width: 500 });

                // --- 4. AI INSIGHTS ---
                doc.addPage();
                doc.fillColor('#1e293b').fontSize(16).text('3. AI Behavioral Insights');
                doc.moveDown();
                (reportData.insights || []).forEach(insight => {
                    doc.fontSize(11).fillColor('#475569').text(`• [${insight.type}] ${insight.message}`);
                    doc.moveDown(0.5);
                });

                // --- 5. STRATEGY PLAN ---
                doc.moveDown();
                doc.fillColor('#1e293b').fontSize(16).text('4. Monthly Strategy & Roadmap');
                doc.moveDown();
                (reportData.strategy?.roadmap || []).forEach(item => {
                    doc.fontSize(11).fillColor('#475569').text(`• ${item.month}: ${item.action} (${item.target})`);
                    doc.moveDown(0.5);
                });

                // --- 6. SCENARIO ANALYSIS ---
                doc.moveDown();
                doc.fillColor('#1e293b').fontSize(16).text('5. Scenario Comparison');
                doc.moveDown();
                const scenarioTable = {
                    headers: ['Scenario', 'Tax Liability', 'Delta'],
                    rows: (reportData.scenarios || []).map(s => [
                        s.name || 'Unnamed', 
                        `₹${(s.result?.finalTax || 0).toLocaleString('en-IN')}`, 
                        `₹${(s.impact || 0).toLocaleString('en-IN')}`
                    ])
                };
                await doc.table(scenarioTable, { width: 500 });

                // --- 7. FINAL RECOMMENDATIONS ---
                doc.addPage();
                doc.fillColor('#1e293b').fontSize(16).text('6. Final Actionable Recommendations');
                doc.moveDown();
                (reportData.recommendations || []).forEach(rec => {
                    doc.fillColor('#1e293b').fontSize(12).text(rec.title || 'Recommendation');
                    doc.fillColor('#475569').fontSize(10).text(rec.explanation || '');
                    doc.moveDown();
                });

                // --- FOOTER ---
                const range = doc.bufferedPageRange();
                for (let i = range.start; i < range.start + range.count; i++) {
                    doc.switchToPage(i);
                    doc.fillColor('#94a3b8').fontSize(8).text(
                        `Page ${i + 1} of ${range.count}`, 
                        0, 
                        doc.page.height - 30, 
                        { align: 'center', width: doc.page.width }
                    );
                }

                doc.end();
            } catch (error) {
                console.error('[PDF Generation Error]', error);
                reject(error);
            }
        });
    }
}

module.exports = new PDFGenerator();
