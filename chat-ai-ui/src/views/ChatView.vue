<script setup lang="ts">
import Header from '../components/Header.vue';
import { onMounted, nextTick, ref, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import ChatInput from '../components/ChatInput.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const router = useRouter();

const chatContainer = ref<HTMLElement | null>(null);

//Ensure user is logged in
if (!userStore.userId) {
    router.push('/');
}

// Formatt Ai Messages
const formatMessage = (text: string) => {
  if (!text) return '';

  return text
    .replace(/\n/g, '<br>') // Preserve line breaks
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold text
    .replace(/\*(.*?)\*/g, '<i>$1</i>') // Italic text
    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
    .replace(/(?:^|\n)- (.*?)(?:\n|$)/g, '<li>$1</li>') // Bullet points
    .replace(/(?:^|\n)(\d+)\. (.*?)(?:\n|$)/g, '<li>$1. $2</li>') // Numbered lists
    .replace(/<\/li>\n<li>/g, '</li><li>') // Ensure list continuity
    .replace(/<li>/, '<ul><li>') // Wrap in `<ul>`
    .replace(/<\/li>$/, '</li></ul>'); // Close the `<ul>`
};

// Auto-scroll after DOM updates (double nextTick helps when v-html changes height)
const scrollToBottom = () => {
    nextTick(() => {
        nextTick(() => {
            const el = chatContainer.value;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        });
    });
};

watch(() => chatStore.messages, () => scrollToBottom(), { deep: true });
watch(() => chatStore.isLoading, () => scrollToBottom());

const onClearChat = async () => {
    try {
        await chatStore.clearChatHistory();
        scrollToBottom();
    } catch {
        alert('Could not clear chat history. Please try again.');
    }
};

onMounted(async () => {
    await chatStore.loadChatHistory();
    scrollToBottom();
});

</script>

<template>
    <div class="flex flex-col h-screen bg-gray-900 text-white">
        <Header />

        <div ref="chatContainer" class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            <div v-for="(msg,index) in chatStore.messages" :key="index" 
                class="flex items-start" 
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                    <div 
                    v-html="formatMessage(msg.content)"
                    class="max-w-xs px-4 py-2 rounded-lg md:max-w-md"
                    :class="msg.role === 'user' ? 
                    'bg-blue-600 text-white' : 
                    'bg-gray-700 text-white'">                   
                </div>
            </div>
            <div v-if="chatStore.isLoading" class="flex justify-start">
                <div class="bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <span class="animate-pulse">Thinking...</span>
                </div>
            </div>
        </div>
        <div>
            <ChatInput @send="chatStore.sendMessage" @clear="onClearChat" />
        </div>
    </div>
</template>