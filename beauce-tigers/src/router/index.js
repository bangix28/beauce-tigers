import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '@/views/Accueil.vue'
import { usePlayerAuthStore } from '@/stores/playerAuthStore'
import { CALLBACK_PATH, startDiscordLogin } from '@/utils/discordAuth'

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
    {
      path: '/courses',
      name: 'RankedRace',
      // Lazy aussi : la piste de course et ses tables n'ont rien à faire dans
      // le bundle de l'accueil
      component: () => import('@/views/RankedRace.vue')
    },
    {
      // Même constante que la vérification de VITE_DISCORD_REDIRECT_URI
      path: CALLBACK_PATH,
      name: 'DiscordCallback',
      component: () => import('@/views/DiscordCallback.vue')
    },
    {
      path: '/profil',
      name: 'PlayerProfile',
      component: () => import('@/views/PlayerProfile.vue'),
      meta: { requiresPlayer: true }
    },
    {
      // Pas de :lanId : la LAN du joueur vient de GET /me/lan-events/current
      path: '/lan',
      name: 'LanChallenges',
      component: () => import('@/views/LanChallenges.vue'),
      meta: { requiresPlayer: true }
    },
    {
      // URL affichée par l'agent de LAN (verificationUrl côté api-bot)
      path: '/agent',
      name: 'AgentConnect',
      component: () => import('@/views/AgentConnect.vue'),
      meta: { requiresPlayer: true }
    },
  ]
})

// Pages du joueur : sans jeton, on passe par Discord puis on revient sur la page
// demandée. Un jeton expiré est rattrapé au premier 401 par le client joueur.
router.beforeEach((to) => {
  if (!to.meta.requiresPlayer || usePlayerAuthStore().isLoggedIn) return true

  try {
    startDiscordLogin({ returnTo: to.fullPath })
  } catch (e) {
    console.error(e)
  }
  return false
})

export default router
