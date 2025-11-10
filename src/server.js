const { Server } = require('socket.io');
const Room = require('./models/Room');

let io;
const waitingUsers = new Map(); // For random connect
const activeConnections = new Map(); // Track active peer connections

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);


        // Random Connect Mode
        socket.on('join-random', async ({ userId, username }) => {
            console.log(`🎲 ${username} joining random connect`);

            // Check if there's someone waiting
            const waitingUser = Array.from(waitingUsers.values())[0];

            if (waitingUser && waitingUser.socketId !== socket.id) {
                // Match found! Remove from waiting list
                waitingUsers.delete(waitingUser.socketId);

                // Notify both users of the match
                const roomId = `random-${Date.now()}`;

                socket.join(roomId);
                io.sockets.sockets.get(waitingUser.socketId)?.join(roomId);

                // Send match notifications
                socket.emit('match-found', {
                    roomId,
                    peerId: waitingUser.socketId,
                    peerUsername: waitingUser.username
                });

                io.to(waitingUser.socketId).emit('match-found', {
                    roomId,
                    peerId: socket.id,
                    peerUsername: username
                });

                console.log(`🤝 Matched ${username} with ${waitingUser.username}`);
            } else {
                // Add to waiting list
                waitingUsers.set(socket.id, { socketId: socket.id, userId, username });
                socket.emit('waiting', { message: 'Searching for someone...' });
                console.log(`⏳ ${username} added to waiting list`);
            }
        });

        // Leave random queue
        socket.on('leave-random', () => {
            waitingUsers.delete(socket.id);
            console.log(`👋 User ${socket.id} left random queue`);
        });

        // Private Room - Join
        socket.on('join-room', async ({ roomName, roomPassword, username }) => {
            try {
                const room = await Room.findOne({ name: roomName });

                if (!room) {
                    socket.emit('room-error', { message: 'Room not found' });
                    return;
                }

                const isValid = await room.comparePassword(roomPassword);
                if (!isValid) {
                    socket.emit('room-error', { message: 'Invalid password' });
                    return;
                }

                // Join the room
                socket.join(roomName);

                // Get other users in the room
                const clients = await io.in(roomName).allSockets();
                const otherUsers = Array.from(clients).filter(id => id !== socket.id);

                // Notify the new user about existing users
                socket.emit('room-joined', {
                    roomName,
                    users: otherUsers,
                    username
                });

                // Notify existing users about the new user
                socket.to(roomName).emit('user-joined', {
                    userId: socket.id,
                    username
                });

                console.log(`🏠 ${username} joined room: ${roomName}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('room-error', { message: 'Failed to join room' });
            }
        });

        // WebRTC Signaling - Offer
        socket.on('offer', ({ offer, to, from, roomId }) => {
            console.log(`📤 Sending offer from ${from} to ${to}`);
            io.to(to).emit('offer', { offer, from, roomId });
        });

        // WebRTC Signaling - Answer
        socket.on('answer', ({ answer, to, from, roomId }) => {
            console.log(`📥 Sending answer from ${from} to ${to}`);
            io.to(to).emit('answer', { answer, from, roomId });
        });

        // WebRTC Signaling - ICE Candidate
        socket.on('ice-candidate', ({ candidate, to, from }) => {
            io.to(to).emit('ice-candidate', { candidate, from });
        });

        // Skip/Next in Random Connect
        socket.on('skip-user', ({ roomId, peerId }) => {
            console.log(`⏭️ User ${socket.id} skipping connection`);

            // Notify the other peer
            io.to(peerId).emit('peer-skipped', { message: 'User skipped to next' });

            // Leave current room
            socket.leave(roomId);

            // Join random queue again
            socket.emit('ready-for-next');
        });

        // User disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);

            // Remove from waiting list
            waitingUsers.delete(socket.id);

            // Notify rooms about disconnection
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room !== socket.id) {
                    socket.to(room).emit('user-left', { userId: socket.id });
                }
            });
        });

        // Chat messages
        socket.on('send-message', ({ roomId, message, username }) => {
            io.to(roomId).emit('receive-message', {
                message,
                username,
                timestamp: new Date().toISOString()
            });
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIO };