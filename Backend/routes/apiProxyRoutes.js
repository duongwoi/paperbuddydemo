// PAPERBUDDY FINAL/Backend/routes/apiProxyRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path'); // For path.join if needed for service imports

// Adjust paths to your services based on this file's location (Backend/routes/)
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for uploads
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.warn(`[API_PROXY_UPLOAD] Rejected file type: ${file.mimetype}`);
            cb(new Error('Invalid file type. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX, TXT.'), false);
        }
    }
});

// OCR Proxy Route: /api/ocr
router.post('/ocr', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    try {
        // Pass the file buffer and mimetype to the ocrService
        const ocrText = await ocrService.getTextFromImageOrPdf(req.file.buffer, req.file.mimetype, req.file.originalname);
        res.json({ text: ocrText });
    } catch (error) {
        console.error('[API_PROXY_OCR] Error in OCR proxy route:', error.message);
        res.status(500).json({ message: error.message || 'OCR processing failed on server.' });
    }
});

// AI Feedback Proxy Route: /api/ai-feedback
router.post('/ai-feedback', async (req, res) => {
    const { paperContext, userAnswer, paperTotalMarks } = req.body;

    if (!paperContext || !paperContext.id || !userAnswer || paperTotalMarks === undefined) {
        return res.status(400).json({ message: 'Missing required fields: paperContext (with id), userAnswer, or paperTotalMarks.' });
    }

    try {
        const feedbackResult = await aiService.getAiFeedbackAndGrade(
            paperContext,
            userAnswer,
            Number(paperTotalMarks) // Ensure it's a number
        );
        res.json(feedbackResult);
    } catch (error) {
        console.error('[API_PROXY_AI] Error in AI feedback proxy route:', error.message);
        res.status(500).json({ message: error.message || 'AI feedback generation failed on server.' });
    }
});

module.exports = router;