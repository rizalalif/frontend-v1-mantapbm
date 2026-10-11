<template>
    <div class="flex flex-col gap-3">
        <!-- <UserHeader /> -->
        <UserTable :users="users" @delete-user="deleteUser" />
    </div>
</template>
<script setup>
import { useAuth } from '@/lib/Auth';
import axios from 'axios';
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
            const response = await axios.get("http://100.114.142.21:3002/api/v1/users", {
                headers: {
                    // Authorization: `Bearer ${localStorage.getItem("token")}`
                    Authorization: `Bearer ${auth.state.token}`
                }
            });

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
        const response = await axios.delete(`http://100.114.142.21:3002/api/v1/users/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.state.token || localStorage.getItem('token')}`
            }
        });
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