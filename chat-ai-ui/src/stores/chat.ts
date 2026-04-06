import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from './user';

interface ChatMessage {
    message: string;
    reply: string;
}

interface FormattedMessage {
    role: 'user' | 'ai';
    content: string;
}

export const useChatStore = defineStore('chat', () => {
    const messages = ref<{ role: string, content: string }[]>([]);
    const isLoading = ref(false);

    const userStore = useUserStore();

    // Load previous messages
    const loadChatHistory = async () => {
        if (!userStore.userId) return;

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/get-messages`, { userId: userStore.userId });

            const chatHistory = Array.isArray(data?.messages) ? data.messages : [];

            messages.value = chatHistory
                .flatMap((msg: ChatMessage): FormattedMessage[] => [
                    { role: 'user', content: msg.message },
                    { role: 'ai', content: msg.reply }
                ])
                .filter((msg: FormattedMessage) => msg.content.trim());

                console.log('get-messages response:', data);

        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    return { messages, isLoading, loadChatHistory };
})