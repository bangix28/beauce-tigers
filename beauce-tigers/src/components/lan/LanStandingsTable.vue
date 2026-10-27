<template>
  <div class="standings">
    <p v-if="!entries.length" class="lan-muted">Personne au classement pour le moment.</p>

    <TransitionGroup v-else tag="ol" name="list" class="standings__list">
      <li
        v-for="entry in entries"
        :key="entry.riotId"
        class="standings__row"
        :class="{ 'standings__row--me': isMe(entry), [`standings__row--top${entry.rank}`]: entry.rank <= 3 }"
        :aria-current="isMe(entry) ? 'true' : undefined"
      >
        <span class="standings__rank">{{ entry.rank }}</span>

        <span class="standings__who">
          <span class="standings__name" :title="entry.riotId">
            {{ isMe(entry) ? 'Toi' : entry.riotId }}
          </span>
          <span class="standings__status" :class="`standings__status--${status(entry).tone}`">
            <component :is="status(entry).icon" class="standings__status-icon" aria-hidden="true" />
            {{ status(entry).text }}
          </span>
        </span>

        <span class="standings__score">
          {{ entry.score }}<span class="standings__unit"> pts</span>
        </span>
      </li>
    </TransitionGroup>
  </div>
</template>

<script>
import { CircleCheck, CircleDashed, EyeOff, Gamepad2, Layers } from 'lucide-vue-next'

const successesLabel = (count) => (count > 1 ? `${count} défis réussis` : `${count} défi réussi`)

// Classement de la LAN. Une carte saboteur n'est jamais révélée : l'API renvoie
// activeCard null et secretCard true, on affiche seulement « carte secrète ».
export default {
  name: 'LanStandingsTable',
  props: {
    entries: { type: Array, required: true },
    myRiotId: { type: String, default: null }
  },
  methods: {
    isMe(entry) {
      return this.myRiotId != null && entry.riotId === this.myRiotId
    },
    status(entry) {
      if (!entry.joined) return { icon: CircleDashed, tone: 'idle', text: 'Pas encore dans le jeu' }

      const card = entry.secretCard ? 'Carte secrète' : entry.activeCard?.label
      if (!card) return { icon: CircleCheck, tone: 'score', text: successesLabel(entry.successes) }
      if (entry.cardLocked) return { icon: Gamepad2, tone: 'playing', text: `En partie · ${card}` }
      return { icon: entry.secretCard ? EyeOff : Layers, tone: 'card', text: card }
    }
  }
}
</script>

<style scoped>
.standings__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.standings__row {
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 10px;
}

.standings__row--me {
  border-color: rgba(240, 138, 36, 0.4);
  background: linear-gradient(90deg, rgba(240, 138, 36, 0.14), rgba(240, 138, 36, 0.03));
}

.standings__rank {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid var(--lan-line);
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  color: var(--lan-ink-soft);
  font-variant-numeric: tabular-nums;
}

/* Podium : or, argent, bronze */
.standings__row--top1 .standings__rank {
  border-color: var(--lan-points);
  background: rgba(242, 193, 78, 0.16);
  color: var(--lan-points);
}

.standings__row--top2 .standings__rank {
  border-color: var(--lan-silver);
  background: rgba(217, 222, 229, 0.1);
  color: var(--lan-silver);
}

.standings__row--top3 .standings__rank {
  border-color: #d08a52;
  background: rgba(208, 138, 82, 0.12);
  color: #e3a574;
}

.standings__who {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.standings__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  color: var(--lan-ink);
}

.standings__row--me .standings__name {
  color: var(--lan-tiger);
}

.standings__status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  color: var(--lan-ink-soft);
}

.standings__status-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

.standings__status--idle {
  color: var(--lan-ink-mute);
}

.standings__status--score .standings__status-icon {
  color: var(--lan-success);
}

.standings__status--playing .standings__status-icon {
  color: var(--lan-tiger);
}

.standings__status--card .standings__status-icon {
  color: var(--lan-gold);
}

.standings__score {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--lan-points);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.standings__unit {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--lan-ink-soft);
}
</style>
