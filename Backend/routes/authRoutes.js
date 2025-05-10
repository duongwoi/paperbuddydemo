const express = require('express');
const router = express.Router();
// Ensure the path to authController is correct AND that functions are exported correctly
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Line 6 is here:
router.post('/register', registerUser); // Is registerUser defined and imported correctly?
router.post('/login', loginUser);     // Is loginUser defined and imported correctly?
router.get('/me', protect, getMe);   // Is getMe defined and imported correctly?

module.exports = router;