<script setup lang="ts">
import robotImage from '../assets/robot.png';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const userStore=useUserStore();
const router=useRouter();

const logout=()=>{
    userStore.logout();
    router.push('/');
};
</script>

<template>
    <div class="py-4 px-6 bg-gray-800 shadow-md flex items-center justify-between">
        <img :src="robotImage" alt="Chat Ai" class="w-8 h-8">
        <h1 class="text-lg font-semibold">Chat Ai</h1>
        <button @click="logout" class="text-gray-400 hover:text-white">Logout</button>
    </div>
</template>