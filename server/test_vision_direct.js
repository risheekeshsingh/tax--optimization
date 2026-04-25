require('dotenv').config();
const { analyzeDocumentContent } = require('./services/documentAnalysisService');
const fs = require('fs');
async function test() {
  try {
    const data = fs.readFileSync('C:\\Users\\aayus\\OneDrive\\Desktop\\TAX FILLING AI\\client\\public\\vite.svg');
    const res = await analyzeDocumentContent({ visionData: { data: data.toString('base64'), mimeType: 'image/svg+xml' }});
    console.log("Success!", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
