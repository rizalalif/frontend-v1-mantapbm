import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/NewLayout.vue'
import DashboardLayout from '@/components/NewDashboardLayout.vue'
import PaketPekerjaan from '@/components/Paket/PaketPekerjaan.vue'
import Dashboard from '@/components/NewDashboard.vue'
import Maps from '@/components/Maps.vue'
import PaketDetail from '@/components/Paket/PaketDetail.vue'
import AddPaket from '@/components/Paket/AddPaket.vue'
import ProgressFisik from '@/components/ProgressFisik/ProgressFisik.vue'
import ProgressKeuangan from '@/components/ProgressKeuangan/ProgressKeuangan.vue'
import { useAuth } from '@/lib/Auth.js'
import UnauthorizedView from '@/components/ErrorView/UnauthorizedView.vue'
import NotFoundView from '@/components/ErrorView/NotFoundView.vue'
import { jwtDecode } from 'jwt-decode'
import User from '@/components/User/User.vue'
import UserLogin from '@/components/User/UserLogin.vue'
import UserRegister from '@/components/User/UserRegister.vue'
import FormUser from '@/components/User/FormUser.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
      redirect: { name: 'home' },
      children: [
        {
          path: '/login',
          name: 'login',
          component: UserLogin,
          meta: {
            requiresAuth: false,
          }
        },
      ],
    },
    {
      path: '/403',
      name: 'unauthorized',
      component: UnauthorizedView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
    },
    {
      path: '/home',
      name: 'home',
      redirect: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: {
            requiresAuth: true,
          }
        },
        {
          path: '/paket',
          name: 'paket',
          component: PaketPekerjaan,
          meta: {
            requiresAuth: true,
          }
        },
        {
          path: '/paket/:kodePaket',
          name: 'paket-detail',
          component: PaketDetail,
          props: true,
          meta: {
            requiresAuth: true,
          }
        },
        {
          path: '/paket/add',
          name: 'paket-add',
          component: PaketDetail,
          meta: {
            requiresAuth: true,
          }

        },
        {
          path: '/progress-fisik',
          name: 'progress-fisik',
          component: ProgressFisik,
          meta: {
            requiresAuth: true,
            roles: ['admin']
          }
        },
        {
          path: '/progress-keuangan',
          name: 'progress-keuangan',
          component: ProgressKeuangan,
          meta: {
            requiresAuth: true,
            roles: ['admin']
          }
        },
        {
          path: '/peta-proyek',
          name: 'peta-proyek',
          component: Maps,
          meta: {
            requiresAuth: true,
          }
        },
        {
          path: '/kendala',
          name: 'kendala',
          component: PaketPekerjaan,
          meta: {
            requiresAuth: true,
          }
        },
        {
          path: '/dokumentasi',
          name: 'dokumentasi',
          component: PaketPekerjaan,
        },
        {
          path: '/user',
          name: 'user',
          component: User,
          meta: {
            requiresAuth: true,
            roles: ['admin']
          }
        },
        {
          path: '/user/register',
          name: 'user-register',
          component: FormUser,
          meta: {
            requiresAuth: true,
            roles: ['admin']
          }
        },
        {
          path: '/user/edit/:id',
          name: 'edit-user',
          component: FormUser,
          props: true,
          meta: {
            requiresAuth: true,
            roles: ['admin']
          }
        },
      ],
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuth();

  // Perhatikan penggunaan .value karena isLoggedIn & userRole adalah computed property
  const isAuth = auth.isLoggedIn.value;
  const userRole = auth.userRole.value;

  // 1. Jika halaman butuh login dan user belum login
  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: 'login' });
  }

  if (auth.state.token && typeof auth.state.token === 'string') {
    try {
      const decoded = jwtDecode(auth.state.token);
      const currentTime = Date.now() / 1000; // In seconds
      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('token');
        return next({ name: 'login' });
      }
      // 2. Jika halaman butuh role khusus, cek apakah role user ada di dalam daftar
      if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        return next({ name: 'unauthorized' });
      }
      // 3. Lolos semua pengecekan
      next();
    } catch (error) {
      next();
    }
  } else {
    // No valid token, proceed without decoding
    next();
  }
}
);


export default router
