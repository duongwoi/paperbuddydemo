// PAPERBUDDY FINAL/Backend/services/ocrService.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }); // Load .env from project root

// Use node-fetch v2 for CommonJS if not using Node 18+ built-in fetch
// const fetch = require('node-fetch');
// If using Node 18+ with ESM or built-in fetch, you might not need this import.
// For simplicity with CommonJS, node-fetch@2 is often easier.
let fetch;
if (typeof global.fetch !== 'function') {
    fetch = require('node-fetch');
} else {
    fetch = global.fetch;
}

const FormDataNode = require('form-data'); // Renamed to avoid conflict if browser FormData is somehow in scope

const COMPDFKIT_API_KEY = process.env.COMPDFKIT_API_KEY;
const COMPDFKIT_OCR_ENDPOINT_URL = process.env.COMPDFKIT_OCR_ENDPOINT_URL;

async function getTextFromImageOrPdf(fileBuffer, mimetype, originalFilename = 'file') {
    if (!COMPDFKIT_API_KEY || COMPDFKIT_API_KEY === 'YOUR_COMPDFKIT_API_KEY_PLACEHOLDER' || !COMPDFKIT_OCR_ENDPOINT_URL) {
        console.error('[OCR_SERVICE] Compdfkit API key or endpoint URL is not configured correctly in .env');
        throw new Error('OCR service is not configured or API key is a placeholder.');
    }

    const formData = new FormDataNode();
    formData.append('file', fileBuffer, {
        contentType: mimetype,
        filename: originalFilename // Pass original filename, Compdfkit might use it
    });

    console.log(`[OCR_SERVICE] Calling Compdfkit API for file: ${originalFilename}, type: ${mimetype}`);
    try {
        const response = await fetch(COMPDFKIT_OCR_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Authorization': COMPDFKIT_API_KEY,
                // form-data library sets the Content-Type header with the boundary itself
                // ...formData.getHeaders() // This is specific to the form-data library
            },
            body: formData, // form-data stream
        });

        const responseDataText = await response.text();

        if (!response.ok) {
            console.error(`[OCR_SERVICE] Compdfkit API Error: ${response.status} - ${responseDataText}`);
            let errorMsg = `Compdfkit API Error: ${response.status}`;
            try {
                const errJson = JSON.parse(responseDataText);
                errorMsg = errJson.msg || errJson.message || errorMsg;
            } catch(e) { /* ignore parse error if response isn't JSON */ }
            throw new Error(errorMsg);
        }

        const responseData = JSON.parse(responseDataText);
        // console.log('[OCR_SERVICE] Compdfkit API Success (raw):', JSON.stringify(responseData).substring(0, 300) + "...");

        if (responseData && responseData.data && typeof responseData.data.content === 'string') {
            console.log(`[OCR_SERVICE] Successfully OCR'd file: ${originalFilename}`);
            return responseData.data.content;
        } else if (responseData && typeof responseData.content === 'string') { // Fallback for other possible structures
            console.log(`[OCR_SERVICE] Successfully OCR'd file (alt structure): ${originalFilename}`);
            return responseData.content;
        }
        console.warn('[OCR_SERVICE] Text content not found in expected Compdfkit response structure for file:', originalFilename, responseData);
        return ''; // Or throw error if content is strictly expected
    } catch (error) {
        console.error(`[OCR_SERVICE] Error during Compdfkit API call for ${originalFilename}:`, error);
        throw new Error(error.message || `Failed to process file ${originalFilename} with Compdfkit OCR.`);
    }
}

module.exports = {
    getTextFromImageOrPdf,
};