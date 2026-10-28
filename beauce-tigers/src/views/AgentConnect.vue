<template>
  <div class="player-page container mx-auto px-4 py-6 max-w-xl">
    <section class="lan-panel">
      <Transition name="pop" mode="out-in">
        <div
          v-if="pairing"
          key="success"
          class="agent-success"
          role="status"
          data-test="agent-success"
        >
          <span class="agent-success__badge" aria-hidden="true">
            <CircleCheck class="agent-success__icon" />
          </span>
          <h2 class="lan-title mb-0">Ton agent est prêt. Ferme cet onglet et va jouer.</h2>
          <p class="lan-muted">
            Connecté pour la LAN <strong class="text-[var(--lan-gold)]">{{ pairing.lan.name }}</strong>
          </p>
          <p v-if="pairing.player.riotIds.length" class="lan-muted text-sm">
            Compte suivi : {{ pairing.player.riotIds.join(', ') }}
          </p>
          <p class="lan-muted text-sm" data-test="agent-timing">
            Lance-le avant chaque partie : démarré après 90 s de jeu, la partie ne compte pour
            personne.
          </p>
        </div>

        <form v-else key="form" novalidate @submit.prevent="approve">
          <h2 class="lan-title lan-title--gold">Connecter mon agent</h2>
          <label for="agent-code" class="block mb-4 text-[var(--lan-ink-soft)]">
            Saisis le code affiché par l'agent de LAN sur ton PC.
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              id="agent-code"
              :value="userCode"
              class="input agent-code flex-1"
              placeholder="K7QF-92PZ"
              :maxlength="CODE_LENGTH"
              autocomplete="one-time-code"
              autocapitalize="characters"
              spellcheck="false"
              :aria-invalid="errorMessage ? 'true' : 'false'"
              :aria-describedby="errorMessage ? 'agent-error' : undefined"
              @input="onCodeInput"
            />
            <button
              class="lan-btn lan-btn--primary"
              type="submit"
              :disabled="submitting || !userCode.trim()"
              :aria-busy="submitting ? 'true' : 'false'"
            >
              <span v-if="submitting" class="motion-spinner" aria-hidden="true" />
              {{ submitting ? 'Connexion…' : 'Connecter' }}
            </button>
          </div>
          <Transition name="rise">
            <p
              v-if="errorMessage"
              id="agent-error"
              class="agent-error"
              role="alert"
              data-test="agent-error"
            >
              <CircleAlert class="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{{ errorMessage }}</span>
            </p>
          </Transition>
        </form>
      </Transition>
    </section>
  </div>
</template>

<script>
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
import { discordPlayerAPI } from '@/api/apiDiscordPlayer'

/** XXXX-XXXX : 8 caractères et le tiret */
const CODE_LENGTH = 9

// Messages imposés par le contrat ; à défaut, celui de l'API
const ERROR_MESSAGES = {
  invalid_user_code: 'Code inconnu ou expiré : relance la connexion depuis l\'agent',
  not_registered: 'Tu n\'es inscrit à aucune LAN en cours ou à venir'
}

/** Majuscules, sans espaces ni symboles, tiret posé après le 4e caractère */
const formatAgentCode = (raw) => {
  const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  return chars.length > 4 ? `${chars.slice(0, 4)}-${chars.slice(4)}` : chars
}

// Appairage de l'agent de LAN : le joueur, connecté avec Discord (garde du
// routeur), saisit le code affiché par l'agent
export default {
  name: 'AgentConnect',
  components: { CircleAlert, CircleCheck },
  data() {
    return {
      CODE_LENGTH,
      userCode: '',
      submitting: false,
      errorMessage: null,
      pairing: null
    }
  },
  methods: {
    onCodeInput(event) {
      this.userCode = formatAgentCode(event.target.value)
      // Le champ doit refléter la saisie mise en forme, même si la valeur n'a pas changé
      if (event.target.value !== this.userCode) event.target.value = this.userCode
    },
    async approve() {
      this.submitting = true
      this.errorMessage = null
      try {
        // Envoyée telle quelle : l'API normalise de toute façon casse, espaces et tiret
        this.pairing = await discordPlayerAPI.approveAgentDevice(this.userCode)
      } catch (e) {
        this.errorMessage = ERROR_MESSAGES[e.code] ?? e.message
      }
      this.submitting = false
    }
  }
}
</script>

<style scoped>
.player-page {
  color: var(--lan-ink);
  line-height: 1.5;
}

.agent-code {
  min-height: 44px;
  font-family: var(--font-beaufort), serif;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
  text-align: center;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

.agent-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(232, 64, 87, 0.5);
  border-radius: 10px;
  background: rgba(232, 64, 87, 0.08);
  color: #ffc9d0;
}

.agent-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-block: 1.5rem;
  text-align: center;
}

/* Le badge s'imprime avec un rebond, puis une onde turquoise s'en échappe une fois */
.agent-success__badge {
  position: relative;
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 9999px;
  background: rgba(10, 200, 185, 0.12);
  animation: agent-badge-in var(--motion-slow) var(--ease-spring) both;
}

.agent-success__badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--lan-success);
  opacity: 0;
  animation: agent-ripple 300ms var(--ease-out) 120ms;
}

.agent-success__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--lan-success);
}

@keyframes agent-badge-in {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}

@keyframes agent-ripple {
  from {
    transform: scale(1);
    opacity: 0.8;
  }
  to {
    transform: scale(1.6);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-success__badge,
  .agent-success__badge::after {
    animation: none;
  }
}
</style>
