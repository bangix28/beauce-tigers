<template>
  <li class="history-row" :data-verdict="result.verdict">
    <span class="history-row__round">Manche {{ round }}</span>

    <span class="history-row__card" :class="`history-row__card--${result.card.rarity}`">
      <span class="history-row__dot" aria-hidden="true"></span>
      <span class="history-row__label">{{ result.card.label }}</span>
    </span>

    <span v-if="result.curseApplied" class="history-row__tag history-row__tag--curse" title="Tu étais maudit">
      <Biohazard class="history-row__tag-icon" aria-hidden="true" /> maudit
    </span>
    <span v-if="result.roundBonus" class="history-row__tag history-row__tag--bonus" title="Bonus de manche">
      <Users class="history-row__tag-icon" aria-hidden="true" /> bonus
    </span>

    <span class="history-row__verdict" :class="`history-row__verdict--${verdictKey}`">
      <component :is="verdict.icon" class="history-row__verdict-icon" aria-hidden="true" />
      <span v-if="verdictKey === 'success'" class="lan-points">+{{ result.points }}</span>
      <span v-else>{{ verdict.label }}</span>
    </span>
  </li>
</template>

<script>
import { Biohazard, CircleCheck, CircleHelp, CircleX, Users } from 'lucide-vue-next'

const VERDICTS = {
  success: { icon: CircleCheck, label: 'réussi' },
  failure: { icon: CircleX, label: 'raté' },
  unknown: { icon: CircleHelp, label: 'inconnu' }
}

// Une manche de l'historique : numéro, carte, marqueurs, verdict
export default {
  name: 'RunHistoryRow',
  components: { Biohazard, Users },
  props: {
    result: { type: Object, required: true },
    round: { type: Number, required: true }
  },
  computed: {
    verdictKey() {
      return VERDICTS[this.result.verdict] ? this.result.verdict : 'unknown'
    },
    verdict() {
      return VERDICTS[this.verdictKey]
    }
  }
}
</script>

<style scoped>
.history-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--lan-line);
  font-size: 0.95rem;
}

.history-row__round {
  width: 5rem;
  flex-shrink: 0;
  font-size: 0.85rem;
  color: var(--lan-ink-mute);
  font-variant-numeric: tabular-nums;
}

.history-row__card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--lan-ink);
}

.history-row__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pastille de matière de la carte */
.history-row__dot {
  width: 0.6rem;
  height: 0.6rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: var(--lan-silver);
}

.history-row__card--gold .history-row__dot {
  background: var(--lan-honey);
}

.history-row__card--prismatic .history-row__dot {
  background: conic-gradient(
    var(--lan-pearl-1),
    var(--lan-pearl-2),
    var(--lan-pearl-3),
    var(--lan-pearl-4),
    var(--lan-pearl-1)
  );
}

.history-row__card--saboteur .history-row__dot {
  background: var(--lan-ember);
}

.history-row__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.history-row__tag-icon {
  width: 0.8rem;
  height: 0.8rem;
}

.history-row__tag--curse {
  background: var(--lan-curse-bg);
  color: var(--lan-curse);
}

.history-row__tag--bonus {
  background: rgba(10, 200, 185, 0.12);
  color: var(--lan-success);
}

.history-row__verdict {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  min-width: 4.5rem;
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}

.history-row__verdict-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.history-row__verdict--success .history-row__verdict-icon {
  color: var(--lan-success);
}

.history-row__verdict--failure {
  color: var(--lan-fail);
}

.history-row__verdict--unknown {
  color: var(--lan-unknown);
}
</style>
