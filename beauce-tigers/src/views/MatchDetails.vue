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
    <div v-if="loading" class="flex flex-col items-center justify-center text-xs text-gray-500 py-24">
      <svg
        aria-hidden="true"
        class="w-8 mt-2 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <p class="my-4">{{ randomLoadingMessage(loading, loadingMessage) }}</p>
    </div>

    <!-- Match introuvable / id invalide -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-lol-gold/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Ce match n'existe pas dans les archives de la Beauce.
      </p>
      <button class="btn btn-primary" @click="$router.push('/')">Retour au classement</button>
    </div>

    <!-- Erreur générique -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-4">
      <SearchX class="w-16 h-16 text-red-400/60" />
      <p class="font-beaufort text-xl text-gray-300">
        Impossible de récupérer ce match pour le moment.
      </p>
      <button class="btn btn-primary" @click="$router.push('/')">Retour au classement</button>
    </div>

    <!-- Détail du match -->
    <div v-else-if="match">
      <!-- Bannière du match -->
      <div class="animate-fade-in">
        <div class="hextech-divider"></div>
        <div
          class="relative overflow-hidden"
          :style="{
            backgroundImage: `linear-gradient(to right, #091428 15%, rgba(9,20,40,.75) 60%, rgba(9,20,40,.55)), url(${getUrlChampionSplash(match.championId)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%'
          }"
        >
          <div class="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
            <!-- Champion -->
            <div class="flex flex-col items-center gap-2">
              <div class="relative">
                <img
                  alt="Icône du Champion"
                  class="w-24 h-24 rounded-full border-2 border-lol-gold"
                  :src="getUrlIconChampion(match.championId)"
                />
                <span
                  v-if="match.champLevel != null"
                  class="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full bg-lol-darker border border-lol-gold text-lol-gold text-sm font-bold"
                >
                  {{ match.champLevel }}
                </span>
              </div>
              <p v-if="match.championName" class="font-beaufort font-bold text-lg text-lol-gold">
                {{ match.championName }}
              </p>
              <p v-if="roleLabel" class="text-xs uppercase tracking-widest text-gray-400">
                {{ roleLabel }}
              </p>
              <p v-if="playerName" class="text-sm text-lol-blue">{{ playerName }}</p>
            </div>

            <!-- Résultat + KDA -->
            <div class="flex flex-col items-center md:items-start gap-2 md:ml-8">
              <p
                class="font-beaufort font-bold text-4xl uppercase"
                :class="match.win ? 'text-lol-gold win-glow' : 'text-[#c6403b]'"
              >
                {{ match.win ? 'Victoire' : 'Défaite' }}
              </p>
              <p class="text-2xl">
                <span v-html="kdaFormat.htmlKDA"></span>
                <span class="text-gray-400 text-base ml-2">({{ kdaRatioLabel }})</span>
              </p>
              <p class="text-sm text-gray-400">
                <span v-if="match.gameDuration != null">{{ match.gameDuration }} minutes · </span>
                {{ formatDate(match.dateGameEnd, 'dd/MM/yyyy HH:mm') }}
              </p>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-if="(match.pentaKills ?? 0) > 0" class="match-badge penta-glow">
                  PENTAKILL
                </span>
                <span v-if="(match.quadraKills ?? 0) > 0" class="match-badge">Quadra kill</span>
                <span v-if="(match.tripleKills ?? 0) > 0" class="match-badge">Triple kill</span>
                <span v-if="(match.doubleKills ?? 0) > 0" class="match-badge">Double kill</span>
                <span v-if="match.firstBloodKill === true" class="match-badge">Premier sang</span>
                <span
                  v-if="match.gameEndedInSurrender === true"
                  class="match-badge !border-gray-600 !text-gray-400"
                >
                  Reddition
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="hextech-divider"></div>
      </div>

      <!-- Section Build -->
      <div class="hextech-card mt-8 animate-fade-in" style="animation-delay: 0.1s">
        <h2 class="hextech-title">Build</h2>

        <div v-if="hasBuild" class="flex flex-col md:flex-row md:items-center gap-8">
          <!-- Items -->
          <div class="flex items-center gap-1.5">
            <template v-for="(item, idx) in match.items" :key="idx">
              <!-- Divider avant le trinket (7e slot) -->
              <div v-if="idx === 6" class="w-px h-10 bg-lol-gold/40 mx-2"></div>
              <div
                class="w-12 h-12 border border-lol-gold/50 bg-lol-darker rounded-sm overflow-hidden"
                :class="{ 'empty-slot': item == null || assetStore.getItemIconUrl(item) == null }"
              >
                <img
                  v-if="item != null && assetStore.getItemIconUrl(item) != null"
                  :src="assetStore.getItemIconUrl(item)"
                  :alt="`Item ${item}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </template>
          </div>

          <!-- Sorts d'invocateur -->
          <div class="flex md:flex-col gap-1.5">
            <template
              v-for="(spellId, sIdx) in [match.summonerSpell1Id, match.summonerSpell2Id]"
              :key="sIdx"
            >
              <div
                v-if="spellId != null && assetStore.getSummonerSpellIconUrl(spellId) != null"
                class="w-10 h-10 border border-lol-gold/50 bg-lol-darker rounded-sm overflow-hidden"
              >
                <img
                  :src="assetStore.getSummonerSpellIconUrl(spellId)"
                  :alt="`Sort d'invocateur ${spellId}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </template>
          </div>

          <!-- Runes -->
          <div v-if="match.runeKeystoneId != null" class="flex items-center gap-4">
            <div class="relative">
              <img
                v-if="assetStore.getPerkIconUrl(match.runeKeystoneId) != null"
                :src="assetStore.getPerkIconUrl(match.runeKeystoneId)"
                alt="Rune principale"
                class="w-14 h-14 rounded-full border-2 border-lol-gold keystone-glow bg-lol-darker"
              />
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex gap-2">
                <img
                  v-if="assetStore.getPerkStyleIconUrl(match.runePrimaryStyleId) != null"
                  :src="assetStore.getPerkStyleIconUrl(match.runePrimaryStyleId)"
                  alt="Style principal"
                  class="w-7 h-7"
                />
                <img
                  v-if="assetStore.getPerkStyleIconUrl(match.runeSubStyleId) != null"
                  :src="assetStore.getPerkStyleIconUrl(match.runeSubStyleId)"
                  alt="Style secondaire"
                  class="w-7 h-7 opacity-80"
                />
              </div>
              <div class="flex gap-2">
                <template
                  v-for="(statId, stIdx) in [match.runeStatOffense, match.runeStatFlex, match.runeStatDefense]"
                  :key="stIdx"
                >
                  <img
                    v-if="statId != null && assetStore.getPerkIconUrl(statId) != null"
                    :src="assetStore.getPerkIconUrl(statId)"
                    :alt="`Fragment ${statId}`"
                    class="w-[22px] h-[22px] rounded-full border border-gray-600 bg-lol-darker"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-gray-500">
          Build non disponible pour ce match (données historiques).
        </p>
      </div>

      <!-- Section Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- Combat -->
        <div v-if="hasCombatStats" class="hextech-card animate-fade-in" style="animation-delay: 0.2s">
          <h2 class="hextech-title">Combat</h2>
          <DamageBarChart
            :damage-dealt="match.totalDamageDealtToChampions"
            :damage-taken="match.totalDamageTaken"
          />
          <p v-if="match.damagePerMinute != null" class="text-xs text-gray-400 mt-3 text-center">
            {{ Math.round(match.damagePerMinute).toLocaleString('fr-FR') }} dégâts / minute
          </p>
        </div>

        <!-- Impact -->
        <div
          v-if="match.killParticipation != null"
          class="hextech-card animate-fade-in"
          style="animation-delay: 0.3s"
        >
          <h2 class="hextech-title">Impact</h2>
          <div class="flex items-center justify-around">
            <KillParticipationGauge :value="match.killParticipation" />
            <div class="text-center">
              <p class="font-beaufort text-3xl font-bold" :class="kdaFormat.highlightClass">
                {{ kdaRatioLabel }}
              </p>
              <p class="text-xs uppercase tracking-widest text-gray-400 mt-1">KDA</p>
            </div>
          </div>
        </div>

        <!-- Radar vs moyennes -->
        <div v-if="radarAxes.length >= 3" class="hextech-card animate-fade-in" style="animation-delay: 0.4s">
          <h2 class="hextech-title">Performance vs moyennes</h2>
          <MatchRadarChart :axes="radarAxes" />
        </div>

        <!-- Économie & tempo -->
        <div v-if="statTiles.length" class="hextech-card animate-fade-in" style="animation-delay: 0.5s">
          <h2 class="hextech-title">Économie &amp; tempo</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatTile v-for="tile in statTiles" :key="tile.label" :label="tile.label" :value="tile.value" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { utilsTools } from '@/mixins/utilsTools.js'
import { LOADING_MESSAGES } from '@/assets/loadingMessages.js'
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import { useMatchDetailStore } from '@/stores/matchDetailStore'
import { useAssetCatalogStore } from '@/stores/assetCatalogStore'
import { usePlayerHistoryStore } from '@/stores/playerHistoryStore'
import { ArrowLeft, SearchX } from 'lucide-vue-next'
import DamageBarChart from '@/components/charts/DamageBarChart.vue'
import KillParticipationGauge from '@/components/charts/KillParticipationGauge.vue'
import MatchRadarChart from '@/components/charts/MatchRadarChart.vue'
import StatTile from '@/components/charts/StatTile.vue'

// Libellés d'affichage des rôles Riot
const ROLE_LABELS = {
  TOP: 'Toplane',
  JUNGLE: 'Jungle',
  MIDDLE: 'Midlane',
  BOTTOM: 'ADC',
  UTILITY: 'Support'
}

export default {
  name: 'MatchDetails',
  components: {
    ArrowLeft,
    SearchX,
    DamageBarChart,
    KillParticipationGauge,
    MatchRadarChart,
    StatTile
  },
  mixins: [utilsTools],
  created() {
    this.kdaFormatter = useKDAFormatter()
    this.matchDetailStore = useMatchDetailStore()
    this.assetStore = useAssetCatalogStore()
    this.playerHistoryStore = usePlayerHistoryStore()
  },
  data() {
    return {
      loading: false,
      invalidId: false,
      loadingMessage: LOADING_MESSAGES
    }
  },
  async mounted() {
    const id = Number(this.$route.params.id)
    // Id non numérique (/match/abc) : écran 404 direct, sans appel API
    if (!Number.isInteger(id) || id <= 0) {
      this.invalidId = true
      return
    }

    this.loading = true
    const accountId = Number(this.$route.query.accountId)
    await Promise.all([
      this.matchDetailStore.fetchMatchDetail(id),
      this.assetStore.loadCatalogs(),
      // L'historique du joueur alimente le radar "vs moyennes" ;
      // déjà en cache 30 min quand on arrive depuis l'accueil
      Number.isInteger(accountId) && accountId > 0
        ? this.playerHistoryStore.fetchListPlayerHistoryData(accountId).catch(() => {})
        : Promise.resolve()
    ])
    this.loading = false
  },
  computed: {
    match() {
      return this.matchDetailStore.matchDetail
    },
    notFound() {
      return this.invalidId || this.matchDetailStore.notFound
    },
    error() {
      return this.matchDetailStore.error
    },
    playerName() {
      return this.$route.query.player ?? null
    },
    roleLabel() {
      if (!this.match?.teamPosition) return null
      return ROLE_LABELS[this.match.teamPosition] ?? this.match.teamPosition
    },
    kdaFormat() {
      return this.kdaFormatter.formatKDA(this.match.kill, this.match.deaths, this.match.assist)
    },
    kdaRatioLabel() {
      // Le KDA des challenges Riot fait foi quand il existe, sinon calcul local
      const ratio = this.match.kda ?? this.kdaFormat.ratio
      return Number(ratio).toFixed(2)
    },
    hasBuild() {
      return (
        this.match.items.some((i) => i != null) ||
        this.match.summonerSpell1Id != null ||
        this.match.runeKeystoneId != null
      )
    },
    hasCombatStats() {
      return this.match.totalDamageDealtToChampions != null || this.match.totalDamageTaken != null
    },
    // Historique léger du joueur (radar), hors match affiché
    playerHistory() {
      const accountId = Number(this.$route.query.accountId)
      if (!Number.isInteger(accountId) || accountId <= 0) return []
      return (this.playerHistoryStore.historiesById[accountId] ?? []).filter(
        (h) => h.id !== this.match.id
      )
    },
    // Axes communs aux deux sources (détail ET historique léger) :
    // Kills, Assists, Survie (inverse des morts), CS/min, Vision/min
    radarAxes() {
      const history = this.playerHistory
      if (!history.length) return []

      const perMin = (value, duration) =>
        value != null && duration != null && duration > 0 ? value / duration : null

      const avgOf = (values) => {
        const clean = values.filter((v) => v != null)
        return clean.length ? clean.reduce((sum, v) => sum + v, 0) / clean.length : null
      }

      const candidates = [
        {
          label: 'Kills',
          value: this.match.kill,
          avg: avgOf(history.map((h) => h.kill))
        },
        {
          label: 'Assists',
          value: this.match.assist,
          avg: avgOf(history.map((h) => h.assist))
        },
        {
          // Plus haut = mieux : 1/(morts+1) évite la division par zéro
          label: 'Survie',
          value: 1 / (this.match.deaths + 1),
          avg: avgOf(history.map((h) => (h.deaths != null ? 1 / (h.deaths + 1) : null)))
        },
        {
          label: 'CS/min',
          value: perMin(this.match.creepScore, this.match.gameDuration),
          avg: avgOf(history.map((h) => perMin(h.creepScore, h.gameDuration)))
        },
        {
          label: 'Vision/min',
          value: perMin(this.match.visionScore, this.match.gameDuration),
          avg: avgOf(history.map((h) => perMin(h.visionScore, h.gameDuration)))
        },
        // Challenges Riot, exposés dans la collection depuis l'enrichissement
        // de l'API : absents des vieux matchs, l'axe disparaît alors du radar
        {
          label: 'Dégâts/min',
          value: this.match.damagePerMinute,
          avg: avgOf(history.map((h) => h.damagePerMinute))
        },
        {
          label: 'Or/min',
          value: this.match.goldPerMinute,
          avg: avgOf(history.map((h) => h.goldPerMinute))
        }
      ]

      // Un axe sans valeur ou sans moyenne fausserait le polygone : on l'écarte
      return candidates.filter((a) => a.value != null && a.avg != null)
    },
    statTiles() {
      const tiles = []
      if (this.match.damagePerMinute != null) {
        tiles.push({ label: 'Dégâts / min', value: Math.round(this.match.damagePerMinute).toLocaleString('fr-FR') })
      }
      if (this.match.goldPerMinute != null) {
        tiles.push({ label: 'Or / min', value: Math.round(this.match.goldPerMinute).toLocaleString('fr-FR') })
      }
      if (this.match.visionScorePerMinute != null) {
        tiles.push({ label: 'Vision / min', value: this.match.visionScorePerMinute.toFixed(2) })
      }
      if (
        this.match.creepScore != null &&
        this.match.gameDuration != null &&
        this.match.gameDuration > 0
      ) {
        tiles.push({
          label: 'CS / min',
          value: (this.match.creepScore / this.match.gameDuration).toFixed(1)
        })
      }
      if (this.match.goldEarned != null) {
        tiles.push({
          label: 'Or total',
          value: `${(this.match.goldEarned / 1000).toFixed(1).replace('.', ',')}k`
        })
      }
      return tiles
    }
  }
}
</script>

<style scoped>
/* Couleurs KDA (mêmes valeurs que PlayerDetails.vue) */
.text-lol-perfect {
  color: #fcc419;
}
.text-lol-excellent {
  color: #81c784;
}
.text-lol-good {
  color: #ffee58;
}
.text-lol-poor {
  color: #ef5350;
}

.win-glow {
  text-shadow: 0 0 18px rgba(200, 170, 110, 0.45);
}

.keystone-glow {
  box-shadow: 0 0 10px rgba(10, 200, 185, 0.5);
}

.match-badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(200, 170, 110, 0.6);
  color: var(--color-lol-gold);
  background-color: rgba(10, 20, 40, 0.7);
  border-radius: 0.125rem;
  font-family: var(--font-beaufort);
}

.penta-glow {
  animation: pentaPulse 1.6s ease-in-out infinite;
}

@keyframes pentaPulse {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(10, 200, 185, 0.4);
  }
  50% {
    box-shadow: 0 0 14px rgba(10, 200, 185, 0.85);
  }
}

/* Slot d'item vide : motif diagonal subtil */
.empty-slot {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(200, 170, 110, 0.06) 4px,
    rgba(200, 170, 110, 0.06) 8px
  );
}
</style>
