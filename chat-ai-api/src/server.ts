import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

//Initialize Stream Chat
const chatClient = StreamChat.getInstance(process.env.STREAM_API_KEY!, process.env.STREAM_API_SECRET!);

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

            res.status(200).json({ userId,name,email });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }

    }
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});