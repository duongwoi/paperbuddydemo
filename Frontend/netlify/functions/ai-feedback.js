// PAPERBUDDY FINAL/netlify/functions/ai-feedback.js

const path = require('path');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
}

const OpenAI = require('openai');
// Assuming ocrService.js is in Backend/services/
const ocrServiceLogic = require(path.join(__dirname, '..', '..', 'Backend', 'services', 'ocrService.js'));

let fetch; // To handle node-fetch for versions < 18 or native fetch
if (typeof global.fetch !== 'function') {
    fetch = require('node-fetch');
} else {
    fetch = global.fetch;
}

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
});

// Helper function to translate frontend paperId to MS filename
// (Same as the one in Backend/services/aiService.js)
function paperIdToMarkSchemeFilename(paperId) {
    const parts = paperId.split('-');
    if (parts.length < 5) {
        console.warn(`[AI_FUNC_MS_MAP] Invalid paperId format for MS: ${paperId}`);
        return null;
    }
    const subjectCode = parts[1];
    const paperNumVariant = parts[2];
    const sessionCodeRaw = parts[3].toLowerCase();
    const yearShort = parts[4];
    let msSessionCode;
    switch (sessionCodeRaw) {
        case 'fm': msSessionCode = 'm'; break;
        case 'mj': msSessionCode = 's'; break;
        case 'on': msSessionCode = 'w'; break;
        default:
            console.warn(`[AI_FUNC_MS_MAP] Unknown session code '${sessionCodeRaw}' in paperId: ${paperId}`);
            return null;
    }
    return `${subjectCode}_${msSessionCode}${yearShort}_ms_${paperNumVariant}.pdf`;
}

async function getMarkSchemeTextViaHttp(paperId, siteBaseUrl) {
    const markSchemeFilename = paperIdToMarkSchemeFilename(paperId);
    if (!markSchemeFilename) {
        const errorMessage = `[AI_FUNC] Could not determine mark scheme filename for paperId: ${paperId}. Grading will proceed without specific MS.`;
        console.error(errorMessage);
        return "Mark Scheme file not found or paperId format incorrect. Grade based on general A-Level principles for the subject.";
    }

    // Construct public URL to the MS file. Assumes MS files are in /ms/ directory of the deployed site.
    const msUrl = `${siteBaseUrl}/ms/${markSchemeFilename}`;
    console.log(`[AI_FUNC] Attempting to fetch Mark Scheme from: ${msUrl}`);

    try {
        const response = await fetch(msUrl);
        if (!response.ok) {
            console.warn(`[AI_FUNC] Failed to fetch MS ${markSchemeFilename} (Status: ${response.status}). URL: ${msUrl}`);
            return `Mark Scheme file (${markSchemeFilename}) not found or inaccessible at public URL (${response.status}). Grade based on general A-Level principles.`;
        }
        const fileBuffer = await response.buffer(); // Get as buffer for OCR
        console.log(`[AI_FUNC] Fetched MS ${markSchemeFilename}, size: ${fileBuffer.length}. OCRing...`);

        const markSchemeText = await ocrServiceLogic.getTextFromImageOrPdf(fileBuffer, 'application/pdf', markSchemeFilename);

        if (!markSchemeText || markSchemeText.trim().length < 50) { // Basic check for content
            console.warn(`[AI_FUNC] OCR of fetched MS ${markSchemeFilename} yielded little or no text.`);
            return "Mark Scheme content was sparse or could not be extracted after fetching and OCR. Grade based on general A-Level principles.";
        }
        console.log(`[AI_FUNC] Successfully fetched and OCR'd mark scheme: ${markSchemeFilename}`);
        return markSchemeText;
    } catch (error) {
        console.error(`[AI_FUNC] Error fetching or OCRing MS ${markSchemeFilename} from ${msUrl}:`, error);
        return "Error accessing the Mark Scheme from public URL. Grade based on general A-Level principles.";
    }
}


exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    if (!process.env.CHATGPT_API_KEY || process.env.CHATGPT_API_KEY === 'YOUR_CHATGPT_API_KEY_PLACEHOLDER') {
        console.error('[AI_FUNC] ChatGPT API Key is not configured or is a placeholder.');
        return { statusCode: 500, body: JSON.stringify({ message: 'AI service is not configured.' }) };
    }

    try {
        const { paperContext, userAnswer, paperTotalMarks } = JSON.parse(event.body);

        if (!paperContext || !paperContext.id || !userAnswer || paperTotalMarks === undefined) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields for AI feedback.' }) };
        }

        // Netlify injects URL for the deployed site. For local dev, it's often localhost:8888.
        const siteUrl = process.env.URL || `http://localhost:${process.env.PORT || 8888}`;
        console.log(`[AI_FUNC] Site base URL for fetching MS: ${siteUrl}`);

        const markSchemeTextContent = await getMarkSchemeTextViaHttp(paperContext.id, siteUrl);

        const prompt = `
You are an expert A-Level examiner for ${paperContext.subjectName || 'the relevant subject'} (${paperContext.subjectCode || 'N/A'}), specifically marking Paper ${paperContext.paperNumber || 'N/A'} Variant ${paperContext.variant || 'N/A'} from the ${paperContext.sessionLabel || 'N/A'} ${paperContext.year || 'N/A'} series. The total marks for the question(s) answered by the student are ${paperTotalMarks}.

You will be provided with the official Mark Scheme (if available and legible) and the student's answer. Your task is to:

1.  **Understand the Mark Scheme:** If a Mark Scheme is provided and contains meaningful content, carefully review it. Identify key assessment objectives, content points, levels of response, and specific mark allocations. If the Mark Scheme is marked as "not found" or "could not be extracted", proceed by using your general A-Level marking expertise for this subject and paper type.
2.  **Evaluate the Student's Answer:** Assess the student's answer. If a valid Mark Scheme is present, evaluate strictly against it. Otherwise, use general A-Level criteria.
3.  **Provide Detailed Feedback (JSON Output):** Output ONLY a single, valid JSON object with the following keys:

    *   "score": (Integer) The total mark awarded to the student out of ${paperTotalMarks}.
    *   "totalMarks": (Integer) Reiterate the ${paperTotalMarks}.
    *   "grade": (String) A letter grade (A, B, C, D, E, or U) based on the percentage: A >= 80%, B >= 70%, C >= 60%, D >= 50%, E >= 40%.
    *   "feedback": (String, 200-400 words) Constructive, detailed feedback for the student.
        *   Strengths: What the student did well, referencing their answer and Mark Scheme criteria (if MS available).
        *   Weaknesses/Improvements: Where the answer fell short, missed concepts, or lacked depth, referencing MS (if MS available).
        *   Illustrative Quotes: Quote short, relevant phrases from the student's answer.
        *   Actionable Advice: Specific advice, ideally linked to Mark Scheme criteria if available.
        *   Tone: Supportive and encouraging.
    *   "highlight_references": (Array of objects) List up to 5-7 key phrases from the *student's answer* that are significant. Format: [{"student_phrase": "...", "significance": "e.g., Correctly applied theory X.", "ms_match_level": "e.g., Level 3 Descriptor (if MS used)"}]. Empty array [] if none stand out.
    *   "outline": (String, 3-7 bullet points) A concise model answer outline for achieving high marks, based on the Mark Scheme (if available) or general best practice for this question type.
    *   "sectionScores": (Object, optional) If the question/MS implies distinct sections (e.g., Section A, B or Part a, b), attempt a score breakdown. Format: {"sectionA": {"score": X, "max": Y}}. If not applicable/unclear, provide an empty object {} or omit. Base 'max' for sections on typical A-Level paper structures for {subjectName} Paper {paperNumber} if the MS doesn't specify, or make a reasonable division of ${paperTotalMarks}.

MARK SCHEME TEXT (may be a generic message if file not found/processed):
---
${markSchemeTextContent}
---

STUDENT'S ANSWER TEXT:
---
${userAnswer}
---

Remember to output ONLY the JSON object. Do not include any prefatory text or explanations outside the JSON structure. Ensure all string values within the JSON are properly escaped.`;

        console.log(`[AI_FUNC] Sending prompt to OpenAI for paper ${paperContext.id}.`);
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const jsonResponseString = chatCompletion.choices[0]?.message?.content;
        if (!jsonResponseString) {
            console.error('[AI_FUNC] OpenAI response content is empty for paper:', paperContext.id);
            throw new Error('OpenAI response content is empty.');
        }
        
        const result = JSON.parse(jsonResponseString);
        console.log(`[AI_FUNC] Successfully received and parsed AI feedback for ${paperContext.id}. Score: ${result.score}/${result.totalMarks}`);

        const defaults = { score: 0, totalMarks: paperTotalMarks, grade: "U", feedback: "Feedback processing error.", outline: "Outline processing error.", highlight_references: [], sectionScores: {} };
        const finalResult = { ...defaults, ...result };
        finalResult.score = parseInt(finalResult.score) || 0;
        finalResult.totalMarks = parseInt(finalResult.totalMarks) || paperTotalMarks;
        if(finalResult.score > finalResult.totalMarks) finalResult.score = finalResult.totalMarks;
        if(finalResult.score < 0) finalResult.score = 0;
        if (!Array.isArray(finalResult.highlight_references)) finalResult.highlight_references = [];
        if (typeof finalResult.sectionScores !== 'object' || finalResult.sectionScores === null) finalResult.sectionScores = {};

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalResult),
        };

    } catch (error) {
        console.error('[AI_FEEDBACK_FUNCTION_ERROR]', error);
        return {
            statusCode: error.status || 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: error.message || 'AI feedback generation failed in function.' }),
        };
    }
};