<template>
  <div class="feed">
    <p v-if="!entries.length" class="lan-muted">Rien à signaler pour l'instant. Ça va venir.</p>

    <TransitionGroup v-else tag="ul" name="list" class="feed__list">
      <li
        v-for="entry in entries"
        :key="`${entry.kind}-${entry.riotId}-${entry.card.code}-${entry.occurredAt}`"
        class="feed__item"
        :class="{ 'feed__item--me': isMe(entry) }"
        :data-verdict="entry.kind === 'sabotage' ? 'sabotage' : entry.verdict"
      >
        <span class="feed__icon" :class="`feed__icon--${tone(entry)}`" aria-hidden="true">
          <component :is="icon(entry)" class="feed__icon-svg" />
        </span>

        <p class="feed__text">
          <!-- Sabotage : riotId est la cible, le saboteur n'est jamais nommé -->
          <template v-if="entry.kind === 'sabotage'">
            <template v-if="entry.card.code === 'pickpocket'">
              <template v-if="isMe(entry)">
                <strong>Toi</strong> : quelqu'un t'a fait les poches, une relance en moins.
              </template>
              <template v-else>Un saboteur a fait les poches à <strong>{{ entry.riotId }}</strong>.</template>
            </template>
            <template v-else>
              Un saboteur s'en est pris à <strong>{{ who(entry, 'toi') }}</strong>.
            </template>
          </template>

          <template v-else-if="entry.verdict === 'success'">
            <strong>{{ who(entry) }}</strong> : {{ entry.card.label }}<span
              v-if="entry.card.theme === 'bond'"
              class="feed__bond"
              role="img"
              aria-label="carte Lien"
              data-test="feed-bond"
            ><PawPrint class="feed__bond-icon" stroke-width="2.25" aria-hidden="true" /></span> réussi,
            <span class="lan-points feed__points">+{{ entry.points }}</span>{{ successExtra(entry) }}
          </template>

          <template v-else-if="entry.verdict === 'failure'">
            <strong>{{ who(entry) }}</strong> : {{ entry.card.label }} raté
          </template>

          <template v-else>
            <strong>{{ who(entry) }}</strong> : résultat inconnu pour {{ entry.card.label }}
          </template>
        </p>

        <time class="feed__time" :datetime="entry.occurredAt">
          {{ formatDate(entry.occurredAt, 'HH:mm') }}
        </time>
      </li>
    </TransitionGroup>
  </div>
</template>

<script>
import { CircleCheck, CircleHelp, CircleX, HandCoins, PawPrint, Skull } from 'lucide-vue-next'
import { utilsTools } from '@/mixins/utilsTools.js'

const VERDICT_ICONS = {
  success: CircleCheck,
  failure: CircleX,
  unknown: CircleHelp
}

// Fil d'exploits, le plus récent en premier (ordre de l'API). Pour un sabotage,
// riotId est la cible : le saboteur n'est jamais nommé.
export default {
  name: 'LanFeedList',
  components: { PawPrint },
  mixins: [utilsTools],
  props: {
    entries: { type: Array, required: true },
    /** Joueur connecté : affiché « Toi » */
    myRiotId: { type: String, default: null }
  },
  methods: {
    isMe(entry) {
      return this.myRiotId != null && entry.riotId === this.myRiotId
    },
    who(entry, me = 'Toi') {
      return this.isMe(entry) ? me : entry.riotId
    },
    successExtra(entry) {
      const extras = []
      if (entry.roundBonus) extras.push(' avec le bonus de manche')
      if (entry.curseApplied) extras.push(' malgré la malédiction')
      return extras.join(',')
    },
    tone(entry) {
      if (entry.kind === 'sabotage') return 'sabotage'
      return VERDICT_ICONS[entry.verdict] ? entry.verdict : 'unknown'
    },
    icon(entry) {
      if (entry.kind === 'sabotage') return entry.card.code === 'pickpocket' ? HandCoins : Skull
      return VERDICT_ICONS[entry.verdict] ?? CircleHelp
    }
  }
}
</script>

<style scoped>
.feed__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 0.625rem;
  padding: 0.5rem 0.5rem;
  border-radius: 10px;
}

.feed__item--me {
  background: rgba(240, 138, 36, 0.08);
}

.feed__icon {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
}

.feed__icon-svg {
  width: 1rem;
  height: 1rem;
}

.feed__icon--success {
  background: rgba(10, 200, 185, 0.12);
  color: var(--lan-success);
}

.feed__icon--failure {
  background: rgba(232, 64, 87, 0.12);
  color: var(--lan-fail);
}

.feed__icon--unknown {
  background: rgba(154, 163, 175, 0.12);
  color: var(--lan-unknown);
}

.feed__icon--sabotage {
  background: var(--lan-oxblood);
  color: var(--lan-ember);
}

.feed__text {
  padding-top: 0.2rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--lan-ink-soft);
}

.feed__text strong {
  color: var(--lan-ink);
}

.feed__item--me .feed__text strong {
  color: var(--lan-tiger);
}

/* Réussite d'une carte Lien : petite patte aux couleurs de Yuumi */
.feed__bond {
  display: inline-grid;
  place-items: center;
  width: 1.1rem;
  height: 1.1rem;
  margin-left: 0.3rem;
  vertical-align: -0.15rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--lan-bond-pink), var(--lan-bond-violet));
  color: var(--lan-bond-ink);
}

.feed__bond-icon {
  width: 0.7rem;
  height: 0.7rem;
}

.feed__points {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
}

.feed__time {
  padding-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--lan-ink-mute);
  font-variant-numeric: tabular-nums;
}
</style>
