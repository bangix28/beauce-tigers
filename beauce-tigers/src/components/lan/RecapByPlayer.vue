<template>
  <ul class="recap-players">
    <li
      v-for="player in players"
      :key="player.riotId"
      class="recap-player"
      :class="{ 'recap-player--me': isMe(player), 'recap-player--open': isOpen(player) }"
      data-test="recap-player"
    >
      <button
        type="button"
        class="recap-player__toggle"
        :aria-expanded="isOpen(player) ? 'true' : 'false'"
        :aria-controls="panelId(player)"
        data-test="recap-player-toggle"
        @click="toggle(player)"
      >
        <span class="recap-player__rank" aria-hidden="true">{{ player.rank ?? '–' }}</span>
        <span class="recap-player__who">
          <span class="recap-player__name">{{ isMe(player) ? 'Toi' : player.riotId }}</span>
          <span class="recap-player__meta">{{ meta(player) }}</span>
        </span>
        <span v-if="player.rank != null" class="recap-player__score lan-points">
          {{ player.score }}<span class="recap-player__unit"> pts</span>
        </span>
        <ChevronDown class="recap-player__chevron" aria-hidden="true" />
      </button>

      <Transition name="collapse">
        <div v-if="isOpen(player)" :id="panelId(player)" class="recap-player__panel">
          <div>
            <ul v-if="player.rounds.length" class="recap-player__rounds">
              <RunHistoryRow
                v-for="round in player.rounds"
                :key="round.key"
                :result="round"
                :label="formatDate(round.occurredAt, 'HH:mm')"
                :curse-title="isMe(player) ? 'Tu étais maudit' : 'Ce joueur était maudit'"
              />
            </ul>
            <p v-else class="recap-player__empty lan-muted">{{ emptyText(player) }}</p>
          </div>
        </div>
      </Transition>
    </li>
  </ul>
</template>

<script>
import { ChevronDown } from 'lucide-vue-next'
import RunHistoryRow from '@/components/lan/RunHistoryRow.vue'
import { utilsTools } from '@/mixins/utilsTools.js'

let uid = 0

const plural = (count, one, many) => `${count} ${count > 1 ? many : one}`

// Récap « par joueur » : une ligne par joueur dans l'ordre du classement, qu'on
// déplie pour voir ses manches. Les totaux viennent du classement, complets
// même quand le fil n'a plus les manches les plus anciennes.
export default {
  name: 'RecapByPlayer',
  components: { ChevronDown, RunHistoryRow },
  mixins: [utilsTools],
  props: {
    /** Résultat de recapByPlayer (src/utils/roundRecap.ts) */
    players: { type: Array, required: true },
    myRiotId: { type: String, default: null }
  },
  data() {
    uid += 1
    return { uid, openRiotIds: [] }
  },
  methods: {
    isMe(player) {
      return this.myRiotId != null && player.riotId === this.myRiotId
    },
    isOpen(player) {
      return this.openRiotIds.includes(player.riotId)
    },
    toggle(player) {
      this.openRiotIds = this.isOpen(player)
        ? this.openRiotIds.filter((riotId) => riotId !== player.riotId)
        : [...this.openRiotIds, player.riotId]
    },
    panelId(player) {
      return `recap-player-${this.uid}-${player.riotId.replace(/[^\w-]/g, '_')}`
    },
    meta(player) {
      if (!player.joined) return 'Pas encore dans le jeu'
      if (player.rank == null) return plural(player.rounds.length, 'manche récente', 'manches récentes')
      return `${plural(player.successes, 'défi réussi', 'défis réussis')} sur ${plural(player.roundsPlayed, 'manche', 'manches')}`
    },
    emptyText(player) {
      if (!player.joined || player.roundsPlayed === 0) return 'Pas encore joué.'
      // Il a joué, mais ses manches sont sorties du fil (limité aux dernières actions)
      return 'Ses manches sont plus anciennes que le récap.'
    }
  }
}
</script>

<style scoped>
.recap-players {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recap-player {
  border: 1px solid var(--lan-line);
  border-radius: 12px;
  background: var(--lan-surface-raised);
  transition: border-color var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.recap-player--me {
  border-color: rgba(240, 138, 36, 0.4);
}

.recap-player--open {
  border-color: var(--lan-line-strong);
}

.recap-player__toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 52px;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  text-align: left;
  color: var(--lan-ink);
  cursor: pointer;
}

.recap-player__toggle:hover {
  background: rgba(200, 170, 110, 0.06);
}

.recap-player__toggle:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
}

.recap-player__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border: 1px solid var(--lan-line-strong);
  border-radius: 9999px;
  font-family: var(--font-beaufort), serif;
  font-size: 0.85rem;
  color: var(--lan-ink-soft);
}

.recap-player__who {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.recap-player__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
}

.recap-player--me .recap-player__name {
  color: var(--lan-tiger);
}

.recap-player__meta {
  font-size: 0.85rem;
  color: var(--lan-ink-mute);
}

.recap-player__score {
  font-family: var(--font-beaufort), serif;
  font-size: 1.15rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}

.recap-player__unit {
  font-size: 0.8rem;
  font-weight: normal;
}

.recap-player__chevron {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: var(--lan-ink-mute);
  transition: transform var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.recap-player--open .recap-player__chevron {
  transform: rotate(180deg);
}

/* Accordéon : la transition collapse anime grid-template-rows et ne coupe le
   contenu (overflow) que pendant l'animation ; ouvert, rien n'est coupé, sinon
   les infobulles des cartes seraient tronquées */
.recap-player__panel {
  display: grid;
  grid-template-rows: 1fr;
}

.recap-player__panel > div {
  min-height: 0;
}

.recap-player__rounds {
  margin: 0 1rem 0.25rem;
  padding: 0;
  list-style: none;
}

.recap-player__rounds :deep(.history-row:last-child) {
  border-bottom: none;
}

.recap-player__empty {
  margin: 0 1rem 0.875rem;
  font-size: 0.9rem;
}

@media (prefers-reduced-motion: reduce) {
  .recap-player__chevron {
    transition: none;
  }
}
</style>
