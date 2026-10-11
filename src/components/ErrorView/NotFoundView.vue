<template>
    <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div class="bg-white p-8 rounded-xl shadow-md text-center">
            <h1 class="text-6xl font-bold text-red-600 mb-2">404</h1>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Not Found</h2>
            <!-- <p class="text-gray-600 mb-6">Anda tidak memiliki hak akses untuk melihat halaman ini.</p> -->
            <router-link to="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                Kembali ke Dashboard
            </router-link>
        </div>
    </div>
</template>
<script setup>

</script>
<style scoped></style>