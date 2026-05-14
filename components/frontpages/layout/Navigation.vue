<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const navigation = ref([
    {
        menu: 'Beranda',
        href: '/',
        badge: false
    },
    {
        menu: 'Keunggulan',
        href: '/#feature-section',
        badge: false
    }
]);

const isActive = (href: string) => {
    const currentFullPath = route.hash ? route.path + route.hash : route.path;
    return currentFullPath === href;
};
</script>

<template>
    <div class="d-flex flex-lg-row flex-column align-lg-center justify-end w-100 ga-lg-5 ga-4 pa-lg-0 pa-6">
        <div class="d-lg-none d-block mb-4">
            <div class="logo d-flex align-center text-primary">
                <v-icon size="32" class="mr-2">mdi-domain</v-icon>
                <h2 class="font-weight-bold mb-0">SIPROPEDA</h2>
            </div>
        </div>

        <div v-for="(item, i) in navigation" :key="i">
            <div class="d-flex align-center">
                <NuxtLink
                    :to="item.href"
                    :class="[
                        'text-15 font-weight-medium text-decoration-none text-hover-primary d-flex align-center ga-2 px-3 py-lg-1 py-2 lg-w-auto w-100',
                        isActive(item.href) ? 'text-primary' : ''
                    ]"
                >
                    {{ item.menu }}
                </NuxtLink>
            </div>
        </div>

        <v-btn class="custom-hover-primary bg-primary d-md-none d-flex w-full text-white h-43 px-5 transform-none" flat href="/login">
            <span class="text-white">Masuk Sistem</span>
        </v-btn>
    </div>
</template>