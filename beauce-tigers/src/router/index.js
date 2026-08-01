import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '@/views/Accueil.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Le carrousel d'historique peut être scrollé en bas de page :
  // on remonte en haut en arrivant sur le détail d'un match, mais
  // back/forward navigateur restaure la position sauvegardée
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Accueil',
      component: Accueil
    },
    {
      path: '/match/:id',
      name: 'MatchDetails',
      // Lazy : la page match (et Chart.js) ne pèse pas sur le bundle de l'accueil
      component: () => import('@/views/MatchDetails.vue'),
      props: true
    },
    {
      path: '/account/:id',
      name: 'AccountDetails',
      // Lazy pour la même raison : la courbe d'elo embarque Chart.js
      component: () => import('@/views/AccountDetails.vue'),
      props: true
    },
  ]
})

export default router
