<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/services/api';
import { useAuth } from '@/lib/Auth';

let mapInstance = null;
const auth = useAuth();
onMounted(async () => {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        if (mapElement._leaflet_id) {
            mapElement._leaflet_id = null;
        }
        mapInstance = L.map(mapElement).setView([0.5387, 116.4194], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mapInstance);

        const dataProyek = [
            {
                id_paket: "BM-2025-017",
                nama: "Long Bagun - Long Apung",
                lat: 0.816, lng: 114.331,
                status: "Terlambat",
                warna: "#ef4444"
            },
            {
                id_paket: "BM-2025-024",
                nama: "Muara Wahau - Bts. Kaltara",
                lat: 1.121, lng: 116.822,
                status: "Berjalan",
                warna: "#3b82f6"
            },
            {
                id_paket: "BM-2025-036",
                nama: "Kaubun - Long Iram",
                lat: 0.985, lng: 117.854,
                status: "Selesai",
                warna: "#22c55e"
            },
            {
                id_paket: "BM-2025-041",
                nama: "Batu Sopang - Tanjung Aru",
                lat: -1.916, lng: 115.908,
                status: "Berjalan",
                warna: "#3b82f6"
            },
            {
                id_paket: "BM-2025-058",
                nama: "Sepaku - Waru",
                lat: -0.932, lng: 116.745,
                status: "Berjalan",
                warna: "#3b82f6"
            }
        ];
        const response = await api.get("/dashboard/paket-location", { params: { tahun: 2026 } });

        const paketData = response.data.data;

        paketData.forEach(proyek => {
            if (proyek.latitude != "" && proyek.longitude != "") {

                L.circleMarker([parseFloat(proyek.latitude), parseFloat(proyek.longitude)], {
                    radius: 7,
                    fillColor: '#3b82f6',
                    color: "#ffffff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(mapInstance)
                    .bindPopup(`
            <div class="font-sans">
                <span class="text-[10px] font-bold text-gray-400">${proyek.name}</span>
                <h4 class="text-xs font-bold text-gray-800 mb-1 leading-tight">${proyek.city}</h4>
                <span class="${getStatusBadgeClass(proyek.statusKondisi)}">
                    ${proyek.statusKondisi}
                </span>
            </div>
        `);
            }
        });
    }
});

const getStatusBadgeClass = (status) => {
    if (!status) return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
    const s = String(status).toLowerCase();
    if (s.includes('terlambat') || s.includes('rendah') || s.includes('minus')) {
        return 'px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold';
    }
    if (s.includes('perhatian') || s.includes('tinggi') || s.includes('surplus')) {
        return 'px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold';
    }
    return 'px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold';
};

const loadMap = async () => {
    const dataProyek = [
        {
            id_paket: "BM-2025-017",
            nama: "Long Bagun - Long Apung",
            lat: 0.816, lng: 114.331,
            status: "Terlambat",
            warna: "#ef4444"
        },
        {
            id_paket: "BM-2025-024",
            nama: "Muara Wahau - Bts. Kaltara",
            lat: 1.121, lng: 116.822,
            status: "Berjalan",
            warna: "#3b82f6"
        },
        {
            id_paket: "BM-2025-036",
            nama: "Kaubun - Long Iram",
            lat: 0.985, lng: 117.854,
            status: "Selesai",
            warna: "#22c55e"
        },
        {
            id_paket: "BM-2025-041",
            nama: "Batu Sopang - Tanjung Aru",
            lat: -1.916, lng: 115.908,
            status: "Berjalan",
            warna: "#3b82f6"
        },
        {
            id_paket: "BM-2025-058",
            nama: "Sepaku - Waru",
            lat: -0.932, lng: 116.745,
            status: "Berjalan",
            warna: "#3b82f6"
        }
    ];


    const tahun = route.query.tahun || new Date().getFullYear();
    try {
        const response = await api.get("/dashboard/paket-location", { params: { tahun } });

        const paketData = response.data.data;

        const mapElement = document.getElementById('map');
        if (mapElement) {
            if (mapElement._leaflet_id) {
                mapElement._leaflet_id = null;
            }
            mapInstance = L.map(mapElement).setView([0.5387, 116.4194], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(mapInstance);



            paketData.forEach(proyek => {

                L.circleMarker([proyek.latitude, proyek.longitude], {
                    radius: 7,
                    fillColor: "#3b82f6",
                    color: "#ffffff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(mapInstance)
                    .bindPopup(`
            <div class="font-sans">
                <span class="text-[10px] font-bold text-gray-400">${proyek.id}</span>
                <h4 class="text-xs font-bold text-gray-800 mb-1 leading-tight">${proyek.city}</h4>
                <span class="text-[10px] px-2 py-0.5 rounded text-white" style="background-color: #3cb371;">
                    ${proyek.statusKondisi}
                </span>
            </div>
        `);
            });
        }

    } catch (error) {
        console.error("Gagal memuat data peta", error);
    }
}

onUnmounted(() => {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
});

</script>

<template>
    <div class="w-full h-[600px] bg-gray-200 relative rounded-2xl shadow-md overflow-hidden">
        <div id="map" class="w-full min-h-[600px] z-0">xxx</div>
    </div>
</template>