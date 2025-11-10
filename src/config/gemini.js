const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

const generateIcebreaker = async () => {
    try {
        const model = getModel();
        const prompt = `Generate a fun, light-hearted conversation starter or ice breaker question for two strangers meeting in a video chat. Keep it friendly, interesting, and appropriate. Just provide the question, no extra formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini API Error:', error);
        return 'What\'s the most interesting thing that happened to you this week?';
    }
};

const moderateContent = async (text) => {
    try {
        const model = getModel();
        const prompt = `Analyze this text for inappropriate content, hate speech, or harmful language: "${text}". Respond with only "safe" or "unsafe".`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const verdict = response.text().trim().toLowerCase();

        return verdict === 'safe';
    } catch (error) {
        console.error('Moderation Error:', error);
        return true; // Default to safe on error
    }
};

const getTechnicalHelp = async (issue) => {
    try {
        const model = getModel();
        const prompt = `A user is having this technical issue with video calling: "${issue}". Provide a brief, helpful solution in 2-3 sentences.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Help Generation Error:', error);
        return 'Try refreshing the page and allowing camera/microphone permissions in your browser settings.';
    }
};

module.exports = {
    generateIcebreaker,
    moderateContent,
    getTechnicalHelp
};