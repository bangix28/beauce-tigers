<template>
  <Transition name="rise">
    <div v-if="updateAvailable" class="update-banner" role="status" data-test="update-banner">
      <RefreshCw class="update-banner__icon" aria-hidden="true" />
      <span class="update-banner__text">{{ text }}</span>
      <button type="button" class="lan-btn lan-btn--primary update-banner__reload" @click="reload">
        Recharger
      </button>
    </div>
  </Transition>
</template>

<script>
import { RefreshCw } from 'lucide-vue-next'

const CHECK_INTERVAL_MS = 5 * 60 * 1000

// Un onglet ouvert garde l'ancien JS après un déploiement. On compare de temps
// en temps le build chargé à celui publié (version.json) et on
// propose de recharger, sans le faire d'office : le joueur peut être en plein
// choix de carte.
export default {
  name: 'UpdateBanner',
  components: { RefreshCw },
  props: {
    /** Build du JS chargé ; 'dev' désactive la vérification */
    currentBuild: { type: String, default: __APP_BUILD__ },
    currentVersion: { type: String, default: __APP_VERSION__ }
  },
  data() {
    return { updateAvailable: false, deployedVersion: null }
  },
  computed: {
    text() {
      return this.deployedVersion && this.deployedVersion !== this.currentVersion
        ? `La version ${this.deployedVersion} du site est disponible.`
        : 'Une nouvelle version du site est disponible.'
    }
  },
  mounted() {
    // Un morceau de l'ancien build introuvable après un déploiement : la
    // navigation a déjà échoué, recharger est la seule issue
    window.addEventListener('vite:preloadError', this.reload)

    if (this.currentBuild === 'dev') return
    this.timer = setInterval(this.check, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  beforeUnmount() {
    window.removeEventListener('vite:preloadError', this.reload)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    clearInterval(this.timer)
  },
  methods: {
    async check() {
      if (this.updateAvailable) return
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
        if (!response.ok) return
        const { version, build } = await response.json()
        // Le build change à chaque déploiement, la version seulement à une sortie
        this.updateAvailable = typeof build === 'string' && build !== this.currentBuild
        this.deployedVersion = typeof version === 'string' ? version : null
      } catch {
        // Hors ligne ou serveur en maintenance : on retentera au prochain tour
      }
    },
    onVisibilityChange() {
      if (!document.hidden) this.check()
    },
    reload() {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.update-banner {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: max-content;
  max-width: calc(100vw - 2rem);
  padding: 0.6rem 0.6rem 0.6rem 1rem;
  border: 1px solid var(--lan-line-strong);
  border-radius: var(--lan-radius);
  background: var(--lan-surface-raised);
  color: var(--lan-ink);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
  transform: translateX(-50%);
}

.update-banner__icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: var(--lan-tiger);
}

.update-banner__text {
  font-size: 0.95rem;
  line-height: 1.4;
}

.update-banner__reload {
  min-height: 36px;
  padding: 0.4rem 1rem;
  flex-shrink: 0;
}

/* rise anime translateY : on garde le centrage horizontal pendant la transition */
.update-banner.rise-enter-from {
  transform: translate(-50%, 10px);
}

@media (max-width: 479px) {
  .update-banner {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }
}
</style>
