const express = require('express');
const router = express.Router();
const {
    createAttempt,
    getMyAttempts,
    getAttemptByIdString,
    deleteAttempt
} = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createAttempt);

router.route('/myattempts')
    .get(protect, getMyAttempts);

router.route('/:attemptIdString')
    .get(protect, getAttemptByIdString)
    .delete(protect, deleteAttempt);

module.exports = router;