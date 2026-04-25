const Groq = require("groq-sdk");
const pdf = require("pdf-parse");
const { isPasswordProtected } = require("../password-handler/passwordHandler");


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Extracts content from PDF or prepares Image for Groq Vision
 */
const extractTextFromFile = async (buffer, mimetype) => {
  try {
    if (mimetype === "application/pdf") {
      console.log("Processing PDF...");
      
      // Check for password protection
      const protected = await isPasswordProtected(buffer);
      if (protected) {
        throw new Error("PASSWORD_REQUIRED");
      }

      const data = await pdf(buffer);

      if (!data.text || data.text.trim().length === 0) {
        console.log("PDF is empty or scanned, falling back to vision.");
        return {
          visionData: {
            data: buffer.toString("base64"),
            mimeType: "image/jpeg",
            isActualImage: false // This is a PDF-to-Image fallback
          },
        };
      }
      return data.text;
    }

    if (mimetype.startsWith("image/")) {
      return {
        visionData: {
          data: buffer.toString("base64"),
          mimeType: mimetype,
          isActualImage: true
        },
      };
    }

    throw new Error("Unsupported file type. Please upload a PDF or an Image.");
  } catch (error) {
    console.error("Extraction Error:", error.message);
    throw new Error(`Failed to extract document content: ${error.message}`);
  }
};

/**
 * Analyzes document content using Groq AI — EXTRACTION ONLY.
 * All tax calculations are handled by universalTaxEngine.js
 */
const analyzeDocumentContent = async (content) => {
  if (!content) {
    throw new Error("No readable content found. Please ensure the document is clear and not password-protected.");
  }

  const systemPrompt = `SYSTEM: You are the "Your Money" Universal Tax Document Parser. 
Extract relevant financial data from ANY tax-related document (Form 16, Salary Slips, Rent Receipts, 80C Investment Proofs, Insurance Premiums, etc.).

MANDATORY JSON SCHEMA:
{
  "documentType": "String (e.g. Form 16, Rent Receipt, Salary Slip)",
  "employerName": "String",
  "employeePAN": "String",
  "financialYear": "String",
  "basic": 0,
  "hra": 0,
  "da": 0,
  "grossSalary": 0,
  "specialAllowance": 0,
  "lta": 0,
  "employeePF": 0,
  "professionalTax": 0,
  "tds": 0,
  "cityCategory": "Metro or Non-Metro",
  "monthlyRentPaid": 0,
  "investments80C": 0,
  "healthInsurance80D": 0,
  "nps80CCD": 0,
  "homeLoanInterest": 0,
  "confidenceScore": 0.0-1.0
}

GUIDELINES:
1. For Rent Receipts: Populate 'monthlyRentPaid' and 'documentType'.
2. For Form 16: Extract components from the Part B summary.
3. For Investment Proofs (LIC, PPF, ELSS): Populate 'investments80C' and 'documentType'.
4. If a field is missing, return 0. Never hallucinate.
5. Return ONLY valid JSON. No markdown backticks.`;

  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn("⚠️ No valid Groq API Key found in .env");
      throw new Error("Tax Engine AI is currently offline. Please enter values manually.");
    }

    // Special check for scanned PDFs (content might be the fallback object from extractTextFromFile)
    if (content.visionData && content.visionData.mimeType === "image/jpeg" && !content.visionData.isActualImage) {
        // This was a PDF fallback. Groq Vision cannot read PDF buffers directly.
        throw new Error("This PDF appears to be a scanned image. Please upload a clear photo (JPG/PNG) of the document for AI analysis, or enter details manually.");
    }

    let messages = [];
    let model = "llama-3.3-70b-versatile";
    let isVision = false;

    if (typeof content === "string") {
      model = "llama-3.3-70b-versatile";
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Extract all salary components from this document text. Return ONLY the JSON object.\n\n${content}` }
      ];
    } else if (content.visionData) {
      model = "llama-3.2-90b-vision-preview";
      isVision = true;
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all salary components from this document image. Return ONLY the JSON object matching the schema. No other text." },
            {
              type: "image_url",
              image_url: {
                url: `data:${content.visionData.mimeType};base64,${content.visionData.data}`,
              },
            },
          ],
        }
      ];
    }

    const requestBody = {
      messages,
      model,
      temperature: 0.1,
    };

    if (!isVision) {
       requestBody.response_format = { type: "json_object" };
    }

    const completion = await groq.chat.completions.create(requestBody);
    let text = completion.choices[0]?.message?.content;
    
    try {
      // Robust JSON cleaning
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          text = jsonMatch[0];
      }
      return JSON.parse(text);
    } catch (parseError) {
      console.error("AI Response Parsing Error. Raw output:", text);
      throw new Error("The AI failed to format the extracted data correctly. Please try a clearer document or manual entry.");
    }
  } catch (error) {
    console.error("CRITICAL AI Error:", error.message);
    throw error; // Re-throw to be caught by controller
  }
};

module.exports = {
  extractTextFromFile,
  analyzeDocumentContent,
};
