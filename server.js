// PAPERBUDDY FINAL/server.js (or your main app file, e.g., app.js)
const path = require('path'); // For path joining
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load .env from project root

const express = require('express');
const cors = require('cors');

// Adjust path to your routes file
const apiProxyRoutes = require('./Backend/routes/apiProxyRoutes');
// const authRoutes = require('./Backend/routes/authRoutes'); // If you have separate auth routes
// ... other route imports

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins. For production, configure specific origins.
app.use(express.json({ limit: '10mb' })); // To parse JSON request bodies, increased limit for potentially large answers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiProxyRoutes); // Mount your API proxy routes under /api
// app.use('/auth', authRoutes); // Example for auth routes
// ... use other routes

// Serve Frontend Static Files
// This setup assumes your server.js is in "PAPERBUDDY FINAL"
// and your frontend HTML/CSS/JS are in "PAPERBUDDY FINAL/Frontend/"
app.use(express.static(path.join(__dirname, 'Frontend')));

// All other GET requests not handled previously will return the main index.html (for SPA-like behavior if needed)
// This allows frontend routing to take over.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend should be accessible at http://localhost:${PORT}/ (or /index.html etc.)`);
    console.log(`CHATGPT_API_KEY Loaded: ${process.env.CHATGPT_API_KEY ? 'Yes' : 'NO!! Check .env'}`);
    console.log(`COMPDFKIT_API_KEY Loaded: ${process.env.COMPDFKIT_API_KEY ? 'Yes (check if placeholder)' : 'NO!! Check .env'}`);
    if (process.env.COMPDFKIT_API_KEY === 'YOUR_COMPDFKIT_API_KEY_PLACEHOLDER') {
        console.warn('COMPDFKIT_API_KEY is still a placeholder in .env!');
    }
});