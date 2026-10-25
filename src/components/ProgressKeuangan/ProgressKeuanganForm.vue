<script setup>
import { onMounted } from 'vue';
import ProgressKeuanganTable from './ProgressKeuanganTable.vue';

const props = defineProps({
    paket: Object
});

const emit = defineEmits(['refresh']);

onMounted(() => {
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