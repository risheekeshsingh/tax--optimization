const { extractTextFromFile, analyzeDocumentContent } = require("../services/documentAnalysisService");
const { calculateFullTax } = require("../services/universalTaxEngine");
const { generateDocReport } = require("../services/docReportGenerator");
const { intelligentAnalysis } = require("../document-analyzer/documentAnalyzer");
const { decryptPDF } = require("../password-handler/passwordHandler");


/**
 * Handles Tax Document Analysis request
 * POST /api/tax/analyze-document
 */
const analyzeDocument = async (req, res) => {
  try {
    // 1. Validate file presence
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No document uploaded" });
    }

    const { buffer, mimetype, size } = req.file;

    // 2. Validate mimetype
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: "Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP." 
      });
    }

    // 3. Validate file size (max 10MB)
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "File too large (Max 10MB)" });
    }

    // 4. Extract content from file
    let extractedContent;
    try {
      if (req.body.password) {
        const decrypted = await decryptPDF(buffer, req.body.password);
        if (!decrypted.success) {
          return res.status(401).json({ success: false, error: "INCORRECT_PASSWORD", message: decrypted.error });
        }
        extractedContent = decrypted.text;
      } else {
        extractedContent = await extractTextFromFile(buffer, mimetype);
      }
    } catch (extractError) {
      console.error("Extraction Failed:", extractError.message);
      if (extractError.message === "PASSWORD_REQUIRED") {
        return res.status(401).json({ success: false, error: "PASSWORD_REQUIRED", message: "This file is password protected." });
      }
      return res.status(400).json({ success: false, error: extractError.message });
    }

    // 5. Intelligent Orchestration (Bank Statement vs Salary Slip)
    const intelligentResult = await intelligentAnalysis(extractedContent);
    
    if (intelligentResult && intelligentResult.type === 'BANK_STATEMENT') {
        return res.status(200).json({
            success: true,
            extractedData: intelligentResult.extractedData,
            insights: intelligentResult.insights,
            recommendations: intelligentResult.recommendations,
            alerts: intelligentResult.alerts,
            isBankStatement: true
        });
    }

    // 6. AI Extraction — pull out salary components
    const extraction = await analyzeDocumentContent(extractedContent);

    // 7. Tax Optimization Engine — compute full report from extracted data
    let report = null;
    try {
      const calculation = calculateFullTax({
        income: extraction.grossSalary,
        investments: (extraction.investments80C || 0) + (extraction.employeePF || 0),
        insurance: extraction.healthInsurance80D,
        nps: extraction.nps80CCD,
        hraReceived: extraction.hra, 
        hra: 0,
        basic: extraction.basic,
        da: extraction.da,
        monthlyRent: extraction.monthlyRentPaid,
        profTax: extraction.professionalTax,
        homeLoan: extraction.homeLoanInterest,
        cityCategory: extraction.cityCategory
      });

      report = generateDocReport(extraction, calculation);
    } catch (engineError) {
      console.error("Tax Engine Error:", engineError.message);
    }

    // Return combined response
    res.status(200).json({ 
        success: true,
        extraction: extraction, 
        report: report,
        insights: [], 
        recommendations: [], 
        alerts: [] 
    });


  } catch (error) {
    console.error("Document Analysis Controller Error:", error.message);
    res.status(500).json({ success: false, error: error.message, message: error.message });
  }
};

module.exports = {
  analyzeDocument,
};
