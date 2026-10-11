<template>
    <div class="flex flex-col gap-3">
        <!-- <UserHeader /> -->
        <UserTable :users="users" @delete-user="deleteUser" />
    </div>
</template>
<script setup>
import { useAuth } from '@/lib/Auth';
import api from '@/services/api';
import { ref, onMounted } from 'vue';
import UserHeader from './UserHeader.vue';
import UserTable from './UserTable.vue';
const auth = useAuth();
const users = ref([]);
const loading = ref(false);
const error = ref(false);
const errorMessage = ref("");

async function getUsers() {
    try {
        loading.value = true;
        error.value = false;
        if (auth.isLoggedIn) {
            const response = await api.get("/users");

            console.log("data paket 🚀🚀", response);
            users.value = response.data.data?.users;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        error.value = true;
        errorMessage.value = error.message || "Gagal memuat data paket";
    } finally {
        loading.value = false;
    }
}

const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        // console.log("Delete paket success 🚀:", response.data);
        await getUsers();
        // emit('refresh');
    } catch (error) {
        console.error("Error deleting progress:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Gagal menghapus data progress fisik");
    }
};

onMounted(() => {
    getUsers();
});
</script>
<style scoped></style>