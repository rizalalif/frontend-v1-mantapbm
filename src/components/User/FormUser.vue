<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import * as z from 'zod';
import { Password, useToast } from 'primevue';
// import InputPassword from 'primevue/inputpassword';

// ==========================================
// 1. DETEKSI MODE: Register vs Edit
// ==========================================
const formKey = ref(0);
const route = useRoute();
const router = useRouter();

const toast = useToast();
// Jika di URL ada ID (misal: /users/edit/123), maka ini mode Edit/Profile
const isEdit = computed(() => !!route.params.id);
const userId = computed(() => route.params.id);

// ==========================================
// 2. SKEMA ZOD: Form Utama
// ==========================================
// Password hanya wajib jika mode Register (!isEdit)
const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
];

const isMatch = computed(() => {
    return initialValues.value.password === initialValues.value.confirmPassword;
});

const payloadChangePassword = reactive({
    newPassword: '',
    confirmNewPassword: ''
})
const isMatchChangePassword = computed(() => {
    return payloadChangePassword.newPassword === payloadChangePassword.confirmNewPassword;
});
// const schema = z.object({
//     namaDepan: z.string().min(1, { message: 'Nama Depan wajib diisi' }),
//     namaBelakang: z.string().optional(),
//     email: z.string().email({ message: 'Format email tidak valid' }),
//     role: z.string(),
//     password: isEdit.value
//         ? z.string().optional() // Diabaikan saat mode Edit
//         : z.string().min(6, { message: 'Password minimal 6 karakter' }), // Wajib saat Register
//     confirmPassword: isEdit.value
//         ? z.string().optional() // Diabaikan saat mode Edit
//         : z.string().min(6, { message: 'Password minimal 6 karakter' }) // Wajib saat Register

// })
// .refine((data) => {
//     // LOGIKA PERBANDINGAN:
//     // Hanya lakukan pengecekan jika sedang berada di mode Register (!isEdit)
//     if (!isEdit.value) {
//         console.log(data.password === data.confirmPassword);
//         return data.password === data.confirmPassword;
//     }
//     return true; // Jika mode edit, selalu lolos (karena password tidak diubah di sini)

// }, {
//     // Pesan error ini akan muncul jika return bernilai 'false'
//     message: "Konfirmasi password tidak cocok",

//     // KUNCI PENTING: Arahkan pesan error ini agar muncul di bawah kotak input 'konfirmasiPassword'
//     path: ["confirmPassword"]
// });

const schemaUtama = computed(() => {
    return z.object({
        // Wajib sesuaikan dengan name di HTML, BUKAN fullName
        namaDepan: z.string().min(1, { message: 'Nama depan wajib diisi' }),
        namaBelakang: z.string().optional(), // Opsional sesuai kebutuhan

        // Aturan email ketat: Tidak boleh kosong & harus format email
        email: z.string()
            .min(1, { message: 'Email wajib diisi' })
            .email({ message: 'Format email tidak valid' }),

        role: z.string().min(1, { message: 'Role wajib dipilih' }),

        // Password dibuat opsional di level dasar
        password: z.string().optional().nullable(),
        confirmPassword: z.string().optional().nullable()

    }).superRefine((val, ctx) => {
        // LOGIKA: Jika di mode Register, Password WAJIB diisi
        if (!isEdit.value) {
            if (!val.password || val.password.length < 6) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Password minimal 6 karakter',
                    path: ['password']
                });
            }
            if (!val.confirmPassword || val.confirmPassword.length < 6) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Konfirmasi password wajib diisi',
                    path: ['confirmPassword']
                });
            }
            if (val.password && val.confirmPassword && val.password !== val.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Konfirmasi password tidak cocok',
                    path: ['confirmPassword']
                });
            }
        }
    });
});



const resolverUtama = computed(() => zodResolver(schemaUtama.value));

// State untuk memuat data awal di Form Utama
const initialValues = ref({
    fullName: '',
    namaDepan: '',
    namaBelakang: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
});

// ==========================================
// 3. SKEMA ZOD: Modal Ganti Password
// ==========================================
const schemaPassword = z.object({
    passwordBaru: z.string().min(6, { message: 'Password baru minimal 6 karakter' }),
    konfirmasiPassword: z.string()
}).refine(data => data.passwordBaru === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["konfirmasiPassword"]
});

const resolverPassword = ref(zodResolver(schemaPassword));
const showPasswordModal = ref(false);

// ==========================================
// 4. LOGIKA LOAD DATA & SUBMIT
// ==========================================
import { useBreadcrumb } from '@/composables/useBreadcrumb';

const { setUserName } = useBreadcrumb();

const fetchUserData = async () => {
    if (!isEdit.value) return; // Abaikan jika mode Register
    console.log('user selected', userId.value);

    try {
        const response = await api.get(`/users/${userId.value}`);
        console.log('user selected', response.data);
        const { id, fullName, email, role, createdAt } = response.data.data.users;
        if (fullName) {
            setUserName(fullName);
        }
        initialValues.value = {
            fullName: fullName,
            namaDepan: fullName ? fullName.split(' ')[0] : '',
            namaBelakang: fullName ? fullName.split(' ')[1] : '',
            email: email,
            role: role,
            password: '' // Kosongkan
        };
        formKey.value += 1;

    } catch (error) {
        console.error('Gagal mengambil profil user', error);
    }
};

onMounted(() => fetchUserData());

// Submit Form Utama (Info User)
const submitUtama = async (e) => {
    if (!e.valid) return;

    try {
        const url = isEdit.value
            ? `/users/${userId.value}` // PUT Edit User
            : `/users/register`;       // POST Register

        const { namaDepan, namaBelakang, email, role, password, confirmPassword } = { ...e.values };
        let payload = {
            fullName: `${namaDepan} ${namaBelakang}`,
            email,
            role,
            password,
            confirmPassword
        }

        if (isEdit.value) {
            payload = e.values
        }

        console.log("payload", payload);
        // return
        const method = isEdit.value ? 'put' : 'post';
        await api[method](url, payload);
        toast.add({ severity: 'success', summary: isEdit.value ? 'Data berhasil diupdate!' : 'User berhasil didaftarkan!', detail: '', life: 3000 });

        if (!isEdit.value) router.push('/user'); // Kembali ke tabel user jika selesai register

    } catch (error) {
        console.error(error);
    }
};

// Submit Form Modal Password
const submitGantiPassword = async (e) => {
    if (!e.valid) return;

    try {
        // Karena Admin yang mengganti, cukup kirim password baru (tidak perlu password lama)
        await api.put(`/users/${userId.value}/password`, {
            password: e.values.passwordBaru
        });

        toast.add({ severity: 'success', summary: 'Password berhasil diganti!', detail: '', life: 3000 });
        showPasswordModal.value = false; // Tutup modal
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Password gagal diganti!', detail: '', life: 3000 });

    }
};
</script>

<template>
    <Toast position="top-center" />
    <div
        class="max-w-full mx-auto bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
        <!-- Judul Dinamis -->
        <div class="flex justify-between">


            <h2 class="text-2xl font-bold text-slate-800 mb-6">
                {{ isEdit ? 'Profil & Pengaturan User' : 'Registrasi Akun' }}
            </h2>
            <button v-if="isEdit" @click="showPasswordModal = true" type="button"
                class="px-8 py-3.5 rounded-full text-sm font-bold text-blue-500 hover:bg-blue-50 transition-colors">
                Ganti Password
            </button>
        </div>

        <!-- FORM UTAMA -->
        <Form v-slot="$form" :key="formKey" :resolver="resolverUtama" :initialValues="initialValues"
            @submit="submitUtama" class="grid grid-cols-1 gap-3">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Depan
                    </label>
                    <InputText placeholder="Masukkan nama depan" name="namaDepan" :pt="{
                        root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                    }" />
                    <span v-if="$form.namaDepan?.invalid" class="text-red-500 text-xs">{{
                        $form.namaDepan.error?.message }}</span>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama
                        Belakang</label>
                    <InputText placeholder="Masukkan nama belakang" name="namaBelakang" :pt="{
                        root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                    }" />
                    <span v-if="$form.namaBelakang?.invalid" class="text-red-500 text-xs">{{
                        $form.namaBelakang.error?.message
                    }}</span>
                </div>
                <div class="flex flex-col gap-2">
                    <label
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <InputText placeholder="Masukkan email" name="email" :pt="{
                        root: [$field?.invalid ? '!border-red-500 !border-2 placeholder-slate-300!' : '!border-none !text-blue-950', 'w-full !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!']
                    }" />
                    <span v-if="$form.email?.invalid" class="text-red-500 text-xs">{{ $form.email.error?.message
                        }}</span>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                    <Select name="role" :options="roleOptions" optionLabel="label" optionValue="value"
                        placeholder="Pilih Role..." :pt="{
                            root: [$field?.invalid ? '!border-red-500 !border-2' : '!border-none', 'w-full !bg-slate-50 !rounded-xl !px-2 !py-1.5 !shadow-none focus:!ring-2 focus:!ring-orange-500 focus:!outline-none cursor-pointer'],
                            label: '!text-sm !font-bold !text-blue-950',
                            item: { class: '!text-sm !font-semibold !text-blue-950' }
                        }" />
                    <span v-if="$form.role?.invalid" class="text-red-500 text-xs">{{ $form.role.error?.message
                    }}</span>
                </div>
                <div v-if="!isEdit" class="flex flex-col gap-2">
                    <label
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <Password v-model="initialValues.password" name="password" :mask="mask" toggleMask :feedback="false"
                        inputClass="w-full! !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none border-none! text-blue-950! focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!" />
                    <span v-if="$form.password?.invalid" class="text-red-500 text-xs">{{ $form.password.error?.message
                        }}</span>
                    <span v-if="!isMatch" class="text-red-500 text-xs">Konfirmasi password tidak cocok</span>

                </div>
                <div v-if="!isEdit" class="flex flex-col gap-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Konfirmasi
                        Password</label>
                    <Password v-model="initialValues.confirmPassword" name="confirmPassword" :mask="mask" toggleMask
                        :feedback="false"
                        inputClass="w-full! !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none border-none! text-blue-950! focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!" />
                    <span v-if="!isMatch" class="text-red-500 text-xs">Konfirmasi password tidak cocok</span>
                </div>
            </div>

            <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <div class="flex items-center gap-4">


                    <button type="button" @click="$router.push({ name: 'user' })"
                        class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                        Batal
                    </button>
                    <button type="submit"
                        class="px-10 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5">
                        {{ isEdit ? 'Simpan Perubahan' : 'Buat Akun' }}
                    </button>
                </div>

            </div>
        </Form>
    </div>

    <!-- MODAL POP-UP (Hanya dirender jika mode edit) -->
    <Dialog v-if="isEdit" v-model:visible="showPasswordModal" header="Ganti Password" :modal="true"
        :style="{ width: '30rem' }">
        <Form v-slot="$formModal" :resolver="resolverPassword" @submit="submitGantiPassword"
            class="flex flex-col gap-4 mt-2">
            <div class="flex flex-col gap-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password
                    Baru</label>
                <!-- <label class="text-sm font-bold text-slate-700">Password Baru</label> -->
                <!-- <InputText type="password" name="passwordBaru" class="w-full" placeholder="Masukkan sandi baru" /> -->
                <Password name="passwordBaru" :mask="mask" toggleMask :feedback="false"
                    inputClass="w-full! !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none border-none! text-blue-950! focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!" />
                <span v-if="$formModal.passwordBaru?.invalid" class="text-red-500 text-xs">{{
                    $formModal.passwordBaru.error?.message }}</span>
            </div>

            <div class="flex flex-col gap-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Konfirmasi
                    Password</label>
                <!-- <label class="text-sm font-bold text-slate-700">Konfirmasi Password</label> -->
                <!-- <InputText type="password" name="konfirmasiPassword" class="w-full" placeholder="Ulangi sandi baru" /> -->
                <Password name="konfirmasiPassword" :mask="mask" toggleMask :feedback="false"
                    inputClass="w-full! !bg-slate-50 !rounded-xl !px-4 !py-3.5 !shadow-none border-none! text-blue-950! focus:!ring-2 focus:!ring-orange-500 focus:!outline-none text-sm font-bold text-blue-950 placeholder-slate-300!" />
                <span v-if="$formModal.konfirmasiPassword?.invalid" class="text-red-500 text-xs">{{
                    $formModal.konfirmasiPassword.error?.message }}</span>
            </div>

            <div class="flex justify-end gap-2 mt-4">
                <button type="button" @click="$router.push({ name: 'user' })"
                    class="px-8 py-3.5 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                    Batal
                </button>
                <button type="submit"
                    class="px-10 py-3.5 rounded-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-0.5">
                    Terapkan Sandi Baru
                </button>
            </div>
        </Form>
    </Dialog>
</template>