
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads the .env file
const Groq = require('groq-sdk');

const app = express();
const port = 3001; // We'll run our backend on this port

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Middlewares
app.use(cors()); // Allows our React app to talk to this server
app.use(express.json()); // Allows the server to understand JSON data

// --- API Endpoints ---

// This is our first endpoint for generating an interview question
app.post('/generate-question', async (req, res) => {
    try {
        const { difficulty, topic } = req.body; 

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI interviewer. Your task is to generate one interview question based on the provided difficulty and topic. Respond with only the question text, nothing else.'
                },
                {
                    role: 'user',
                    content: `Generate one ${difficulty} interview question about ${topic}.`
                }
            ],
            model: 'llama-3.1-8b-instant',
        });

        const question = chatCompletion.choices[0]?.message?.content || 'Could not generate a question. Please try again.';
        
        console.log(`Generated Question: ${question}`);
        res.json({ question: question.trim() });

    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Failed to generate question from AI.' });
    }
});


app.post('/evaluate-interview', async (req, res) => {
    try {
        const { transcript } = req.body; // The array of { question, answer }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI hiring manager for a full-stack developer role (React/Node.js). Your task is to evaluate an interview transcript.
                    - Analyze all questions and answers.
                    - Provide a final score out of 100.
                    - Provide a concise 2-3 sentence summary of the candidate's performance, highlighting strengths and weaknesses.
                    - Respond ONLY with a valid JSON object in the format: {"finalScore": number, "summary": "string"}. Do not add any other text or explanation.`
                },
                {
                    role: 'user',
                    content: `Please evaluate the following interview transcript: ${JSON.stringify(transcript)}`
                }
            ],
            model: 'llama-3.1-8b-instant', 
            response_format: { type: "json_object" }, 
        });

        const result = JSON.parse(chatCompletion.choices[0]?.message?.content);
        
        console.log('Final Evaluation:', result);
        res.json(result);

    } catch (error) {
        console.error('Error evaluating interview:', error);
        res.status(500).json({ error: 'Failed to evaluate interview.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
});