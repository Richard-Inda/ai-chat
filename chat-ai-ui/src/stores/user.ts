import {defineStore} from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: null as string | null,
        name: null as string | null,
        email: '',
        isLoggedIn: false,
    }),
    actions: {
        setUser(data: { userId: string, name: string, email: string }) {
            this.userId = data.userId;
            this.name = data.name;
            this.email = data.email;
            this.isLoggedIn = true;
        },
        logout() {
            this.userId = null;
            this.name = null;
        }
    },
    persist: true
})