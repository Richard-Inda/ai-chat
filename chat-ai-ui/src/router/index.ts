import { createRouter, createWebHistory } from 'vue-router';
import homeView from '../views/HomeView.vue';
import chatView from '../views/ChatView.vue';

const routes =[
    { path: '/', component: homeView },
    { path: '/chat', component: chatView },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});