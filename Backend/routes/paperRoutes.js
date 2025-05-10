const express = require('express');
const router = express.Router();
const { getPapers, getPaperById } = require('../controllers/paperController');
// const { protect } = require('../middleware/authMiddleware'); // Add protect if routes need auth

router.route('/').get(getPapers); // No protection for now, so anyone can see paper list
router.route('/:id').get(getPaperById); // No protection

module.exports = router;