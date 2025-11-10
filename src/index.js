const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeSocket } = require('./server');
const connectDB = require('./config/db');

// ✅ Load .env from parent folder
dotenv.config({ path: __dirname + '/../.env' });
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// ✅ Add this section
const roomRoutes = require('./routes/room');
app.use('/api/rooms', roomRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('✅ Tum Aur Mai Server is running...');
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
