// PAPERBUDDY FINAL/Backend/services/aiService.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }); // Load .env from project root

const OpenAI = require('openai');
const fs = require('fs').promises;
const ocrService = require('./ocrService'); // Assuming it's in the same directory

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
});

// Function to translate frontend paperId (e.g., econ-9708-22-fm-24)
// to Mark Scheme filename (e.g., 9708_m24_ms_22.pdf)
function paperIdToMarkSchemeFilename(paperId) {
    const parts = paperId.split('-');
    if (parts.length < 5) {
        console.warn(`[AI_SERVICE_MS_MAP] Invalid paperId format for MS: ${paperId}`);
        return null;
    }

    const subjectCode = parts[1];       // e.g., 9708
    const paperNumVariant = parts[2];    // e.g., 22 (Paper 2, Variant 2)
    const sessionCodeRaw = parts[3].toLowerCase(); // e.g., fm
    const yearShort = parts[4];         // e.g., 24

    let msSessionCode;
    switch (sessionCodeRaw) {
        case 'fm': msSessionCode = 'm'; break; // February/March
        case 'mj': msSessionCode = 's'; break; // May/June (Summer)
        case 'on': msSessionCode = 'w'; break; // October/November (Winter)
        default:
            console.warn(`[AI_SERVICE_MS_MAP] Unknown session code '${sessionCodeRaw}' in paperId: ${paperId}`);
            return null;
    }

    // Filename format: <subject_code>_<session_char><year_short>_ms_<paper_num_variant>.pdf
    // Example: 9708_m24_ms_22.pdf
    const filename = `${subjectCode}_${msSessionCode}${yearShort}_ms_${paperNumVariant}.pdf`;
    console.log(`[AI_SERVICE_MS_MAP] Mapped paperId '${paperId}' to MS filename '${filename}'`);
    return filename;
}

async function getMarkSchemeText(paperId) {
    const markSchemeFilename = paperIdToMarkSchemeFilename(paperId);
    if (!markSchemeFilename) {
        const errorMessage = `[AI_SERVICE] Could not determine mark scheme filename for paperId: ${paperId}. Grading will proceed without specific MS.`;
        console.error(errorMessage);
        return "Mark Scheme could not be loaded for this paper. Grade based on general A-Level principles for the subject.";
    }

    // Path: Backend/services/ -> Backend/ -> PAPERBUDDY_FINAL/ -> Frontend/ms/
    const msDirectory = path.join(__dirname, '..', '..', 'Frontend', 'ms');
    const filePath = path.join(msDirectory, markSchemeFilename);
    console.log(`[AI_SERVICE] Attempting to load Mark Scheme from: ${filePath}`);

    try {
        const fileBuffer = await fs.readFile(filePath);
        // Assuming mark schemes are PDFs and need OCR
        console.log(`[AI_SERVICE] OCRing mark scheme: ${markSchemeFilename}`);
        const markSchemeText = await ocrService.getTextFromImageOrPdf(fileBuffer, 'application/pdf', markSchemeFilename);
        if (!markSchemeText || markSchemeText.trim().length < 50) { // Arbitrary length check for meaningful content
            console.warn(`[AI_SERVICE] OCR of mark scheme ${markSchemeFilename} returned little or no text.`);
            return "Mark Scheme content was sparse or could not be extracted after OCR. Grade based on general A-Level principles.";
        }
        console.log(`[AI_SERVICE] Successfully loaded and OCR'd mark scheme: ${markSchemeFilename}`);
        return markSchemeText;
    } catch (error) {
        console.error(`[AI_SERVICE] Error reading or OCRing mark scheme file ${markSchemeFilename}:`, error.message);
        if (error.code === 'ENOENT') {
            return `Mark Scheme file (${markSchemeFilename}) not found. Grade based on general A-Level principles.`;
        }
        return "Error accessing the Mark Scheme. Grade based on general A-Level principles.";
    }
}

async function getAiFeedbackAndGrade(paperContext, userAnswerText, paperTotalMarks) {
    if (!process.env.CHATGPT_API_KEY || process.env.CHATGPT_API_KEY === 'YOUR_CHATGPT_API_KEY_PLACEHOLDER') {
        console.error('[AI_SERVICE] ChatGPT API Key is not configured in .env or is a placeholder.');
        throw new Error('AI service is not configured.');
    }

    const markSchemeTextContent = await getMarkSchemeText(paperContext.id);

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
${userAnswerText}
---

Remember to output ONLY the JSON object. Do not include any prefatory text or explanations outside the JSON structure. Ensure all string values within the JSON are properly escaped.`;

    console.log(`[AI_SERVICE] Sending prompt to OpenAI for paper ${paperContext.id}. Length: ${prompt.length}`);
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125", // Or "gpt-4-turbo-preview" if available and budget allows
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const jsonResponseString = chatCompletion.choices[0]?.message?.content;
        if (!jsonResponseString) {
            console.error('[AI_SERVICE] OpenAI response content is empty for paper:', paperContext.id);
            throw new Error('OpenAI response content is empty.');
        }

        // console.log('[AI_SERVICE] OpenAI Raw JSON string:', jsonResponseString);
        const result = JSON.parse(jsonResponseString);
        console.log(`[AI_SERVICE] Successfully received and parsed AI feedback for ${paperContext.id}. Score: ${result.score}/${result.totalMarks}`);


        // Ensure all expected fields are present, providing defaults if not
        const defaults = { score: 0, totalMarks: paperTotalMarks, grade: "U", feedback: "Feedback processing error.", outline: "Outline processing error.", highlight_references: [], sectionScores: {} };
        const finalResult = { ...defaults, ...result };

        finalResult.score = parseInt(finalResult.score) || 0;
        finalResult.totalMarks = parseInt(finalResult.totalMarks) || paperTotalMarks;
        if(finalResult.score > finalResult.totalMarks) finalResult.score = finalResult.totalMarks;
        if(finalResult.score < 0) finalResult.score = 0;
        if (!Array.isArray(finalResult.highlight_references)) finalResult.highlight_references = [];
        if (typeof finalResult.sectionScores !== 'object' || finalResult.sectionScores === null) finalResult.sectionScores = {};

        return finalResult;

    } catch (error) {
        console.error(`[AI_SERVICE] Error calling OpenAI API or parsing response for ${paperContext.id}:`, error);
        return { // Return a structured error response
            score: 0, totalMarks: paperTotalMarks, grade: "U",
            feedback: `Error during AI processing: ${error.message}. Please try again.`,
            outline: "Outline generation failed due to an AI processing error.",
            highlight_references: [], sectionScores: {}
        };
    }
}

module.exports = {
    getAiFeedbackAndGrade,
};