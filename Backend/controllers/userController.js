const asyncHandler = require('express-async-handler');
// const User = require('../models/userModel'); // For real DB
const { mockUsers } = require('../models/userModel'); // Using mock data

// @desc    Get user subjects
// @route   GET /api/users/subjects
// @access  Private
const getUserSubjects = asyncHandler(async (req, res) => {
    // req.user is attached by protect middleware
    const user = mockUsers.find(u => u._id === req.user._id);
    if (user) {
        res.json(user.subjects || []);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user subjects
// @route   PUT /api/users/subjects
// @access  Private
const updateUserSubjects = asyncHandler(async (req, res) => {
    const { subjects } = req.body; // Expecting an array of subjectId strings
    const user = mockUsers.find(u => u._id === req.user._id);

    if (user) {
        user.subjects = Array.isArray(subjects) ? subjects : [];
        console.log(`Updated subjects for ${user.email}:`, user.subjects);
        res.json(user.subjects);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUserSubjects,
    updateUserSubjects,
};