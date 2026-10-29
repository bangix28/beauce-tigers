<template>
  <Teleport to="body">
    <!-- Seul élément focusable : Tab reste sur le bouton tant que la pop-up est ouverte -->
    <div class="round-end" data-test="round-end" @keydown.esc="close" @keydown.tab.prevent>
      <div class="round-end__backdrop" aria-hidden="true" @click="close"></div>

      <section
        class="round-end__dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <FireworksBurst v-if="hasChampion" :key="game.gameId" class="round-end__fireworks" />

        <header class="round-end__header">
          <p class="round-end__kicker">Fin de manche</p>
          <h2 :id="titleId" class="round-end__title">{{ title }}</h2>
          <p v-if="game.roundBonus" class="round-end__bonus" data-test="round-end-bonus">
            <Users class="round-end__bonus-icon" aria-hidden="true" />
            Bonus de manche : tout le monde a réussi son défi !
          </p>
        </header>

        <!-- Podium : 2e, 1er, 3e, comme sur une vraie marche -->
        <ol class="round-end__podium" aria-label="Podium de la manche">
          <li
            v-for="step in podiumSteps"
            :key="step.round.key"
            class="podium-step"
            :class="[`podium-step--${step.slot}`, { 'podium-step--champion': step.champion }]"
            :data-test="step.champion ? 'podium-champion' : 'podium-step'"
          >
            <Crown v-if="step.champion" class="podium-step__crown" aria-hidden="true" />
            <span class="podium-step__name" :title="step.round.riotId">{{ who(step.round) }}</span>
            <span class="podium-step__points lan-points">
              {{ step.round.points > 0 ? `+${step.round.points}` : '0' }}
            </span>
            <span class="podium-step__block">
              <span class="podium-step__place">{{ step.place }}</span>
            </span>
          </li>
        </ol>

        <ul class="round-end__rounds">
          <li
            v-for="(entry, index) in podium"
            :key="entry.round.key"
            class="round-line"
            :style="{ '--line-index': index }"
          >
            <span class="round-line__who">{{ who(entry.round) }}</span>
            <span class="round-line__card" :class="`round-line__card--${entry.round.card.rarity}`">
              {{ entry.round.card.label }}
            </span>
            <span v-if="entry.round.curseApplied" class="round-line__curse">maudit</span>
            <span class="round-line__verdict" :class="`round-line__verdict--${entry.round.verdict}`">
              <component :is="verdictIcon(entry.round)" class="round-line__verdict-icon" aria-hidden="true" />
              <span v-if="entry.round.verdict === 'success'" class="lan-points">+{{ entry.round.points }}</span>
              <span v-else>{{ verdictLabel(entry.round) }}</span>
            </span>
          </li>
        </ul>

        <button ref="closeButton" type="button" class="lan-btn lan-btn--primary round-end__close" @click="close">
          {{ remaining > 0 ? 'Manche suivante' : 'Continuer' }}
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script>
import { CircleCheck, CircleHelp, CircleX, Crown, Users } from 'lucide-vue-next'
import FireworksBurst from '@/components/ui/FireworksBurst.vue'
import { roundPodium } from '@/utils/roundPodium'

const VERDICTS = {
  success: { icon: CircleCheck, label: 'réussi' },
  failure: { icon: CircleX, label: 'raté' },
  unknown: { icon: CircleHelp, label: 'inconnu' }
}

/** Ordre d'affichage des marches : 2e à gauche, 1er au centre, 3e à droite */
const STEP_SLOTS = ['first', 'second', 'third']
const VISUAL_ORDER = { second: 0, first: 1, third: 2 }

let uid = 0

// Résumé d'une manche qui vient d'être réglée : podium des points gagnés sur
// le match, feux d'artifice pour le meilleur score, détail de chaque joueur.
export default {
  name: 'RoundEndPopup',
  components: { Crown, FireworksBurst, Users },
  props: {
    /** Match réglé, au format de recapByGame */
    game: { type: Object, required: true },
    myRiotId: { type: String, default: null },
    /** Autres manches en attente derrière celle-ci */
    remaining: { type: Number, default: 0 }
  },
  emits: ['close'],
  data() {
    uid += 1
    return { titleId: `round-end-title-${uid}` }
  },
  computed: {
    podium() {
      return roundPodium(this.game)
    },
    podiumSteps() {
      return this.podium
        .slice(0, 3)
        .map((entry, index) => ({ ...entry, slot: STEP_SLOTS[index] }))
        .sort((a, b) => VISUAL_ORDER[a.slot] - VISUAL_ORDER[b.slot])
    },
    champions() {
      return this.podium.filter((entry) => entry.champion)
    },
    hasChampion() {
      return this.champions.length > 0
    },
    title() {
      if (!this.hasChampion) return 'Personne n\'a marqué cette manche'
      const names = this.champions.map((entry) => this.who(entry.round))
      if (names.length > 1) return `${names.join(' et ')} se partagent la manche !`
      return names[0] === 'Toi' ? 'Tu remportes la manche !' : `${names[0]} remporte la manche !`
    }
  },
  mounted() {
    this.previousFocus = document.activeElement
    this.$refs.closeButton?.focus()
  },
  beforeUnmount() {
    this.previousFocus?.focus?.()
  },
  methods: {
    who(round) {
      return this.myRiotId != null && round.riotId === this.myRiotId ? 'Toi' : round.riotId
    },
    verdictIcon(round) {
      return (VERDICTS[round.verdict] ?? VERDICTS.unknown).icon
    },
    verdictLabel(round) {
      return (VERDICTS[round.verdict] ?? VERDICTS.unknown).label
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.round-end {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.round-end__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 8, 16, 0.72);
  backdrop-filter: blur(3px);
  animation: round-end-fade var(--motion-base, 220ms) var(--ease-out, ease-out) both;
}

.round-end__dialog {
  position: relative;
  width: min(32rem, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.5rem 1.5rem 1.25rem;
  border: 1px solid var(--lan-line-strong);
  border-radius: var(--lan-radius);
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(242, 193, 78, 0.16), transparent 60%),
    var(--lan-surface);
  color: var(--lan-ink);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 40px rgba(240, 138, 36, 0.18);
  animation: round-end-pop var(--motion-slow, 420ms) var(--ease-spring, ease-out) both;
}

.round-end__dialog:focus {
  outline: none;
}

.round-end__fireworks {
  z-index: 0;
}

.round-end__header {
  position: relative;
  text-align: center;
}

.round-end__kicker {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--lan-tiger);
}

.round-end__title {
  margin-top: 0.25rem;
  font-family: var(--font-beaufort), serif;
  font-size: 1.5rem;
  line-height: 1.25;
  color: var(--lan-gold);
}

.round-end__bonus {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(10, 200, 185, 0.12);
  color: var(--lan-success);
  font-size: 0.875rem;
}

.round-end__bonus-icon {
  width: 1rem;
  height: 1rem;
}

/* --- Podium --- */
.round-end__podium {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem 0 1.25rem;
  padding: 0;
  list-style: none;
}

.podium-step {
  position: relative;
  display: flex;
  flex: 1 1 0;
  max-width: 9rem;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.podium-step__crown {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--lan-points);
  filter: drop-shadow(0 0 10px rgba(242, 193, 78, 0.6));
  animation: crown-drop 520ms var(--ease-spring, ease-out) 600ms both;
}

.podium-step__name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  font-size: 0.9rem;
}

.podium-step__points {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 1.15rem;
  animation: round-end-fade 260ms var(--ease-out, ease-out) var(--points-delay, 400ms) both;
}

.podium-step__block {
  display: grid;
  place-items: start center;
  width: 100%;
  height: var(--step-height);
  padding-top: 0.4rem;
  border: 1px solid var(--step-border);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(180deg, var(--step-top), var(--lan-surface-raised));
  transform-origin: bottom;
  animation: step-rise 420ms var(--ease-out, ease-out) var(--step-delay) both;
}

.podium-step__place {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--step-ink);
}

/* La 3e marche monte la première, la 1re en dernier : le suspense finit au centre */
.podium-step--first {
  --step-height: 6.5rem;
  --step-top: rgba(242, 193, 78, 0.35);
  --step-border: rgba(242, 193, 78, 0.6);
  --step-ink: var(--lan-points);
  --step-delay: 300ms;
  --points-delay: 650ms;
}

.podium-step--second {
  --step-height: 4.75rem;
  --step-top: rgba(217, 222, 229, 0.22);
  --step-border: rgba(217, 222, 229, 0.45);
  --step-ink: var(--lan-silver);
  --step-delay: 150ms;
  --points-delay: 500ms;
}

.podium-step--third {
  --step-height: 3.5rem;
  --step-top: rgba(208, 138, 82, 0.25);
  --step-border: rgba(208, 138, 82, 0.5);
  --step-ink: #e3a574;
  --step-delay: 0ms;
  --points-delay: 350ms;
}

.podium-step--champion .podium-step__block {
  box-shadow: 0 0 26px rgba(242, 193, 78, 0.35);
}

/* --- Détail des joueurs --- */
.round-end__rounds {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0 0 1.25rem;
  padding: 0;
  list-style: none;
}

.round-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: rgba(244, 233, 216, 0.04);
  font-size: 0.9rem;
  animation: line-in 260ms var(--ease-out, ease-out) calc(800ms + var(--line-index) * 70ms) both;
}

.round-line__who {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
}

.round-line__card {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--lan-ink-soft);
}

.round-line__card--gold {
  color: var(--lan-honey);
}

.round-line__card--prismatic {
  color: var(--lan-pearl-1);
}

.round-line__card--saboteur {
  color: var(--lan-ember);
}

.round-line__curse {
  padding: 0 0.4rem;
  border-radius: 9999px;
  background: var(--lan-curse-bg);
  color: var(--lan-curse);
  font-size: 0.75rem;
}

.round-line__verdict {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
  white-space: nowrap;
}

.round-line__verdict-icon {
  width: 1rem;
  height: 1rem;
}

.round-line__verdict--success .round-line__verdict-icon {
  color: var(--lan-success);
}

.round-line__verdict--failure {
  color: var(--lan-fail);
}

.round-line__verdict--unknown {
  color: var(--lan-unknown);
}

.round-end__close {
  position: relative;
  width: 100%;
}

@keyframes round-end-fade {
  from {
    opacity: 0;
  }
}

@keyframes round-end-pop {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.94);
  }
}

@keyframes step-rise {
  from {
    transform: scaleY(0);
  }
}

@keyframes crown-drop {
  from {
    opacity: 0;
    transform: translateY(-14px) rotate(-12deg) scale(1.4);
  }
}

@keyframes line-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .round-end__backdrop,
  .round-end__dialog,
  .podium-step__crown,
  .podium-step__points,
  .podium-step__block,
  .round-line {
    animation: none;
  }
}
</style>
