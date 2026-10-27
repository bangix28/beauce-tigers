<template>
  <div
    class="offer-picker"
    :class="{ 'offer-picker--shadow': shadowMode, 'offer-picker--confirming': selectedCard }"
    @keydown.esc="cancel"
  >
    <!-- Mode ombre : une carte saboteur est en main, l'écran s'assombrit sur les bords -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shadowMode" class="offer-shadow" aria-hidden="true"></div>
      </Transition>
    </Teleport>

    <div class="offer-picker__grid" role="radiogroup" aria-label="Ton offre de cartes">
      <div
        v-for="(card, slot) in offer"
        :key="slot"
        class="offer-slot"
        :class="{
          'offer-slot--selected': selectedSlot === slot,
          'offer-slot--dimmed': isDimmed(slot),
          'offer-slot--disabled': disabled
        }"
      >
        <LanCard
          :card="card"
          :selected="selectedSlot === slot"
          :face-down="!!faceDown[slot]"
          :dimmed="isDimmed(slot)"
        />

        <!-- La carte entière est le bouton de choix -->
        <button
          ref="cards"
          type="button"
          role="radio"
          class="offer-slot__hit"
          :aria-checked="selectedSlot === slot ? 'true' : 'false'"
          :aria-label="cardName(card)"
          :disabled="disabled"
          :data-test="`pick-${slot}`"
          @click="select(slot)"
          @keydown.right.prevent="focusCard(slot + 1)"
          @keydown.down.prevent="focusCard(slot + 1)"
          @keydown.left.prevent="focusCard(slot - 1)"
          @keydown.up.prevent="focusCard(slot - 1)"
        ></button>

        <button
          type="button"
          class="offer-slot__reroll"
          :class="{ 'offer-slot__reroll--busy': busy && rerollingSlot === slot }"
          :disabled="disabled || busy || rerollsLeft <= 0"
          :title="rerollsLeft > 0 ? 'Relancer cette carte' : 'Plus de relance'"
          :aria-label="rerollLabel"
          :data-test="`reroll-${slot}`"
          @click="reroll(slot)"
        >
          <RefreshCw class="offer-slot__reroll-icon" aria-hidden="true" />
          <span class="offer-slot__reroll-count" aria-hidden="true">{{ Math.max(rerollsLeft, 0) }}</span>
        </button>
      </div>
    </div>

    <!-- Confirmation : le choix est définitif. Ancrée sous l'offre, barre fixe sur mobile -->
    <Transition name="rise">
      <div
        v-if="selectedCard"
        class="offer-confirm"
        :class="{ 'offer-confirm--shadow': shadowMode }"
        data-test="pick-confirmation"
        role="region"
        aria-label="Confirmer ton choix"
      >
        <p class="offer-confirm__title">Tu joues « {{ selectedCard.label }} » ?</p>
        <p class="offer-confirm__text">
          Une fois choisie, impossible de revenir en arrière : c'est définitif.
          <template v-if="selectedCard.needsTarget">
            L'effet est immédiat, puis tu recevras une nouvelle offre pour ton match.
          </template>
        </p>
        <p v-if="shadowMode" class="offer-confirm__shadow-hint">
          <EyeOff class="offer-confirm__shadow-icon" aria-hidden="true" />
          Personne ne saura que c'était toi.
        </p>

        <TargetPicker
          v-if="selectedCard.needsTarget"
          v-model="target"
          class="offer-confirm__targets"
          :card="selectedCard"
          :targets="targets"
        />

        <div class="offer-confirm__actions">
          <button
            type="button"
            class="lan-btn lan-btn--primary"
            :class="{ 'offer-confirm__go--shadow': shadowMode }"
            :disabled="disabled || busy || (selectedCard.needsTarget && !target)"
            :aria-busy="busy ? 'true' : undefined"
            data-test="confirm-pick"
            @click="confirm"
          >
            <template v-if="busy">
              <LoaderCircle class="w-4 h-4 lan-spin" aria-hidden="true" />
              Ça mélange…
            </template>
            <template v-else>{{ confirmLabel }}</template>
          </button>
          <button type="button" class="lan-btn lan-btn--ghost" @click="cancel">
            Je réfléchis encore
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { EyeOff, LoaderCircle, RefreshCw } from 'lucide-vue-next'
import LanCard from '@/components/lan/LanCard.vue'
import TargetPicker from '@/components/lan/TargetPicker.vue'

// Distribution : délai avant le premier retournement, puis cascade carte par carte
const DEAL_DELAY_MS = 140
const DEAL_STAGGER_MS = 80

// Libellé du bouton de confirmation par code de carte qui vise un joueur
const TARGET_ACTIONS = {
  pickpocket: (riotId) => `Faire les poches à ${riotId}`,
  curse: (riotId) => `Maudire ${riotId}`
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// L'offre de 3 cartes : choix (avec confirmation, et cible si besoin) ou relance
export default {
  name: 'OfferPicker',
  components: { EyeOff, LanCard, LoaderCircle, RefreshCw, TargetPicker },
  props: {
    offer: { type: Array, required: true },
    rerollsLeft: { type: Number, required: true },
    targets: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    /** Action en cours : spinner dans le bouton cliqué */
    busy: { type: Boolean, default: false }
  },
  emits: ['pick', 'reroll'],
  data() {
    return {
      selectedSlot: null,
      target: null,
      /** Emplacements encore face cachée pendant la distribution */
      faceDown: [],
      /** Emplacement dont la relance est en cours (icône qui tourne) */
      rerollingSlot: null
    }
  },
  computed: {
    selectedCard() {
      return this.selectedSlot == null ? null : (this.offer[this.selectedSlot] ?? null)
    },
    /**
     * Contenu de l'offre et non sa référence : la relecture toutes les 15 s
     * renvoie un nouveau tableau identique, qui ne doit pas fermer la confirmation
     */
    offerKey() {
      return this.offer.map((card) => card.code).join('|')
    },
    shadowMode() {
      return this.selectedCard?.rarity === 'saboteur'
    },
    confirmLabel() {
      const card = this.selectedCard
      if (!card?.needsTarget) return 'Oui, je la joue'
      if (!this.target) return "Choisis d'abord ta cible"
      const action = TARGET_ACTIONS[card.code]
      return action ? action(this.target) : `Viser ${this.target}`
    },
    rerollLabel() {
      if (this.rerollsLeft <= 0) return 'Relancer cette carte (plus de relance)'
      const left = this.rerollsLeft === 1 ? '1 relance' : `${this.rerollsLeft} relances`
      return `Relancer cette carte (il te reste ${left})`
    }
  },
  watch: {
    // Offre remplacée (relance, nouvelle manche) : l'ancienne sélection ne vaut plus
    offerKey() {
      this.cancel()
      this.rerollingSlot = null

      // Nouvelle offre : toutes les cartes sont redistribuées ; relance : seulement la carte remplacée
      const codes = this.offer.map((card) => card.code)
      const changed = codes
        .map((code, slot) => (code !== this.dealtCodes[slot] ? slot : null))
        .filter((slot) => slot != null)
      this.dealtCodes = codes
      this.deal(changed.length === codes.length ? codes.map((_, slot) => slot) : changed)
    },
    busy(value) {
      if (!value) this.rerollingSlot = null
    }
  },
  created() {
    this.timers = []
    this.dealtCodes = this.offer.map((card) => card.code)
    this.deal(this.offer.map((_, slot) => slot))
  },
  beforeUnmount() {
    this.timers.forEach(clearTimeout)
  },
  methods: {
    deal(slots) {
      if (prefersReducedMotion()) return
      slots.forEach((slot, order) => {
        this.faceDown[slot] = true
        this.timers.push(
          setTimeout(() => {
            this.faceDown[slot] = false
          }, DEAL_DELAY_MS + order * DEAL_STAGGER_MS)
        )
      })
    },
    isDimmed(slot) {
      return this.selectedSlot != null && this.selectedSlot !== slot
    },
    cardName(card) {
      return card.points ? `${card.label}, ${card.points} points` : card.label
    },
    focusCard(slot) {
      const cards = this.$refs.cards ?? []
      cards[(slot + cards.length) % cards.length]?.focus()
    },
    select(slot) {
      if (this.disabled) return
      if (this.selectedSlot === slot) return
      this.selectedSlot = slot
      this.target = null
    },
    cancel() {
      this.selectedSlot = null
      this.target = null
    },
    reroll(slot) {
      this.rerollingSlot = slot
      this.$emit('reroll', slot)
    },
    confirm() {
      const payload = { slot: this.selectedSlot }
      if (this.selectedCard.needsTarget) payload.target = this.target
      this.$emit('pick', payload)
    }
  }
}
</script>

<style scoped>
.offer-picker {
  position: relative;
}

/* Au-dessus de la vignette du mode ombre */
.offer-picker--shadow {
  z-index: 31;
}

.offer-picker__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .offer-picker__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

.offer-slot {
  position: relative;
  border-radius: var(--lan-radius);
  /* Place pour le jeton de relance posé à cheval sur le bord bas */
  margin-bottom: 1.4rem;
}

/* Bouton invisible tendu sur toute la carte */
.offer-slot__hit {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--lan-radius);
  background: transparent;
  cursor: pointer;
}

.offer-slot__hit:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
}

.offer-slot__hit:disabled {
  cursor: not-allowed;
}

/* La carte réagit au survol de son bouton : soulèvement, lueur chaude, reflet */
.offer-slot:not(.offer-slot--disabled):not(.offer-slot--selected):hover :deep(.lan-card:not(.lan-card--dimmed)),
.offer-slot:not(.offer-slot--selected):focus-within :deep(.lan-card:not(.lan-card--dimmed)) {
  transform: translateY(-4px);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.4),
    0 0 26px var(--lan-tiger-glow);
}

.offer-slot:not(.offer-slot--disabled):hover :deep(.lan-card__sheen) {
  background-position: 0 0;
}

.offer-slot--dimmed:hover :deep(.lan-card) {
  opacity: 0.7;
}

/* Pression sur la carte (pas sur sa relance) */
.offer-slot:has(> .offer-slot__hit:active:not(:disabled)) :deep(.lan-card) {
  transform: scale(0.97);
  transition-duration: var(--motion-press, 120ms);
}

/* Relance : jeton à cheval sur le bord bas de la carte, sans masquer les points */
.offer-slot__reroll {
  position: absolute;
  bottom: -1.4rem;
  left: 50%;
  translate: -50% 0;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.6rem;
  border: 1px solid var(--lan-line-strong);
  border-radius: 9999px;
  background: var(--lan-surface-raised);
  color: var(--lan-ink);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition:
    transform var(--motion-press, 120ms) var(--ease-out, ease-out),
    border-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    background-color var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.offer-slot__reroll:hover:not(:disabled) {
  border-color: var(--lan-tiger);
  background: #2a2f45;
}

.offer-slot__reroll:hover:not(:disabled) .offer-slot__reroll-icon {
  transform: rotate(90deg);
}

.offer-slot__reroll:active:not(:disabled) {
  transform: scale(0.94);
}

.offer-slot__reroll:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
}

.offer-slot__reroll:disabled {
  cursor: not-allowed;
  color: var(--lan-ink-mute);
  box-shadow: none;
}

.offer-slot__reroll-icon {
  width: 1.05rem;
  height: 1.05rem;
  transition: transform var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.offer-slot__reroll--busy .offer-slot__reroll-icon {
  animation: offer-spin 0.8s linear infinite;
}

.offer-slot__reroll-count {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

/* --- Confirmation --- */
.offer-confirm {
  position: sticky;
  bottom: 1rem;
  z-index: 20;
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--lan-line-strong);
  border-top: 3px solid var(--lan-tiger);
  border-radius: var(--lan-radius);
  background: var(--lan-surface-raised);
  color: var(--lan-ink);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}

.offer-confirm--shadow {
  border-top-color: var(--lan-ember);
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(255, 107, 61, 0.14), transparent 60%),
    #1e1418;
}

.offer-confirm__title {
  margin-bottom: 0.25rem;
  font-family: var(--font-beaufort), serif;
  font-size: 1.3rem;
  line-height: 1.3;
}

.offer-confirm__text {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--lan-ink-soft);
}

.offer-confirm__shadow-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: -0.5rem 0 1rem;
  font-size: 0.9rem;
  color: #ffb59c;
}

.offer-confirm__shadow-icon {
  width: 1rem;
  height: 1rem;
}

.offer-confirm__targets {
  margin-bottom: 1.25rem;
}

.offer-confirm__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.offer-confirm__go--shadow {
  background: var(--lan-ember);
  box-shadow: 0 6px 18px rgba(255, 107, 61, 0.3);
}

.offer-confirm__go--shadow:hover:not(:disabled) {
  background: #e4552a;
}

/* Mobile : barre fixe en bas, l'offre garde de la place pour ne pas être masquée */
@media (max-width: 639px) {
  .offer-picker--confirming {
    padding-bottom: 14rem;
  }

  .offer-confirm {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    max-height: 75vh;
    overflow-y: auto;
    margin: 0;
    padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom));
    border-radius: var(--lan-radius) var(--lan-radius) 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }

  .offer-confirm__actions .lan-btn {
    flex: 1 1 auto;
  }
}

/* --- Vignette du mode ombre --- */
.offer-shadow {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  background:
    radial-gradient(ellipse 75% 70% at 50% 45%, transparent 40%, rgba(20, 6, 4, 0.55) 75%, rgba(8, 2, 2, 0.85) 100%),
    radial-gradient(ellipse at 50% 120%, rgba(255, 107, 61, 0.12), transparent 60%);
}

@keyframes offer-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .offer-slot:hover :deep(.lan-card),
  .offer-slot:focus-within :deep(.lan-card),
  .offer-slot:has(> .offer-slot__hit:active) :deep(.lan-card),
  .offer-slot__reroll:active:not(:disabled),
  .offer-slot__reroll:hover:not(:disabled) .offer-slot__reroll-icon {
    transform: none !important;
  }

  .offer-slot__reroll--busy .offer-slot__reroll-icon {
    animation: none;
  }
}
</style>
