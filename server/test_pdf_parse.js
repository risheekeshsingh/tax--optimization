const pdf = require('pdf-parse');
async function testPdf() {
    try {
        const buffer = Buffer.from("%PDF-1.1\n%¥±ë\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 21 >>\nstream\nBT /F1 12 Tf 1 0 0 1 100 200 Tm (Hello World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000015 00000 n\n0000000062 00000 n\n0000000117 00000 n\n0000000174 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n245\n%%EOF");
        const data = await pdf(buffer);
        console.log("Extracted text successfully:", data.text);
    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}
testPdf();
