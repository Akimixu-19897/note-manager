import { createRouter, createWebHistory } from 'vue-router'
import { BasicLayout } from '@/layouts/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_ROUTE),
  routes: [
    {
      path: '/',
      component: BasicLayout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          component: () => import('@/views/home/index.vue')
        }
      ]
    }
  ]
})

export default router
