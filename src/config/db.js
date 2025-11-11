const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tlsAllowInvalidCertificates: false, // safer
            serverSelectionTimeoutMS: 10000, // give it 10s to connect
        });

        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
