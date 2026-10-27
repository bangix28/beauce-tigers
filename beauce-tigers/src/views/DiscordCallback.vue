<template>
  <div class="player-page container mx-auto px-4 py-16 max-w-lg">
    <Transition name="fade" mode="out-in">
      <section v-if="errorMessage" key="error" class="lan-panel callback" role="alert">
        <CircleAlert class="callback__icon text-[var(--lan-fail)]" aria-hidden="true" />
        <h2 class="lan-title mb-0">La connexion n'a pas abouti</h2>
        <p class="callback__message" data-test="callback-error">{{ errorMessage }}</p>
        <p class="lan-muted text-sm">Rien de grave : tu peux relancer la connexion en un clic.</p>
        <div class="flex flex-wrap justify-center gap-3 mt-2">
          <button
            type="button"
            class="lan-btn lan-btn--primary"
            data-test="callback-retry"
            @click="retry"
          >
            <LogIn class="w-4 h-4" aria-hidden="true" /> Réessayer avec Discord
          </button>
          <button
            type="button"
            class="lan-btn lan-btn--ghost"
            data-test="callback-home"
            @click="$router.replace('/')"
          >
            Retour à l'accueil
          </button>
        </div>
      </section>

      <section v-else key="loading" class="callback" role="status" aria-live="polite">
        <span class="callback__spinner motion-spinner" aria-hidden="true" />
        <h2 class="lan-title mb-0">On toque chez Discord…</h2>
        <p class="lan-muted">Une petite seconde, on vérifie que c'est bien toi.</p>
      </section>
    </Transition>
  </div>
</template>

<script>
import { CircleAlert, LogIn } from 'lucide-vue-next'
import { usePlayerAuthStore } from '@/stores/playerAuthStore'

const queryValue = (value) => (Array.isArray(value) ? value[0] : value) ?? null

// Retour de Discord : vérifie le state, puis échange le code contre le jeton du
// joueur. L'échange est dédoublonné par le store (code à usage unique).
export default {
  name: 'DiscordCallback',
  components: { CircleAlert, LogIn },
  created() {
    this.playerAuthStore = usePlayerAuthStore()
  },
  data() {
    return { errorMessage: null }
  },
  async mounted() {
    const outcome = await this.playerAuthStore.completeDiscordCallback({
      code: queryValue(this.$route.query.code),
      state: queryValue(this.$route.query.state),
      error: queryValue(this.$route.query.error)
    })

    if (outcome.kind === 'success') {
      // replace : le code consommé ne doit pas rester dans l'historique
      this.$router.replace(outcome.returnTo)
    } else if (outcome.kind === 'error') {
      this.errorMessage = outcome.message
    }
  },
  methods: {
    retry() {
      this.playerAuthStore.login('/')
    }
  }
}
</script>

<style scoped>
.player-page {
  color: var(--lan-ink);
  line-height: 1.5;
}

.callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-block: 2.5rem;
  text-align: center;
}

.callback__icon {
  width: 3rem;
  height: 3rem;
}

.callback__message {
  color: var(--lan-ink);
}

.callback__spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  border-width: 3px;
  color: var(--lan-tiger);
}
</style>
