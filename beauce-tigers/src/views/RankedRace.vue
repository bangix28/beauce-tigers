<template>
  <div class="container mx-auto px-4 py-6">
    <button
      class="flex items-center gap-2 font-beaufort text-lol-gold hover:text-lol-blue transition-colors duration-200 mb-6"
      @click="$router.push('/')"
    >
      <ArrowLeft class="w-5 h-5" />
      Retour au classement
    </button>

    <RaceSelector
      :events="events"
      :selection="selection"
      :resolved-queue="standings?.queue ?? null"
      @update:selection="applySelection"
    />

    <!-- Chargement -->
    <LoadingSpinner v-if="loading" class="py-24" />

    <!-- Événement inexistant -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-lol-gold/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Cette course n'a jamais été courue dans la Beauce.
      </p>
      <button class="btn btn-primary" @click="applySelection(DEFAULT_SELECTION)">
        Voir la course de la semaine
      </button>
    </div>

    <!-- Erreur réseau -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-red-400/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Impossible de récupérer les classements pour le moment.
      </p>
      <button class="btn btn-primary" @click="loadStandings">Réessayer</button>
    </div>

    <div v-else-if="standings">
      <RaceHero :title="heroTitle" :window="standings.window" :queue="standings.queue" />

      <!-- Événement pas encore commencé : rien à classer, on annonce la date -->
      <div
        v-if="standings.status === 'upcoming'"
        class="hextech-card mt-8 animate-fade-in flex flex-col items-center gap-3 py-12"
      >
        <Hourglass class="w-12 h-12 text-lol-gold/60" />
        <p class="font-beaufort text-lg text-gray-300">
          La course débute le {{ formatDate(standings.window.start, 'dd/MM/yyyy') }}.
        </p>
      </div>

      <template v-else>
        <!-- Progression suspendue pendant les placements : le winrate continue -->
        <div
          v-if="standings.progressionSuspended"
          class="hextech-card mt-8 animate-fade-in flex flex-col items-center gap-3 py-10"
        >
          <PauseCircle class="w-12 h-12 text-lol-gold/60" />
          <p class="font-beaufort text-lg text-gray-300">Progression suspendue</p>
          <p class="text-sm text-gray-500 text-center max-w-md">
            Le temps des parties de placement, les écarts de rang ne veulent plus rien dire. Le
            classement au winrate, lui, continue de tourner.
          </p>
        </div>

        <template v-else-if="hasProgression">
          <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.1s">
            <h2 class="hextech-title">{{ isFinished ? 'Podium final' : 'Sur la piste' }}</h2>
            <RacePodium v-if="podium.length" :entries="podium" :ceremony="isFinished" />
            <div v-if="podium.length" class="hextech-divider my-6"></div>
            <RaceTrack :entries="standings.progression" :ceremony="isFinished" />
          </div>

          <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.2s">
            <h2 class="hextech-title">Classement à la progression</h2>
            <RaceProgressionTable
              :entries="standings.progression"
              :lp-rank-by-riot-id="lpRankByRiotId"
            />
          </div>

          <div
            v-if="lpStandings.length"
            class="hextech-card mt-8 animate-fade-in"
            style="animation-delay: 0.25s"
          >
            <h2 class="hextech-title">Classement aux LP gagnés</h2>
            <p class="text-xs text-gray-500 -mt-2 mb-4">
              Sans pondération de tier : celui qui a simplement encaissé le plus de LP.
            </p>
            <RaceLpTable :entries="lpStandings" />
          </div>
        </template>

        <div
          v-else
          class="hextech-card mt-8 animate-fade-in flex flex-col items-center gap-3 py-12"
        >
          <Flag class="w-12 h-12 text-lol-gold/60" />
          <p class="font-beaufort text-lg text-gray-300">Aucun relevé sur cette période.</p>
          <p class="text-sm text-gray-500 text-center max-w-md">
            La course démarre au premier relevé quotidien de rang — repassez demain.
          </p>
        </div>

        <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.3s">
          <h2 class="hextech-title">
            Classement au winrate · minimum {{ standings.winrate.gamesRequired }} parties
          </h2>
          <RaceWinrateTable
            :qualified="standings.winrate.qualified"
            :not-qualified="standings.winrate.notQualified"
            :games-required="standings.winrate.gamesRequired"
          />
        </div>
      </template>

      <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.4s">
        <h2 class="hextech-title">Règles de la course</h2>
        <RaceRulesCard :games-required="standings.winrate.gamesRequired" />
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, Flag, Hourglass, PauseCircle, SearchX } from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import RaceHero from '@/components/rankedRace/RaceHero.vue'
import RaceLpTable from '@/components/rankedRace/RaceLpTable.vue'
import RacePodium from '@/components/rankedRace/RacePodium.vue'
import RaceProgressionTable from '@/components/rankedRace/RaceProgressionTable.vue'
import RaceRulesCard from '@/components/rankedRace/RaceRulesCard.vue'
import RaceSelector from '@/components/rankedRace/RaceSelector.vue'
import RaceTrack from '@/components/rankedRace/RaceTrack.vue'
import RaceWinrateTable from '@/components/rankedRace/RaceWinrateTable.vue'
import { rankByNetLp } from '@/utils/raceMapper'
import { selectionKey, useRankedRaceStore } from '@/stores/rankedRaceStore'
import { usePlayerDataStore } from '@/stores/playerStore'
import { utilsTools } from '@/mixins/utilsTools.js'

const DEFAULT_SELECTION = { kind: 'calendar', queue: 'solo', period: 'week' }
const QUEUES = ['solo', 'flex']
const PERIODS = ['week', 'month']

export default {
  name: 'RankedRace',
  components: {
    ArrowLeft,
    Flag,
    Hourglass,
    PauseCircle,
    SearchX,
    LoadingSpinner,
    RaceHero,
    RaceLpTable,
    RacePodium,
    RaceProgressionTable,
    RaceRulesCard,
    RaceSelector,
    RaceTrack,
    RaceWinrateTable
  },
  mixins: [utilsTools],
  created() {
    this.rankedRaceStore = useRankedRaceStore()
    this.playerDataStore = usePlayerDataStore()
  },
  data() {
    return {
      loading: false,
      selection: { ...DEFAULT_SELECTION },
      DEFAULT_SELECTION
    }
  },
  async mounted() {
    // Non bloquant : sert uniquement à rendre les noms cliquables, chaque
    // classement s'affiche sans attendre. Le store n'a pas de garde de cache,
    // d'où le test sur la liste déjà chargée par l'accueil.
    if (!this.playerDataStore.playerData.length) {
      this.playerDataStore.fetchListPlayerData().catch(() => {})
    }
    this.rankedRaceStore.fetchEvents().catch(() => {})

    this.selection = this.selectionFromQuery()
    await this.loadStandings()
  },
  watch: {
    // La sélection vit dans l'URL : un retour arrière navigateur ou un lien
    // partagé doivent rouvrir exactement le même classement
    '$route.query'() {
      if (this.$route.name !== 'RankedRace') return

      const next = this.selectionFromQuery()
      if (selectionKey(next) === selectionKey(this.selection)) return

      this.selection = next
      this.loadStandings()
    }
  },
  computed: {
    events() {
      return this.rankedRaceStore.events
    },
    standings() {
      return this.rankedRaceStore.standingsByKey[selectionKey(this.selection)] ?? null
    },
    notFound() {
      return this.rankedRaceStore.notFound
    },
    error() {
      return this.rankedRaceStore.error
    },
    hasProgression() {
      return (this.standings?.progression.length ?? 0) > 0
    },
    podium() {
      return this.standings?.progression.slice(0, 3) ?? []
    },
    // Seuls les événements passent en 'finished' : la course calendaire porte
    // toujours sur la période courante, elle n'est jamais close
    isFinished() {
      return this.standings?.status === 'finished'
    },
    /** Même jeu de coureurs, retrié sur les LP réellement encaissés */
    lpStandings() {
      return rankByNetLp(this.standings?.progression ?? [])
    },
    lpRankByRiotId() {
      return Object.fromEntries(this.lpStandings.map((entry, index) => [entry.riotId, index + 1]))
    },
    heroTitle() {
      if (!this.standings) return 'Course au classement'
      if (this.standings.eventName) return this.standings.eventName
      return this.standings.period === 'month' ? 'Course du mois' : 'Sprint de la semaine'
    }
  },
  methods: {
    selectionFromQuery() {
      const { event, queue, period } = this.$route.query

      if (/^\d+$/.test(event ?? '')) {
        return { kind: 'event', id: Number(event) }
      }

      return {
        kind: 'calendar',
        queue: QUEUES.includes(queue) ? queue : DEFAULT_SELECTION.queue,
        period: PERIODS.includes(period) ? period : DEFAULT_SELECTION.period
      }
    },
    queryFromSelection(selection) {
      return selection.kind === 'event'
        ? { event: String(selection.id) }
        : { queue: selection.queue, period: selection.period }
    },
    applySelection(selection) {
      this.selection = selection
      // replace et pas push : basculer d'onglet n'est pas une étape de
      // navigation, mais l'URL reste partageable
      this.$router.replace({ name: 'RankedRace', query: this.queryFromSelection(selection) })
      this.loadStandings()
    },
    async loadStandings() {
      this.loading = true
      await this.rankedRaceStore.fetchStandings(this.selection)
      this.loading = false
    }
  }
}
</script>
