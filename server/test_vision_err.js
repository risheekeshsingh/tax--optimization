require('dotenv').config();
const { analyzeDocumentContent } = require('./services/documentAnalysisService');
async function test() {
  try {
    const res = await analyzeDocumentContent({ visionData: { data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', mimeType: 'image/png' }});
    console.log("Success!");
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
