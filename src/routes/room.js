const express = require('express');
const router = express.Router();
const {
    createRoom,
    verifyRoom,
    getRoomInfo
} = require('../controllers/roomController');

// Create a new private room
router.post('/create', createRoom);

// Verify room credentials
router.post('/verify', verifyRoom);

// Get room information
router.get('/:roomName', getRoomInfo);

module.exports = router;