const Room = require('../models/Room');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { roomName, password, username } = req.body;

        // Check if room already exists
        const existingRoom = await Room.findOne({ name: roomName });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room name already taken' });
        }

        // Create new room
        const room = await Room.create({
            name: roomName,
            password,
            createdBy: username
        });

        res.status(201).json({
            success: true,
            room: {
                name: room.name,
                createdAt: room.createdAt
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Failed to create room' });
    }
};

// Verify room credentials
const verifyRoom = async (req, res) => {
    try {
        const { roomName, password } = req.body;

        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const isValid = await room.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.json({
            success: true,
            room: {
                name: room.name,
                participants: room.participants.length
            }
        });
    } catch (error) {
        console.error('Verify room error:', error);
        res.status(500).json({ message: 'Failed to verify room' });
    }
};

// Get room info
const getRoomInfo = async (req, res) => {
    try {
        const { roomName } = req.params;

        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({
            success: true,
            room: {
                name: room.name,
                participants: room.participants.length,
                isActive: room.isActive
            }
        });
    } catch (error) {
        console.error('Get room info error:', error);
        res.status(500).json({ message: 'Failed to get room info' });
    }
};

module.exports = {
    createRoom,
    verifyRoom,
    getRoomInfo
};