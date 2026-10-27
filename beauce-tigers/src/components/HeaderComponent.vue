<template>
  <div>
    <header class="site-header bg-lol-darker border-b border-gray-800 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-3 min-w-0 site-header__brand">
          <img src="@/assets/img/logo_header.svg" class="site-header__logo" alt="" />
          <h1 class="text-lg md:text-2xl font-bold text-lol-gold truncate">
            Beauce Tigers Leaderboard
          </h1>
        </router-link>

        <!-- À partir de 768 px : tout tient sur une ligne -->
        <div class="hidden md:flex items-center gap-6">
          <nav class="flex items-center gap-1" aria-label="Navigation principale">
            <router-link
              v-for="item in visibleMenuItems"
              :key="item.to"
              :to="item.to"
              class="nav-link group"
              exact-active-class="nav-link--active"
            >
              {{ item.label }}
              <span class="nav-link__underline" aria-hidden="true" />
            </router-link>
          </nav>

          <!-- Joueur connecté par Discord : jeton distinct du compte API des classements -->
          <div v-if="playerAuthStore.isLoggedIn" class="flex items-center gap-1">
            <router-link to="/profil" class="icon-link" title="Mon profil">
              <UserRound class="w-4 h-4" aria-hidden="true" />
              <span class="text-sm">{{ playerName }}</span>
            </router-link>
            <button
              type="button"
              class="icon-button"
              aria-label="Se déconnecter"
              title="Se déconnecter"
              @click="logout"
            >
              <LogOut class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <button v-else type="button" class="discord-button" @click="login">
            <LogIn class="w-4 h-4" aria-hidden="true" />
            Connexion avec Discord
          </button>
        </div>

        <!-- Sous 768 px : burger -->
        <button
          type="button"
          class="icon-button mobile-only"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
          @click="menuOpen = !menuOpen"
        >
          <Transition name="pop" mode="out-in">
            <X v-if="menuOpen" key="close" class="w-6 h-6" aria-hidden="true" />
            <Menu v-else key="open" class="w-6 h-6" aria-hidden="true" />
          </Transition>
        </button>
      </div>

      <Transition name="collapse">
        <div v-if="menuOpen" id="mobile-menu" class="mobile-only">
          <div>
            <nav
              class="container mx-auto px-4 pb-4 flex flex-col gap-1 border-t border-gray-800 pt-3"
              aria-label="Navigation principale"
            >
              <router-link
                v-for="item in visibleMenuItems"
                :key="item.to"
                :to="item.to"
                class="mobile-link"
                exact-active-class="mobile-link--active"
              >
                {{ item.label }}
              </router-link>

              <template v-if="playerAuthStore.isLoggedIn">
                <router-link to="/profil" class="mobile-link" exact-active-class="mobile-link--active">
                  <UserRound class="w-4 h-4" aria-hidden="true" /> {{ playerName }}
                </router-link>
                <button type="button" class="mobile-link" @click="logout">
                  <LogOut class="w-4 h-4" aria-hidden="true" /> Se déconnecter
                </button>
              </template>
              <button v-else type="button" class="discord-button mt-2" @click="login">
                <LogIn class="w-4 h-4" aria-hidden="true" />
                Connexion avec Discord
              </button>
            </nav>
          </div>
        </div>
      </Transition>
    </header>
  </div>
</template>

<script>
import { LogIn, LogOut, Menu, UserRound, X } from 'lucide-vue-next'
import { usePlayerAuthStore } from '@/stores/playerAuthStore'

export default {
  components: { LogIn, LogOut, Menu, UserRound, X },
  created() {
    this.playerAuthStore = usePlayerAuthStore()
  },
  data() {
    return {
      // Objets et non libellés seuls : l'ancienne dérivation d'URL par
      // toLowerCase() cassait dès qu'un libellé contenait un espace ou un accent.
      // « Mon agent » n'y figure plus : on y accède depuis le profil.
      menuItems: [
        { label: 'Tableau de bord', to: '/' },
        { label: 'Courses', to: '/courses' },
        { label: 'Défis LAN', to: '/lan', player: true }
      ],
      menuOpen: false
    };
  },
  computed: {
    visibleMenuItems() {
      return this.menuItems.filter((item) => !item.player || this.playerAuthStore.isLoggedIn)
    },
    playerName() {
      return this.playerAuthStore.profile?.discordUsername ?? 'Mon profil'
    }
  },
  watch: {
    // Une navigation referme le menu mobile
    $route() {
      this.menuOpen = false
    }
  },
  methods: {
    login() {
      // On revient sur la page en cours, sauf la page de retour elle-même
      const returnTo = this.$route.name === 'DiscordCallback' ? '/' : this.$route.fullPath
      this.playerAuthStore.login(returnTo)
    },
    logout() {
      this.menuOpen = false
      this.playerAuthStore.logout()
      if (this.$route.meta.requiresPlayer) this.$router.push('/')
    }
  }
};
</script>

<style scoped>
.site-header__logo {
  width: 3rem;
  height: auto;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .site-header__logo {
    width: 4.5rem;
  }

  /* Pas md:hidden : les utilitaires Tailwind 4 vivent dans un @layer, que
     n'importe quel display de ce style scoped (.icon-button…) écrase */
  .mobile-only {
    display: none !important;
  }
}

.site-header__brand:focus-visible,
.nav-link:focus-visible,
.icon-link:focus-visible,
.icon-button:focus-visible,
.mobile-link:focus-visible,
.discord-button:focus-visible {
  outline: 2px solid var(--lan-tiger, #f08a24);
  outline-offset: 3px;
  border-radius: 10px;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0.75rem;
  color: #d1d5db;
  transition: color var(--motion-base) var(--ease-out);
}

.nav-link:hover,
.nav-link--active {
  color: var(--color-lol-gold);
}

.nav-link__underline {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.4rem;
  height: 2px;
  background: var(--color-lol-gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--motion-base) var(--ease-out);
}

.nav-link:hover .nav-link__underline,
.nav-link--active .nav-link__underline {
  transform: scaleX(1);
}

.icon-link,
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.625rem;
  border-radius: 10px;
  color: #d1d5db;
  transition: color var(--motion-base) var(--ease-out), background-color var(--motion-base) var(--ease-out);
}

.icon-link:hover,
.icon-button:hover {
  color: var(--color-lol-gold);
  background: rgba(200, 170, 110, 0.08);
}

/* Bouton Discord : le bleu de la marque, mais une lueur orange tigre au survol */
.discord-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1.125rem;
  border-radius: 9999px;
  background: #5865f2;
  color: #fff;
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 0.9375rem;
  box-shadow: 0 0 0 0 rgba(240, 138, 36, 0);
  transition:
    background-color var(--motion-base) var(--ease-out),
    box-shadow var(--motion-base) var(--ease-out),
    transform var(--motion-press) var(--ease-out);
}

.discord-button:hover {
  background: #4752c4;
  box-shadow: 0 0 0 3px rgba(240, 138, 36, 0.35), 0 8px 20px -8px rgba(88, 101, 242, 0.6);
}

.discord-button:active {
  transform: scale(0.97);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.75rem;
  border-radius: 10px;
  color: #d1d5db;
  text-align: left;
}

.mobile-link:hover,
.mobile-link--active {
  color: var(--color-lol-gold);
  background: rgba(200, 170, 110, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .discord-button:active {
    transform: none;
  }

  .nav-link__underline {
    transition: none;
  }
}
</style>
