const {
    generateIcebreaker,
    moderateContent,
    getTechnicalHelp
} = require('../config/gemini');

// Get ice breaker suggestion
const getIcebreaker = async (req, res) => {
    try {
        const suggestion = await generateIcebreaker();
        res.json({ success: true, suggestion });
    } catch (error) {
        console.error('Icebreaker error:', error);
        res.status(500).json({ message: 'Failed to generate icebreaker' });
    }
};

// Moderate message content
const moderateMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const isSafe = await moderateContent(message);

        res.json({
            success: true,
            isSafe,
            message: isSafe ? 'Content is appropriate' : 'Content may be inappropriate'
        });
    } catch (error) {
        console.error('Moderation error:', error);
        res.status(500).json({ message: 'Failed to moderate content' });
    }
};

// Get technical help
const getHelp = async (req, res) => {
    try {
        const { issue } = req.body;
        const help = await getTechnicalHelp(issue);

        res.json({ success: true, help });
    } catch (error) {
        console.error('Help error:', error);
        res.status(500).json({ message: 'Failed to get help' });
    }
};

module.exports = {
    getIcebreaker,
    moderateMessage,
    getHelp
};