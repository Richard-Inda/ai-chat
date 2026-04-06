import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat, type ChannelData } from "stream-chat";
import OpenAI from "openai";
import { db } from "./config/database.js";
import { chats, users } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { ChatCompletionMessageParam } from "openai/resources";

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
            
            // Check if user exists in Stream Chat
            const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });

            if (!userResponse.users.length) {
                // Stream's UserResponse type does not include `email`; id is derived from email above.
                await chatClient.upsertUser({
                    id: userId,
                    name,
                    role: 'user',
                });
            }

            //Checking for existing user in database
            const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

            if (!existingUser.length) {
                console.log(`User ${userId} not found in database, creating new user`);
                await db.insert(users).values({
                    id: userId,
                    name: name,
                    email: email,
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
        // Check if user exists in Stream Chat
        const userResponse = await chatClient.queryUsers({ id: userId });

        if (!userResponse.users.length) {
            return res.status(404).json({ error: 'User not found. Please register first' });
        }

        //Checking for existing user in database
        const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

        if (!existingUser.length) {
            return res.status(404).json({ error: 'User not found. Please register first' });
        }

        // Fetch users past messages for context
        const chatHistory = await db
            .select()
            .from(chats)
            .where(eq(chats.userId, userId))
            .orderBy(chats.createdAt)
            .limit(10);

        // Formatting chat history for Open Ai
        const conversation: ChatCompletionMessageParam[] = chatHistory.flatMap((chat)=>[
            { role: 'user', content: chat.message },
            { role: 'assistant', content: chat.reply },
        ]);

        // Adding new user messages to conversation
        conversation.push({ role: 'user', content: message });
        
        //Prompt OpenAi GPT-4o mini
        const response = await openai.chat.completions.create({ 
            model: 'gpt-4o-mini', 
            messages: conversation as ChatCompletionMessageParam[] });

            const aiMessage = response.choices[0].message?.content??'No Response from Ai';

            //Save chat to database
            await db.insert(chats).values({
                userId,
                message,
                reply: aiMessage,
            });

            //Create or get channel
            const channel = chatClient.channel('messaging', `chat-${userId}`, {
                name: 'AI Chat',
                created_by_id: 'ai_bot',
            } as ChannelData);

            await channel. create();
            await channel.sendMessage({text: aiMessage, user_id: 'ai_bot'});

            res.status(200).json({ reply: aiMessage });

    } catch (error) {
        console.error('Error Generating Ai Response:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get chat history for a user
app.post('/get-messages', async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Message and user are required' });
    }

    try{
        const chatHistory = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId));

        res.status(200).json({ chatHistory });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete all chat rows for a user
app.post('/clear-messages', async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body ?? {};

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!existingUser.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.delete(chats).where(eq(chats.userId, userId));

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});