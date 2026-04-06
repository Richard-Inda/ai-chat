<script setup lang="ts">
import Header from '../components/Header.vue';
import {onMounted,nextTick} from 'vue';
import { useChatStore } from '../stores/chat';
import { useUserStore } from '../stores/user';
import {useRouter} from 'vue-router';

const chatStore = useChatStore();
const userStore = useUserStore();
const router = useRouter();

//Ensure user is logged in
if (!userStore.userId) {
    router.push('/');
}

// Auto-scroll to bottom
const scrollToBottom = () => {
    nextTick(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });
};

onMounted(()=>{
    chatStore.loadChatHistory();
    scrollToBottom();
})

</script>

<template>
    <div class="flex flex-col h-screen bg-gray-900 text-white">
        <Header />

        <div id="chat-container" class="flex-1 p-4 overflow-y-auto p-4 space-y-4">
            <div v-for="(msg,index) in chatStore.messages" :key="index" 
                class="flex items-start" 
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                    <div 
                    class="max-w-xs px-4 py-2 rounded-lg md:max-w-md"
                    :class="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'">
                    {{ msg.content }}
                </div>
            </div>
        </div>
    </div>
</template>