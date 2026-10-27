<template>
  <div class="round-recap" data-test="recap">
    <p v-if="!games.length" class="round-recap__empty lan-muted" data-test="recap-empty">
      Aucune manche jouée pour l'instant. Le récap se remplit au fil des parties.
    </p>

    <template v-else>
      <div
        class="round-recap__tabs"
        role="tablist"
        aria-label="Présentation du récap"
        @keydown.right.prevent="move(1)"
        @keydown.left.prevent="move(-1)"
      >
        <button
          v-for="tab in TABS"
          :id="tabId(tab.key)"
          :key="tab.key"
          ref="tabs"
          type="button"
          role="tab"
          class="round-recap__tab"
          :class="{ 'round-recap__tab--active': view === tab.key }"
          :aria-selected="view === tab.key ? 'true' : 'false'"
          :aria-controls="panelId"
          :tabindex="view === tab.key ? 0 : -1"
          :data-test="`recap-tab-${tab.key}`"
          @click="view = tab.key"
        >
          <component :is="tab.icon" class="w-4 h-4" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </div>

      <Transition name="fade" mode="out-in">
        <div
          :id="panelId"
          :key="view"
          role="tabpanel"
          :aria-labelledby="tabId(view)"
          class="round-recap__panel"
        >
          <RecapByGame v-if="view === 'game'" :games="games" :my-riot-id="myRiotId" />
          <RecapByPlayer v-else :players="players" :my-riot-id="myRiotId" />
        </div>
      </Transition>

      <p v-if="truncated" class="round-recap__truncated lan-muted" data-test="recap-truncated">
        <Info class="w-4 h-4 shrink-0" aria-hidden="true" />
        Seules les {{ FEED_RECAP_LIMIT }} dernières actions de la soirée sont affichées. Les totaux du
        classement, eux, comptent tout.
      </p>
    </template>
  </div>
</template>

<script>
import { Info, Swords, UsersRound } from 'lucide-vue-next'
import RecapByGame from '@/components/lan/RecapByGame.vue'
import RecapByPlayer from '@/components/lan/RecapByPlayer.vue'
import { FEED_RECAP_LIMIT, isRecapTruncated, recapByGame, recapByPlayer } from '@/utils/roundRecap'

const TABS = [
  { key: 'game', label: 'Par match', icon: Swords },
  { key: 'player', label: 'Par joueur', icon: UsersRound }
]

let uid = 0

// Récap de la soirée : les manches réglées de tous les joueurs, lues dans le fil
// d'exploits (rien de plus que ce qu'il montre déjà : une carte saboteur n'y
// apparaît qu'une fois réglée, une Malédiction jamais).
export default {
  name: 'LanRoundRecap',
  components: { Info, RecapByGame, RecapByPlayer },
  props: {
    feed: { type: Array, required: true },
    /** Entrées du classement : ordre et totaux de la vue par joueur */
    standings: { type: Array, default: () => [] },
    myRiotId: { type: String, default: null }
  },
  data() {
    uid += 1
    return { TABS, FEED_RECAP_LIMIT, view: 'game', panelId: `round-recap-panel-${uid}`, uid }
  },
  computed: {
    games() {
      return recapByGame(this.feed, this.myRiotId)
    },
    players() {
      return recapByPlayer(this.feed, this.standings)
    },
    truncated() {
      return isRecapTruncated(this.feed)
    }
  },
  methods: {
    tabId(key) {
      return `round-recap-tab-${this.uid}-${key}`
    },
    /** Flèches gauche/droite : onglet suivant, focus compris (motif ARIA des onglets) */
    move(step) {
      const index = TABS.findIndex((tab) => tab.key === this.view)
      const next = TABS[(index + step + TABS.length) % TABS.length]
      this.view = next.key
      this.$nextTick(() => this.$refs.tabs?.find((el) => el.id === this.tabId(next.key))?.focus())
    }
  }
}
</script>

<style scoped>
.round-recap__empty {
  font-size: 0.95rem;
}

.round-recap__tabs {
  display: inline-flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  border: 1px solid var(--lan-line);
  border-radius: 9999px;
  background: var(--lan-surface-raised);
}

.round-recap__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 1rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  color: var(--lan-ink-soft);
  cursor: pointer;
  transition:
    background-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    color var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.round-recap__tab:hover {
  color: var(--lan-ink);
}

.round-recap__tab:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 2px;
}

.round-recap__tab--active {
  background: var(--lan-tiger);
  color: #1a0f05;
  font-weight: bold;
}

.round-recap__tab--active:hover {
  color: #1a0f05;
}

.round-recap__truncated {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
}
</style>
