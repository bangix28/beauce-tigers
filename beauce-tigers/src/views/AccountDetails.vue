<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Retour -->
    <button
      class="flex items-center gap-2 font-beaufort text-lol-gold hover:text-lol-blue transition-colors duration-200 mb-6"
      @click="$router.push('/')"
    >
      <ArrowLeft class="w-5 h-5" />
      Retour au classement
    </button>

    <!-- Chargement -->
    <LoadingSpinner v-if="loading" class="py-24" />

    <!-- Compte introuvable / id invalide -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-lol-gold/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Ce compte n'existe pas dans les archives de la Beauce.
      </p>
      <button class="btn btn-primary" @click="$router.push('/')">Retour au classement</button>
    </div>

    <!-- Erreur générique -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-red-400/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Impossible de récupérer ce compte pour le moment.
      </p>
      <button class="btn btn-primary" @click="$router.push('/')">Retour au classement</button>
    </div>

    <!-- Détail du compte -->
    <div v-else-if="account">
      <!-- Bannière du compte -->
      <div class="animate-fade-in">
        <AccountHeader :account="account" />
      </div>

      <!-- Évolution du classement -->
      <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.1s">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="hextech-title">Évolution du classement</h2>
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button
              v-for="p in periods"
              :key="p.key"
              class="px-3 py-1 text-xs uppercase tracking-wider font-beaufort border rounded-sm transition-colors duration-200"
              :class="
                period === p.key
                  ? 'bg-lol-gold/20 text-lol-gold border-lol-gold'
                  : 'text-gray-400 border-gray-700 hover:border-lol-gold/50 hover:text-gray-200'
              "
              @click="period = p.key"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
        <EloDailyChart :points="filteredEloPoints" />
      </div>

      <!-- Historique des matchs -->
      <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.2s">
        <h2 class="hextech-title">Historique des {{ historyCount }} derniers matchs</h2>
        <MatchHistoryList
          :histories="histories"
          :account-id="account.id"
          :account-name="account.name"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useAccountDetailStore } from '@/stores/accountDetailStore'
import { useEloDailyStore } from '@/stores/eloDailyStore'
import { usePlayerHistoryStore, ACCOUNT_HISTORY_COUNT } from '@/stores/playerHistoryStore'
import { ArrowLeft, SearchX } from 'lucide-vue-next'
import { subDays, subMonths } from 'date-fns'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import AccountHeader from '@/components/account/AccountHeader.vue'
import MatchHistoryList from '@/components/account/MatchHistoryList.vue'
import EloDailyChart from '@/components/charts/EloDailyChart.vue'

const PERIODS = [
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '3m', label: '3 mois' },
  { key: 'all', label: 'Tout' }
]

export default {
  name: 'AccountDetails',
  components: {
    ArrowLeft,
    SearchX,
    LoadingSpinner,
    AccountHeader,
    MatchHistoryList,
    EloDailyChart
  },
  created() {
    this.accountDetailStore = useAccountDetailStore()
    this.eloDailyStore = useEloDailyStore()
    this.playerHistoryStore = usePlayerHistoryStore()
  },
  data() {
    return {
      loading: false,
      invalidId: false,
      period: '30d',
      periods: PERIODS,
      historyCount: ACCOUNT_HISTORY_COUNT
    }
  },
  async mounted() {
    await this.loadAccount()
  },
  watch: {
    // vue-router réutilise l'instance quand seul :id change (/account/1 → /account/2) :
    // sans ce watcher, la page garderait les données de l'ancien compte
    '$route.params.id'() {
      if (this.$route.name !== 'AccountDetails') return
      this.loadAccount()
    }
  },
  methods: {
    async loadAccount() {
      this.invalidId = false
      const id = Number(this.$route.params.id)
      // Id non numérique (/account/abc) : écran 404 direct, sans appel API
      if (!Number.isInteger(id) || id <= 0) {
        this.invalidId = true
        return
      }

      this.loading = true

      // Historique et courbe d'elo : non bloquants, leurs sections sont derrière
      // v-if et se remplissent réactivement (même pattern que la page match)
      this.playerHistoryStore.fetchListPlayerHistoryData(id, ACCOUNT_HISTORY_COUNT).catch(() => {})
      this.eloDailyStore.fetchEloDaily(id).catch(() => {})

      await this.accountDetailStore.fetchAccountDetail(id)
      this.loading = false
    }
  },
  computed: {
    accountId() {
      return Number(this.$route.params.id)
    },
    account() {
      return this.accountDetailStore.account
    },
    notFound() {
      return this.invalidId || this.accountDetailStore.notFound
    },
    error() {
      return this.accountDetailStore.error
    },
    histories() {
      // Lecture par clé composite : ne pas resservir les 5 matchs que
      // l'accueil aurait mis en cache pour ce compte
      return this.playerHistoryStore.historiesByKey[`${this.accountId}:${ACCOUNT_HISTORY_COUNT}`] ?? []
    },
    eloPoints() {
      return this.eloDailyStore.seriesById[this.accountId] ?? []
    },
    filteredEloPoints() {
      if (this.period === 'all') return this.eloPoints

      const start =
        this.period === '7d'
          ? subDays(new Date(), 7)
          : this.period === '30d'
            ? subDays(new Date(), 30)
            : subMonths(new Date(), 3)

      // Comparaison sur Date : dateScore arrive en ISO datetime, pas en 'yyyy-MM-dd'
      return this.eloPoints.filter((p) => new Date(p.date) >= start)
    }
  }
}
</script>
