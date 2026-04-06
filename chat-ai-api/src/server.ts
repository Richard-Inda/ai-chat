import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

//Initialize Stream Chat
const chatClient = StreamChat.getInstance(process.env.STREAM_API_KEY!, process.env.STREAM_API_SECRET!);

//Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

//Register user with Stream Chat
app.post('/register-user',
    async (req: Request, res: Response): Promise<any> => {
        const { name, email } = req.body ?? {};

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        try {
            const userId = email.replace(/[^a-zA-Z0-9_-]/g, '_');

            const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });

            if (!userResponse.users.length) {
                await chatClient.upsertUser({
                    id: userId,
                    name: name,
                    email: email,
                    role: 'user',
                });
            }

            res.status(200).json({ userId, name, email });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }

    }
);

//Send message to Ai
app.post('/chat', async (req: Request, res: Response): Promise<any> => {
    const { message, userId } = req.body;

    if (!message || !userId) {
        return res.status(400).json({ error: 'Message and user are required' });
    }

    try {
        const userResponse = await chatClient.queryUsers({ id: userId });

        if (!userResponse.users.length) {
            return res.status(404).json({ error: 'User not found. Please register first' });
        }

        //Prompt OpenAi GPT-4o mini
        const response = await openai.chat.completions.create({ 
            model: 'gpt-4o-mini', 
            messages: [{ role: 'user', content: message }] });

            const aiMessage = response.choices[0].message?.content??'No Response from Ai';

            //Create or get channel
            const channel = chatClient.channel('messaging',`chat-${userId}`, {
                name: `AI Chat`,
                created_by_id: 'ai_bot',
            });

            await channel. create();
            await channel.sendMessage({text: aiMessage, user_id: 'ai_bot'});

            res.status(200).json({ reply: aiMessage });

    } catch (error) {
        console.error('Error Generating Ai Response:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});