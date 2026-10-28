<template>
  <div class="player-page container mx-auto px-4 py-6 max-w-2xl">
    <Transition name="fade" mode="out-in">
      <div v-if="loading" key="loading" aria-busy="true" class="space-y-6">
        <p class="sr-only" role="status">Chargement de ton profil…</p>
        <SkeletonCard variant="panel" :lines="3" />
        <SkeletonCard variant="panel" :lines="2" />
      </div>

      <section v-else-if="loadError" key="error" class="lan-panel profile-error" role="alert">
        <CircleAlert class="w-12 h-12 text-[var(--lan-fail)]" aria-hidden="true" />
        <h2 class="lan-title mb-0">Impossible de charger ton profil</h2>
        <p>{{ loadError }}</p>
        <button type="button" class="lan-btn lan-btn--primary" @click="load">
          <RefreshCw class="w-4 h-4" aria-hidden="true" /> Réessayer
        </button>
      </section>

      <div v-else-if="profile" key="profile" class="space-y-6">
        <section class="lan-panel">
          <h2 class="lan-title lan-title--gold">Mon profil</h2>
          <p class="flex items-center gap-2 text-lg">
            <UserRound class="w-5 h-5 text-[var(--lan-gold)]" aria-hidden="true" />
            {{ profile.discordUsername }}
          </p>

          <h3 class="profile-subtitle">Comptes Riot liés</h3>
          <TransitionGroup v-if="profile.riotIds.length" name="list" tag="ul" class="flex flex-wrap gap-2">
            <li v-for="riotId in profile.riotIds" :key="riotId" class="lan-chip">
              <Gamepad2 class="w-4 h-4 text-[var(--lan-gold)]" aria-hidden="true" /> {{ riotId }}
            </li>
          </TransitionGroup>
          <p v-else class="lan-muted" data-test="no-riot-account">
            Aucun compte lié pour l'instant : lie ton compte Riot pour participer aux défis de LAN.
          </p>
        </section>

        <form class="lan-panel" novalidate @submit.prevent="link">
          <h2 class="lan-title">Lier un compte Riot</h2>
          <label class="block mb-2 text-[var(--lan-ink-soft)]" for="riot-id">
            Ton Riot ID, tag compris
          </label>
          <input
            id="riot-id"
            v-model.trim="riotId"
            class="input w-full profile-input"
            placeholder="Pseudo#EUW"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :aria-invalid="linkError ? 'true' : 'false'"
            :aria-describedby="linkError ? 'link-hint link-error' : 'link-hint'"
          />
          <p id="link-hint" class="profile-warning">
            <TriangleAlert class="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            Vérifie bien avant de valider : une liaison ne se défait pas ici, seul un administrateur
            peut la corriger.
          </p>
          <button
            class="lan-btn lan-btn--primary mt-4"
            type="submit"
            :disabled="linking || !riotId"
            :aria-busy="linking ? 'true' : 'false'"
          >
            <span v-if="linking" class="motion-spinner" aria-hidden="true" />
            {{ linking ? 'Liaison en cours…' : 'Lier ce compte' }}
          </button>

          <Transition name="rise">
            <p
              v-if="linkError"
              id="link-error"
              class="profile-feedback profile-feedback--error"
              role="alert"
              data-test="link-error"
            >
              {{ linkError }}
            </p>
            <p v-else-if="linkedRiotId" class="profile-feedback profile-feedback--success" role="status">
              <CircleCheck class="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>
                C'est lié ! {{ linkedRiotId }} peut maintenant jouer les défis.
                <router-link to="/lan" class="profile-link">Direction les défis →</router-link>
              </span>
            </p>
          </Transition>
        </form>

        <section class="lan-panel agent-card">
          <PlugZap class="agent-card__icon" aria-hidden="true" />
          <div class="flex-1 min-w-0">
            <h2 class="lan-title mb-1">Connecter mon agent</h2>
            <p class="lan-muted">
              Le petit programme de LAN qui lit tes parties et verrouille les cartes. Un seul
              par partie suffit : si un joueur de ta partie a le sien, tu peux t'en passer.
            </p>
          </div>
          <router-link to="/agent" class="lan-btn lan-btn--ghost">Connecter</router-link>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script>
import {
  CircleAlert,
  CircleCheck,
  Gamepad2,
  PlugZap,
  RefreshCw,
  TriangleAlert,
  UserRound
} from 'lucide-vue-next'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { usePlayerAuthStore } from '@/stores/playerAuthStore'

// Complément affiché sous le message de l'API, selon le code d'erreur
const LINK_ERROR_HINTS = {
  riot_account_not_tracked:
    'Vérifie la saisie, ou demande à un administrateur d\'ajouter ce compte au site.',
  riot_account_already_linked: 'Seul un administrateur peut corriger cette liaison.'
}

export default {
  name: 'PlayerProfile',
  components: {
    CircleAlert,
    CircleCheck,
    Gamepad2,
    PlugZap,
    RefreshCw,
    SkeletonCard,
    TriangleAlert,
    UserRound
  },
  created() {
    this.playerAuthStore = usePlayerAuthStore()
  },
  data() {
    return {
      loading: true,
      loadError: null,
      riotId: '',
      linking: false,
      linkError: null,
      /** Riot ID tout juste lié, pour le message de succès */
      linkedRiotId: null
    }
  },
  computed: {
    profile() {
      return this.playerAuthStore.profile
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.loadError = null
      try {
        await this.playerAuthStore.fetchProfile()
      } catch (e) {
        this.loadError = e.message
      }
      this.loading = false
    },
    async link() {
      this.linking = true
      this.linkError = null
      this.linkedRiotId = null
      const riotId = this.riotId
      try {
        await this.playerAuthStore.linkRiotAccount(riotId)
        this.riotId = ''
        this.linkedRiotId = riotId
      } catch (e) {
        const hint = LINK_ERROR_HINTS[e.code]
        this.linkError = hint ? `${e.message} ${hint}` : e.message
      }
      this.linking = false
    }
  }
}
</script>

<style scoped>
.player-page {
  color: var(--lan-ink);
  line-height: 1.5;
}

.profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-block: 3rem;
  text-align: center;
}

.profile-subtitle {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.125rem;
  color: var(--lan-ink-soft);
}

.profile-input {
  min-height: 44px;
  font-size: 1rem;
}

.profile-warning {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.9375rem;
  color: var(--lan-ink-soft);
}

.profile-feedback {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
}

.profile-feedback--error {
  border: 1px solid rgba(232, 64, 87, 0.5);
  background: rgba(232, 64, 87, 0.08);
  color: #ffc9d0;
}

.profile-feedback--success {
  border: 1px solid rgba(10, 200, 185, 0.45);
  background: rgba(10, 200, 185, 0.08);
  color: var(--lan-ink);
}

.profile-feedback--success svg {
  color: var(--lan-success);
}

.profile-link {
  color: var(--lan-tiger);
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}

.profile-link:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
  border-radius: 4px;
}

.agent-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.agent-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  color: var(--lan-tiger);
}
</style>
