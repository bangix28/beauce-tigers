<template>
  <div
    class="round-result"
    :class="[`round-result--${verdictKey}`, { 'round-result--prismatic-miss': prismaticMiss }]"
    :data-verdict="result.verdict"
    role="status"
  >
    <div class="round-result__card">
      <LanCard :card="result.card" compact />
    </div>

    <div class="round-result__body">
      <p class="round-result__title">
        <component :is="verdict.icon" class="round-result__icon" aria-hidden="true" />
        {{ verdict.title }}
      </p>

      <p v-if="result.verdict === 'success'" class="round-result__score">
        <template v-if="result.curseApplied">
          <s class="round-result__was" aria-hidden="true">{{ result.card.points }} pts</s>
          <ArrowRight class="round-result__arrow" aria-hidden="true" />
        </template>
        <span
          class="round-result__points"
          :class="{ 'round-result__points--cursed': result.curseApplied }"
          aria-hidden="true"
        >
          +{{ shownPoints }}<span class="round-result__unit"> pts</span>
        </span>
        <span class="sr-only">
          +{{ result.points }} pts<template v-if="result.curseApplied">
            au lieu de {{ result.card.points }}</template>
        </span>
      </p>

      <p v-if="detail" class="round-result__detail">{{ detail }}</p>

      <div v-if="result.curseApplied" class="round-result__curse">
        <p class="round-result__curse-hook">Quelqu'un t'avait maudit…</p>
        <p class="round-result__curse-text" data-test="curse-applied">
          <Biohazard class="round-result__curse-icon" aria-hidden="true" />
          Tu étais maudit : {{ curseLabel }}.
        </p>
      </div>

      <p v-if="result.roundBonus" class="round-result__bonus" data-test="round-bonus">
        <Users class="round-result__bonus-icon" aria-hidden="true" />
        Bonus de manche{{ roundBonusPercent != null ? ` +${roundBonusPercent} %` : '' }} : toute
        l'équipe engagée sur ce match a réussi.
      </p>
    </div>
  </div>
</template>

<script>
import { ArrowRight, Biohazard, CircleCheck, CircleHelp, CircleX, Users } from 'lucide-vue-next'
import LanCard from '@/components/lan/LanCard.vue'
import { animateCount } from '@/composables/useCountUp'
import { curseEffectLabel } from '@/utils/lanRunState'

// Le verdict vient de l'API : on ne fait que le mettre en mots
const VERDICTS = {
  success: { title: 'Bien joué !', icon: CircleCheck },
  failure: { title: 'Défi raté', icon: CircleX },
  unknown: { title: 'Résultat inconnu', icon: CircleHelp }
}

export default {
  name: 'RoundResultCard',
  components: { ArrowRight, Biohazard, LanCard, Users },
  props: {
    result: { type: Object, required: true },
    /** Catalogue (règles) : pourcentages du bonus et de la malédiction */
    catalogue: { type: Object, default: null }
  },
  data() {
    return { shownPoints: 0 }
  },
  computed: {
    verdictKey() {
      return VERDICTS[this.result.verdict] ? this.result.verdict : 'unknown'
    },
    verdict() {
      return VERDICTS[this.verdictKey]
    },
    prismaticMiss() {
      return this.verdictKey === 'failure' && this.result.card.rarity === 'prismatic'
    },
    detail() {
      if (this.verdictKey === 'failure') {
        return this.prismaticMiss
          ? 'Raté… mais une prismatique ratée te rend une relance.'
          : 'Pas cette fois. La prochaine est pour toi.'
      }
      if (this.verdictKey === 'unknown') {
        return "On n'a pas pu lire ta partie. Pas de panique : ta relance t'est rendue."
      }
      return ''
    },
    roundBonusPercent() {
      return this.catalogue?.rules.roundBonusPercent ?? null
    },
    curseLabel() {
      return curseEffectLabel(this.catalogue)
    },
    /** Change quand une autre manche s'affiche : on recompte */
    countKey() {
      return `${this.result.gameId}|${this.result.points}`
    }
  },
  watch: {
    countKey() {
      this.countPoints()
    }
  },
  mounted() {
    this.countPoints()
  },
  methods: {
    countPoints() {
      const points = this.result.points
      // Hors navigateur (tests) matchMedia n'existe pas : valeur finale directe
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        this.shownPoints = points
        return
      }
      animateCount(points, (value) => {
        this.shownPoints = Math.round(value)
      })
    }
  }
}
</script>

<style scoped>
.round-result {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: stretch;
}

@media (min-width: 640px) {
  .round-result {
    flex-direction: row;
  }
}

.round-result__card {
  flex-shrink: 0;
  width: 100%;
  max-width: 12rem;
  align-self: center;
}

@media (min-width: 640px) {
  .round-result__card {
    width: 11rem;
    align-self: stretch;
  }
}

.round-result__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.round-result__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-beaufort), serif;
  font-size: 1.5rem;
  line-height: 1.2;
}

.round-result__icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.round-result--success .round-result__title {
  color: var(--lan-success);
}

.round-result--failure .round-result__title {
  color: var(--lan-fail);
}

.round-result--unknown .round-result__title {
  color: var(--lan-unknown);
}

.round-result__score {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-family: var(--font-beaufort), serif;
  font-variant-numeric: tabular-nums;
}

.round-result__points {
  font-size: 2.25rem;
  font-weight: bold;
  line-height: 1;
  color: var(--lan-points);
  text-shadow: 0 0 18px rgba(242, 193, 78, 0.35);
}

.round-result__points--cursed {
  color: var(--lan-curse);
  text-shadow: 0 0 18px rgba(156, 203, 91, 0.3);
}

.round-result__unit {
  font-size: 1rem;
  font-weight: normal;
}

.round-result__was {
  font-size: 1.25rem;
  color: var(--lan-ink-mute);
  text-decoration-thickness: 2px;
  text-decoration-color: var(--lan-fail);
}

.round-result__arrow {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--lan-ink-mute);
}

.round-result__detail {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--lan-ink-soft);
}

/* Prismatique ratée : la relance rendue mérite un liseré nacré */
.round-result--prismatic-miss .round-result__detail {
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background:
    linear-gradient(var(--lan-surface-raised), var(--lan-surface-raised)) padding-box,
    linear-gradient(
        120deg,
        var(--lan-pearl-1),
        var(--lan-pearl-2),
        var(--lan-pearl-3),
        var(--lan-pearl-4)
      )
      border-box;
  color: var(--lan-ink);
}

.round-result__curse {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(156, 203, 91, 0.35);
  background: var(--lan-curse-bg);
}

.round-result__curse-hook {
  font-family: var(--font-beaufort), serif;
  font-size: 1.05rem;
  color: var(--lan-ink);
}

.round-result__curse-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: var(--lan-curse);
}

.round-result__curse-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.round-result__bonus {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--lan-success);
}

.round-result__bonus-icon {
  width: 1rem;
  height: 1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}
</style>
