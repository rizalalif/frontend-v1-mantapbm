<script setup>
import { RouterView } from 'vue-router'

</script>

<template>
    <div
        class="bg-[url('/public/img/bg.png')] bg-cover bg-center min-h-screen flex items-center justify-center p-4 text-slate-800 custom-font">
        <RouterView />
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.custom-font {
    font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
