<template>
  <div>
    <div class="hextech-divider"></div>
    <div
      class="relative overflow-hidden"
      style="background-image: linear-gradient(to right, #091428 30%, rgba(9, 20, 40, 0.85))"
    >
      <div class="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8">
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
            class="w-auto object-contain drop-shadow-lg"
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
            <StatTile label="LP" :value="`${account.rankedSoloPoints ?? 0}`" />
            <StatTile label="Win Rate" :value="`${winrate}%`" />
            <StatTile
              label="V / D"
              :value="`${account.rankedSoloWins ?? 0} / ${account.rankedSoloLosses ?? 0}`"
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
import { Flame, Medal, Sparkles } from 'lucide-vue-next'
import StatTile from '@/components/charts/StatTile.vue'

export default {
  name: 'AccountHeader',
  components: { Flame, Medal, Sparkles, StatTile },
  props: {
    account: {
      type: Object,
      required: true
    }
  },
  mixins: [utilsTools],
  computed: {
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
      return `${tier} ${this.account.rankedSoloRanks ?? ''}`.trim()
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
