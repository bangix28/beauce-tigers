<template>
  <TransitionGroup tag="ol" name="list" class="recap-games">
    <li v-for="game in games" :key="game.gameId" class="recap-game" data-test="recap-game">
      <header class="recap-game__header">
        <h3 class="recap-game__title">
          <Swords class="recap-game__icon" aria-hidden="true" />
          Match de {{ formatDate(game.settledAt, "HH'h'mm") }}
        </h3>
        <span class="recap-game__count">{{ playersLabel(game.rounds.length) }}</span>
        <span v-if="game.roundBonus" class="recap-game__bonus" data-test="recap-game-bonus">
          <Users class="w-3.5 h-3.5" aria-hidden="true" /> Bonus de manche
        </span>
      </header>

      <ul class="recap-game__rounds">
        <RunHistoryRow
          v-for="round in game.rounds"
          :key="round.key"
          :result="round"
          :label="isMe(round) ? 'Toi' : round.riotId"
          :label-strong="isMe(round)"
          :curse-title="isMe(round) ? 'Tu étais maudit' : 'Ce joueur était maudit'"
          label-wide
        />
      </ul>
    </li>
  </TransitionGroup>
</template>

<script>
import { Swords, Users } from 'lucide-vue-next'
import RunHistoryRow from '@/components/lan/RunHistoryRow.vue'
import { utilsTools } from '@/mixins/utilsTools.js'

// Récap « par match » : qui a joué quoi sur une même partie. C'est là que le
// bonus de manche se comprend : tous les joueurs engagés l'ont réussi ensemble.
export default {
  name: 'RecapByGame',
  components: { RunHistoryRow, Swords, Users },
  mixins: [utilsTools],
  props: {
    /** Résultat de recapByGame (src/utils/roundRecap.ts) */
    games: { type: Array, required: true },
    myRiotId: { type: String, default: null }
  },
  methods: {
    isMe(round) {
      return this.myRiotId != null && round.riotId === this.myRiotId
    },
    playersLabel(count) {
      return count > 1 ? `${count} joueurs` : '1 joueur'
    }
  }
}
</script>

<style scoped>
.recap-games {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recap-game {
  padding: 0.875rem 1rem 0.25rem;
  border: 1px solid var(--lan-line);
  border-radius: 12px;
  background: var(--lan-surface-raised);
}

.recap-game__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
}

.recap-game__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--font-beaufort), serif;
  font-size: 1.05rem;
  color: var(--lan-ink);
}

.recap-game__icon {
  width: 1rem;
  height: 1rem;
  color: var(--lan-gold);
}

.recap-game__count {
  font-size: 0.85rem;
  color: var(--lan-ink-mute);
}

.recap-game__bonus {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  background: rgba(10, 200, 185, 0.12);
  font-size: 0.8rem;
  color: var(--lan-success);
}

.recap-game__rounds {
  margin: 0;
  padding: 0;
  list-style: none;
}

.recap-game__rounds :deep(.history-row:last-child) {
  border-bottom: none;
}
</style>
