<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const emit = defineEmits(['send']);

const sendMessage = () => {
    if(!message.value.trim()) return;
    
    emit('send', message.value);
    message.value = '';
};
</script>

<template>
    <div class="p-4 bg-gray-800 flex">
        <input 
            v-model="message" 
            placeholder="Type your message..." 
            @keyup.enter="sendMessage" 
            type="text" 
            class="flex-1 p-2 bg-gray-700 text-white focus:outline-none"
        />
        <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2">Send</button>
    </div>
</template>