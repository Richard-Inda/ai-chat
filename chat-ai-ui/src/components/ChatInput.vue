<script setup lang="ts">
import { ref } from 'vue';

const message = ref('');
const emit = defineEmits<{
    send: [text: string];
    clear: [];
}>();

const sendMessage = () => {
    if (!message.value.trim()) return;

    emit('send', message.value);
    message.value = '';
};

const requestClear = () => {
    if (!confirm('Clear all messages in this chat? This cannot be undone.')) return;
    emit('clear');
};
</script>

<template>
    <div class="p-4 bg-gray-800 flex gap-2 items-center">
        <input
            v-model="message"
            placeholder="Type your message..."
            @keyup.enter="sendMessage"
            type="text"
            class="flex-1 min-w-0 p-2 bg-gray-700 text-white rounded-lg focus:outline-none"
        />
        <button
            type="button"
            @click="sendMessage"
            class="shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
            Send
        </button>
        <button
            type="button"
            @click="requestClear"
            class="shrink-0 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
            Clear
        </button>
    </div>
</template>