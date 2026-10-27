<template>
  <div class="run-history">
    <p v-if="!results.length" class="lan-muted">Aucune manche jouée pour l'instant.</p>

    <template v-else>
      <TransitionGroup tag="ol" name="list" class="run-history__list">
        <RunHistoryRow v-for="row in recent" :key="row.key" :result="row.result" :round="row.round" />
      </TransitionGroup>

      <Transition name="collapse">
        <div v-if="expanded && older.length" :id="olderId" class="run-history__older">
          <div class="run-history__older-inner">
            <ol class="run-history__list run-history__list--older">
              <RunHistoryRow v-for="row in older" :key="row.key" :result="row.result" :round="row.round" />
            </ol>
          </div>
        </div>
      </Transition>

      <button
        v-if="older.length"
        type="button"
        class="lan-btn lan-btn--ghost run-history__toggle"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-controls="olderId"
        data-test="history-toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ne garder que les dernières' : `Voir les ${results.length} manches` }}
        <ChevronDown
          class="run-history__chevron"
          :class="{ 'run-history__chevron--open': expanded }"
          aria-hidden="true"
        />
      </button>
    </template>
  </div>
</template>

<script>
import { ChevronDown } from 'lucide-vue-next'
import RunHistoryRow from '@/components/lan/RunHistoryRow.vue'

/** Manches toujours visibles ; les plus anciennes se replient en accordéon */
const VISIBLE_ROUNDS = 3

let uid = 0

// Historique des manches du joueur, la plus récente en haut
export default {
  name: 'RunHistory',
  components: { ChevronDown, RunHistoryRow },
  props: {
    results: { type: Array, required: true }
  },
  data() {
    uid += 1
    return { expanded: false, olderId: `run-history-older-${uid}` }
  },
  computed: {
    newestFirst() {
      return this.results
        .map((result, index) => ({ result, round: index + 1, key: `${result.gameId}-${index}` }))
        .reverse()
    },
    recent() {
      return this.newestFirst.slice(0, VISIBLE_ROUNDS)
    },
    older() {
      return this.newestFirst.slice(VISIBLE_ROUNDS)
    }
  }
}
</script>

<style scoped>
.run-history__list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Accordéon : la transition collapse anime grid-template-rows */
.run-history__older {
  display: grid;
  grid-template-rows: 1fr;
}

.run-history__older-inner {
  overflow: hidden;
  min-height: 0;
}

.run-history__toggle {
  width: 100%;
  margin-top: 0.75rem;
  font-size: 0.95rem;
}

.run-history__chevron {
  width: 1rem;
  height: 1rem;
  transition: transform var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.run-history__chevron--open {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .run-history__chevron {
    transition: none;
  }
}
</style>
