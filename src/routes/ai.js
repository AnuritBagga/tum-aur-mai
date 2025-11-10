const express = require('express');
const router = express.Router();
const {
    getIcebreaker,
    moderateMessage,
    getHelp
} = require('../controllers/aiController');

// Get conversation starter
router.get('/icebreaker', getIcebreaker);

// Moderate content
router.post('/moderate', moderateMessage);

// Get technical help
router.post('/help', getHelp);

module.exports = router;