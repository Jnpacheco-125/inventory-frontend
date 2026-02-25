import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

// Garantir que os componentes existem antes de importar
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/raw-materials',
    name: 'RawMaterials',
    component: () => import('../views/RawMaterials.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.vue')
  },
  {
    path: '/optimize',
    name: 'Optimize',
    component: () => import('../views/Optimize.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;