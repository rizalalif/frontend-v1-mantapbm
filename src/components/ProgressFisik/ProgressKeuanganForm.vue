<script setup>
import { onMounted } from 'vue';
import ProgressKeuanganTable from './ProgressFisikTable.vue/index.js';

const props = defineProps({
    paket: Object
});

const emit = defineEmits(['refresh']);

onMounted(() => {
    console.log('paket ProgressKeuanganForm🚀🚀🚀', props.paket?.progressKeuangans);
});
</script>

<template>
    <ProgressKeuanganTable 
        :progress-list="paket?.progressKeuangans" 
        :paket="paket" 
        :paket-id="paket?.id" 
        @refresh="$emit('refresh')" 
    />
</template>