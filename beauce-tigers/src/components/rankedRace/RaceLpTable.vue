<template>
  <div>
    <!-- En-tête desktop -->
    <div
      class="hidden md:grid grid-cols-12 gap-2 items-center px-4 pb-3 text-xs font-semibold text-gray-400 border-b border-gray-800 font-beaufort"
    >
      <div class="col-span-1">#</div>
      <div class="col-span-4">Invocateur</div>
      <div class="col-span-3">Parcours</div>
      <div class="col-span-2">
        <HextechTooltip
          title="LP gagnés"
          description="Différence de LP entre le premier et le dernier relevé, sur une échelle linéaire : 100 LP par division, 400 par tier. Aucune pondération — un LP de Fer vaut un LP de Challenger."
        >
          <span class="cursor-help border-b border-dotted border-gray-600">LP nets</span>
        </HextechTooltip>
      </div>
      <div class="col-span-2">Parties</div>
    </div>

    <div class="divide-y divide-gray-800/70">
      <div
        v-for="(entry, index) in entries"
        :key="entry.riotId"
        class="group transition-colors duration-200 animate-fade-in-stagger"
        :class="index === 0 ? 'bg-lol-gold/10 border-l-4 border-lol-gold' : 'hover:bg-gray-800/40'"
        :style="{ animationDelay: rowDelay(index) }"
      >
        <!-- Desktop -->
        <div class="hidden md:grid grid-cols-12 gap-2 items-center p-4">
          <div
            class="col-span-1 font-extrabold text-lg"
            :class="index === 0 ? 'text-lol-gold' : 'text-gray-400'"
          >
            #{{ index + 1 }}
          </div>

          <div class="col-span-4">
            <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
          </div>

          <div class="col-span-3 flex items-center gap-2 min-w-0">
            <img
              :src="getUrlTierEmblem(entry.start.tier)"
              :alt="entry.start.tier"
              class="h-8 w-auto object-contain opacity-60 flex-shrink-0"
            />
            <ArrowRight class="w-3.5 h-3.5 text-lol-blue flex-shrink-0" />
            <img
              :src="getUrlTierEmblem(entry.end.tier)"
              :alt="entry.end.tier"
              class="h-9 w-auto object-contain drop-shadow-lg flex-shrink-0"
            />
            <span class="text-xs font-bold truncate" :class="tierColor(entry.end.tier)">{{
              rankLabel(entry.end)
            }}</span>
          </div>

          <div class="col-span-2">
            <span
              class="font-beaufort text-lg font-extrabold"
              :class="entry.netLp >= 0 ? 'text-green-400' : 'text-red-400'"
              >{{ signed(entry.netLp) }}</span
            >
            <span class="text-xs text-gray-500"> LP</span>
          </div>

          <div class="col-span-2 text-gray-300 font-bold">
            {{ entry.gamesPlayed }}
            <span
              v-if="entry.gamesPlayed > 0"
              class="block text-[0.65rem] font-normal text-gray-500"
              >{{ signed(perGame(entry)) }} LP / partie</span
            >
          </div>
        </div>

        <!-- Mobile -->
        <div class="md:hidden p-4 flex items-center gap-3">
          <span
            class="font-extrabold text-base w-8 flex-shrink-0"
            :class="index === 0 ? 'text-lol-gold' : 'text-gray-400'"
            >#{{ index + 1 }}</span
          >
          <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
          <div class="ml-auto text-right flex-shrink-0">
            <span
              class="block font-beaufort font-extrabold"
              :class="entry.netLp >= 0 ? 'text-green-400' : 'text-red-400'"
              >{{ signed(entry.netLp) }} LP</span
            >
            <span class="block text-xs text-gray-500"
              >{{ entry.gamesPlayed }} partie{{ entry.gamesPlayed > 1 ? 's' : '' }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight } from 'lucide-vue-next'
import HextechTooltip from '@/components/HextechTooltip.vue'
import RacePlayerCell from './RacePlayerCell.vue'
import { staggerDelay } from '@/utils/animation'
import { formatRankLabel } from '@/utils/raceMapper'
import { getTierColorClass } from '@/utils/rank'
import { utilsTools } from '@/mixins/utilsTools.js'

// Classement aux LP nets : la course sans pondération de tier, celui qui a
// simplement encaissé le plus de LP. Reçoit les entrées déjà triées par
// rankByNetLp, d'où le rang dérivé de l'index.
export default {
  name: 'RaceLpTable',
  components: { ArrowRight, HextechTooltip, RacePlayerCell },
  mixins: [utilsTools],
  props: {
    entries: { type: Array, required: true }
  },
  methods: {
    rowDelay(index) {
      return staggerDelay(index)
    },
    rankLabel(snapshot) {
      return formatRankLabel(snapshot)
    },
    tierColor(tier) {
      return getTierColorClass(tier)
    },
    perGame(entry) {
      return Math.round(entry.netLp / entry.gamesPlayed)
    },
    signed(value) {
      return `${value > 0 ? '+' : ''}${value.toLocaleString('fr-FR')}`
    }
  }
}
</script>
