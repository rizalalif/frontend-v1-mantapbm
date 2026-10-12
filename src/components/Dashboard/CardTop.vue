<script setup>
import { ref } from "vue";
const props = defineProps({
    bgColor: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    value: {
        type: [Number, String],
        required: true
    }
})
</script>

<template>
    <div :class="bgColor" class=" rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col
    justify-between">
        <p class="text-[10px] font-bold text-white uppercase tracking-wider mb-2">{{ title }}</p>
        <h2 class="text-3xl font-extrabold text-white mb-1">{{ value || 0 }}</h2>
    </div>
</template>