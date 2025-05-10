const express = require('express');
const router = express.Router();
const { getUserSubjects, updateUserSubjects } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/subjects')
    .get(protect, getUserSubjects)
    .put(protect, updateUserSubjects);

module.exports = router;