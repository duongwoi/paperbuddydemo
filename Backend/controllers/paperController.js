const asyncHandler = require('express-async-handler');
// const Paper = require('../models/paperModel'); // For real DB
const { mockPapers } = require('../models/paperModel');

// @desc    Fetch all papers or filter by subject
// @route   GET /api/papers
// @route   GET /api/papers?subjectId=economics-9708
// @access  Public (or Private if you want only logged-in users to see papers)
const getPapers = asyncHandler(async (req, res) => {
    const subjectId = req.query.subjectId;
    let papersToReturn = mockPapers;

    if (subjectId) {
        papersToReturn = mockPapers.filter(p => p.subjectId === subjectId);
    }
    res.json(papersToReturn);
});

// @desc    Fetch a single paper by its string ID
// @route   GET /api/papers/:id
// @access  Public (or Private)
const getPaperById = asyncHandler(async (req, res) => {
    const paper = mockPapers.find(p => p.id === req.params.id);
    if (paper) {
        res.json(paper);
    } else {
        res.status(404);
        throw new Error('Paper not found');
    }
});

module.exports = {
    getPapers,
    getPaperById,
};