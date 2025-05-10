// PAPERBUDDY FINAL/netlify/functions/ocr.js

const path = require('path');
// Conditionally load .env for local development with `netlify dev`
// In deployed Netlify, environment variables are set in the Netlify UI
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
}

// Assuming ocrService.js is in Backend/services/ relative to project root
// __dirname for a function is /var/task/netlify/functions/ during build/runtime on Netlify,
// or netlify/functions/ locally.
// We need to go up two levels to reach project root, then into Backend/services.
const ocrServiceLogic = require(path.join(__dirname, '..', '..', 'Backend', 'services', 'ocrService.js'));

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        // Expecting frontend to send JSON: { fileContent: base64String, mimetype: string, filename: string }
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Request body is missing.' }) };
        }

        const requestBody = JSON.parse(event.body);
        if (!requestBody.fileContent || !requestBody.mimetype || !requestBody.filename) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing fileContent, mimetype, or filename in request body.' })
            };
        }

        const fileBuffer = Buffer.from(requestBody.fileContent, 'base64');
        console.log(`[OCR_FUNCTION] Received file ${requestBody.filename} (${requestBody.mimetype}), size: ${fileBuffer.length} bytes.`);

        const ocrText = await ocrServiceLogic.getTextFromImageOrPdf(fileBuffer, requestBody.mimetype, requestBody.filename);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: ocrText }),
        };
    } catch (error) {
        console.error('[OCR_FUNCTION_ERROR]', error);
        return {
            statusCode: error.status || 500, // Use error status if available
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: error.message || 'OCR processing failed in function.' }),
        };
    }
};