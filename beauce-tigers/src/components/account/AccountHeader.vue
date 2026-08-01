<template>
  <div>
    <div class="hextech-divider"></div>
    <!-- Splash du champion le plus joué en fond ; le clic sur la bannière joue
         une réplique VF du champion (sélection ou ban, au hasard) -->
    <div
      class="group relative overflow-hidden"
      :class="{ 'cursor-pointer': mostPlayedChampion }"
      :title="mostPlayedChampion ? `Clique pour entendre ${mostPlayedChampion.championName ?? 'le champion'}` : null"
      @click="playChampionVoice"
    >
      <!-- Calque de fond séparé : le splash zoome lentement au survol sans toucher au contenu -->
      <div
        class="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
        :style="bannerStyle"
      ></div>
      <span
        v-if="mostPlayedChampion"
        class="absolute bottom-2 right-3 z-10 flex items-center gap-1.5 text-xs text-lol-gold/70 pointer-events-none transition-colors duration-300 group-hover:text-lol-gold group-hover:animate-pulse"
      >
        <Volume2 class="w-3.5 h-3.5" />
        <span v-if="mostPlayedChampion.championName" class="font-beaufort">
          {{ mostPlayedChampion.championName }}
        </span>
      </span>
      <div class="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8">
        <!-- Identité -->
        <div class="flex flex-col items-center gap-2">
          <img
            alt="Icône d'invocateur"
            class="w-24 h-24 rounded-full border-2 border-lol-gold"
            :src="getUrlIconSummoner(account.logoId)"
          />
          <div class="flex items-center gap-1.5">
            <p class="font-beaufort font-bold text-2xl text-white">{{ account.name }}</p>
            <span v-if="account.soloHotStreak" title="Série de victoires en cours">
              <Flame class="w-5 h-5 text-orange-400" />
            </span>
            <span v-if="account.soloVeteran" title="Vétéran de la division (100+ parties)">
              <Medal class="w-4 h-4 text-gray-500" />
            </span>
            <span v-if="account.soloFreshBlood" title="Nouveau dans la division">
              <Sparkles class="w-4 h-4 text-gray-500" />
            </span>
          </div>
          <p class="text-xs text-gray-400">Niveau {{ account.level }}</p>
        </div>

        <!-- Rang -->
        <div class="flex flex-col items-center" :title="rankTitle">
          <img
            :src="tierEmblemUrl"
            :alt="rankTitle"
            class="w-auto object-contain drop-shadow-lg transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(200,170,110,0.5)]"
            :class="isUnranked ? 'h-16' : 'h-28'"
          />
          <span
            v-if="divisionLabel"
            class="text-sm font-bold tracking-widest"
            :class="tierColorClass"
          >
            {{ divisionLabel }}
          </span>
          <div
            v-if="miniSeriesSlots.length"
            class="mt-1 flex items-center gap-1"
            :title="`Série de promotion : ${account.soloMiniSeriesWins ?? 0}V / ${account.soloMiniSeriesLosses ?? 0}D`"
          >
            <span
              v-for="(slot, i) in miniSeriesSlots"
              :key="i"
              class="w-2 h-2 rounded-full"
              :class="slot === 'W' ? 'bg-green-400' : slot === 'L' ? 'bg-red-400' : 'bg-gray-600'"
            ></span>
          </div>
        </div>

        <!-- Stats SoloQ -->
        <div class="md:ml-auto flex flex-col items-center md:items-end gap-3">
          <div v-if="isRanked" class="grid grid-cols-3 gap-3">
            <StatTile
              label="LP"
              :value="`${Math.round(animatedLp)}`"
              explanation="Points de ligue dans la division actuelle : 100 LP déclenchent la montée en division supérieure."
            />
            <StatTile
              label="Win Rate"
              :value="`${animatedWinrate.toFixed(2)}%`"
              explanation="Pourcentage de victoires sur l'ensemble des games classées en solo queue de la saison."
            />
            <StatTile
              label="V / D"
              :value="`${Math.round(animatedWins)} / ${Math.round(animatedLosses)}`"
              explanation="Victoires et défaites en solo queue sur la saison en cours."
            />
          </div>
          <p v-if="account.lastUpdate" class="text-xs text-gray-500">
            Mis à jour le {{ formatDate(account.lastUpdate, 'dd/MM/yyyy HH:mm') }}
          </p>
        </div>
      </div>
    </div>
    <div class="hextech-divider"></div>
  </div>
</template>

<script>
import { utilsTools } from '@/mixins/utilsTools.js'
import { getTierColorClass } from '@/utils/rank'
import { animateCount } from '@/composables/useCountUp'
import { Flame, Medal, Sparkles, Volume2 } from 'lucide-vue-next'
import StatTile from '@/components/charts/StatTile.vue'

export default {
  name: 'AccountHeader',
  components: { Flame, Medal, Sparkles, Volume2, StatTile },
  props: {
    account: {
      type: Object,
      required: true
    },
    // Derniers matchs affichés par la page (ordre API : plus récent en premier),
    // chargés en asynchrone : le splash et le bloc champion apparaissent réactivement
    histories: {
      type: Array,
      default: () => []
    }
  },
  mixins: [utilsTools],
  data() {
    return {
      // Valeurs affichées par les tuiles, animées de 0 vers la vraie valeur
      animatedLp: 0,
      animatedWinrate: 0,
      animatedWins: 0,
      animatedLosses: 0
    }
  },
  watch: {
    // immediate : lance le count-up à l'arrivée ; se relance si on navigue
    // d'un compte à l'autre (/account/1 → /account/2, instance réutilisée)
    account: {
      immediate: true,
      handler() {
        animateCount(this.account.rankedSoloPoints ?? 0, (v) => (this.animatedLp = v))
        animateCount(Number(this.winrate), (v) => (this.animatedWinrate = v))
        animateCount(this.account.rankedSoloWins ?? 0, (v) => (this.animatedWins = v))
        animateCount(this.account.rankedSoloLosses ?? 0, (v) => (this.animatedLosses = v))
      }
    }
  },
  methods: {
    playChampionVoice() {
      // Historique pas encore chargé : la bannière n'a pas de champion à faire parler
      if (!this.mostPlayedChampion) return
      // Le tirage choose/ban se fait ici, au clic (une computed figerait la
      // même réplique tant que le composant ne re-render pas)
      this.playAudioFrom(this.getUrlChampionVoiceLine(this.mostPlayedChampion.championId))
    }
  },
  computed: {
    mostPlayedChampion() {
      const counts = {}
      for (const h of this.histories) {
        const entry = (counts[h.champion] ??= {
          championId: h.champion,
          championName: h.championName,
          games: 0
        })
        entry.games += 1
        entry.championName ??= h.championName
      }
      // Égalité de games : le premier rencontré gagne (liste DESC = le plus récent)
      return Object.values(counts).reduce(
        (best, c) => (best === null || c.games > best.games ? c : best),
        null
      )
    },
    bannerStyle() {
      // Repli sur le dégradé seul tant que l'historique n'est pas chargé
      if (!this.mostPlayedChampion) {
        return {
          backgroundImage: 'linear-gradient(to right, #091428 30%, rgba(9, 20, 40, 0.85))'
        }
      }
      // Même gradient que la bannière de la page match : 15 % opaque à gauche
      // pour garder le texte lisible sur le splash
      return {
        backgroundImage: `linear-gradient(to right, #091428 15%, rgba(9,20,40,.75) 60%, rgba(9,20,40,.55)), url(${this.getUrlChampionSplash(this.mostPlayedChampion.championId)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%'
      }
    },
    isRanked() {
      // != null couvre null ET undefined : un joueur à 0 LP reste affiché
      return this.account.rankedSoloPoints != null
    },
    tierEmblemUrl() {
      return this.getUrlTierEmblem(this.account.rankedSoloTiers)
    },
    rankTitle() {
      const tier = this.account.rankedSoloTiers
      if (!tier || tier === 'UNRANKED') return 'UNRANKED — le poro fait la sieste'
      let title = `${tier} ${this.account.rankedSoloRanks ?? ''}`.trim()
      if (this.account.rankedSoloPoints != null) {
        title += ` · ${this.account.rankedSoloPoints} LP`
      }
      if (this.account.soloMiniSeriesTarget) {
        title += ` · Série Bo${2 * this.account.soloMiniSeriesTarget - 1} : ${this.account.soloMiniSeriesWins ?? 0}V/${this.account.soloMiniSeriesLosses ?? 0}D`
      }
      return title
    },
    divisionLabel() {
      const rank = this.account.rankedSoloRanks
      if (!rank || rank === 'UNRANKED') return null
      return rank
    },
    isUnranked() {
      const tier = this.account.rankedSoloTiers
      return !tier || tier === 'UNRANKED'
    },
    tierColorClass() {
      return getTierColorClass(this.account.rankedSoloTiers)
    },
    winrate() {
      return this.calculateWinrate(this.account.rankedSoloWins, this.account.rankedSoloLosses)
    },
    miniSeriesSlots() {
      const p = this.account
      if (!p.soloMiniSeriesTarget) return []
      const progress = (p.soloMiniSeriesProgress || '').toUpperCase()
      const total = 2 * p.soloMiniSeriesTarget - 1 // Bo5 (target 3) → 5 pastilles
      return Array.from({ length: total }, (_, i) => progress[i] || 'N')
    }
  }
}
</script>
