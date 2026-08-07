<template>
  <div>
    <!-- En-tête desktop -->
    <div
      class="hidden md:grid grid-cols-12 gap-2 items-center px-4 pb-3 text-xs font-semibold text-gray-400 border-b border-gray-800 font-beaufort"
    >
      <div class="col-span-1">#</div>
      <div class="col-span-3">Invocateur</div>
      <div class="col-span-3">Départ → Arrivée</div>
      <div class="col-span-2">
        <HextechTooltip
          title="Progression pondérée"
          description="Chaque gain quotidien est multiplié par le coefficient du tier de départ (IRON/BRONZE 1.0 jusqu'à MASTER+ 2.2) : monter en haut de l'échelle rapporte plus qu'en bas. La valeur brute est rappelée en dessous."
        >
          <span class="cursor-help border-b border-dotted border-gray-600">Δ pondéré</span>
        </HextechTooltip>
      </div>
      <div class="col-span-1">Parties</div>
      <div class="col-span-2">Winrate</div>
    </div>

    <div class="divide-y divide-gray-800/70">
      <div
        v-for="(entry, index) in entries"
        :key="entry.riotId"
        class="group transition-colors duration-200 animate-fade-in-stagger"
        :class="
          entry.rankWeighted === 1
            ? 'bg-lol-gold/10 border-l-4 border-lol-gold'
            : 'hover:bg-gray-800/40'
        "
        :style="{ animationDelay: rowDelay(index) }"
      >
        <!-- Desktop -->
        <div class="hidden md:grid grid-cols-12 gap-2 items-center p-4">
          <div class="col-span-1">
            <span
              class="font-extrabold text-lg"
              :class="entry.rankWeighted === 1 ? 'text-lol-gold' : 'text-gray-400'"
              >#{{ entry.rankWeighted }}</span
            >
            <!-- Renvoi vers l'autre tableau : le rang de l'API (rankRaw) est
                 calculé sur le raceScore, pas sur les LP, il contredirait le
                 classement aux LP nets affiché juste en dessous -->
            <span
              v-if="lpRank(entry) && lpRank(entry) !== entry.rankWeighted"
              class="block text-[0.65rem] text-gray-600"
              :title="`${lpRank(entry)}e au classement aux LP nets`"
              >LP #{{ lpRank(entry) }}</span
            >
          </div>

          <div class="col-span-3 flex items-center gap-1.5">
            <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
            <component
              :is="tierMove(entry).icon"
              v-if="tierMove(entry)"
              class="w-4 h-4 flex-shrink-0"
              :class="tierMove(entry).color"
              :title="tierMove(entry).title"
            />
          </div>

          <div class="col-span-3 flex items-center gap-2 min-w-0">
            <img
              :src="getUrlTierEmblem(entry.start.tier)"
              :alt="entry.start.tier"
              class="h-9 w-auto object-contain opacity-60 flex-shrink-0"
            />
            <ArrowRight class="w-3.5 h-3.5 text-lol-blue flex-shrink-0" />
            <img
              :src="getUrlTierEmblem(entry.end.tier)"
              :alt="entry.end.tier"
              class="h-10 w-auto object-contain drop-shadow-lg flex-shrink-0"
            />
            <span class="text-xs font-bold truncate" :class="tierColor(entry.end.tier)">{{
              rankLabel(entry.end)
            }}</span>
          </div>

          <div class="col-span-2">
            <span
              class="font-beaufort text-lg font-extrabold"
              :class="entry.weightedDelta >= 0 ? 'text-green-400' : 'text-red-400'"
              >{{ signed(entry.weightedDelta, 1) }}</span
            >
            <!-- rawDelta serait trompeur ici (1000 points par tier au lieu de
                 400) : on rappelle les LP réellement encaissés -->
            <span v-if="entry.netLp != null" class="block text-[0.65rem] text-gray-500"
              >{{ signed(entry.netLp, 0) }} LP nets</span
            >
          </div>

          <div class="col-span-1 text-gray-300 font-bold">{{ entry.gamesPlayed }}</div>

          <div class="col-span-2">
            <span v-if="entry.winrate == null" class="text-gray-600">—</span>
            <span
              v-else
              class="font-extrabold"
              :class="entry.winrate >= 50 ? 'text-green-400' : 'text-red-400'"
              >{{ entry.winrate }}%</span
            >
          </div>
        </div>

        <!-- Mobile -->
        <div class="md:hidden p-4">
          <div class="flex items-center gap-3">
            <span
              class="font-extrabold text-base w-8 flex-shrink-0"
              :class="entry.rankWeighted === 1 ? 'text-lol-gold' : 'text-gray-400'"
              >#{{ entry.rankWeighted }}</span
            >
            <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
          </div>

          <p class="mt-2 text-xs text-gray-400">
            {{ rankLabel(entry.start) }} →
            <span :class="tierColor(entry.end.tier)">{{ rankLabel(entry.end) }}</span>
          </p>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div class="bg-gray-800/60 rounded-sm p-2 border border-gray-700">
              <span
                class="block font-beaufort font-extrabold"
                :class="entry.weightedDelta >= 0 ? 'text-green-400' : 'text-red-400'"
                >{{ signed(entry.weightedDelta, 1) }}</span
              >
              <span class="text-[0.6rem] uppercase tracking-widest text-gray-500">Δ pondéré</span>
            </div>
            <div class="bg-gray-800/60 rounded-sm p-2 border border-gray-700">
              <span class="block font-beaufort font-extrabold text-gray-200">{{
                entry.gamesPlayed
              }}</span>
              <span class="text-[0.6rem] uppercase tracking-widest text-gray-500">Parties</span>
            </div>
            <div class="bg-gray-800/60 rounded-sm p-2 border border-gray-700">
              <span
                class="block font-beaufort font-extrabold"
                :class="
                  entry.winrate == null
                    ? 'text-gray-600'
                    : entry.winrate >= 50
                      ? 'text-green-400'
                      : 'text-red-400'
                "
                >{{ entry.winrate == null ? '—' : entry.winrate + '%' }}</span
              >
              <span class="text-[0.6rem] uppercase tracking-widest text-gray-500">Winrate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight, ChevronsDown, ChevronsUp } from 'lucide-vue-next'
import HextechTooltip from '@/components/HextechTooltip.vue'
import RacePlayerCell from './RacePlayerCell.vue'
import { staggerDelay } from '@/utils/animation'
import { formatRankLabel, hasTierChanged } from '@/utils/raceMapper'
import { getTierColorClass } from '@/utils/rank'
import { utilsTools } from '@/mixins/utilsTools.js'

// Classement principal : trié sur la progression pondérée, avec un renvoi vers
// le classement aux LP nets quand les deux divergent.
export default {
  name: 'RaceProgressionTable',
  components: { ArrowRight, ChevronsDown, ChevronsUp, HextechTooltip, RacePlayerCell },
  mixins: [utilsTools],
  props: {
    entries: { type: Array, required: true },
    /** riotId → rang au classement LP, pour le renvoi croisé */
    lpRankByRiotId: { type: Object, default: () => ({}) }
  },
  methods: {
    rowDelay(index) {
      return staggerDelay(index)
    },
    lpRank(entry) {
      return this.lpRankByRiotId[entry.riotId] ?? null
    },
    rankLabel(snapshot) {
      return formatRankLabel(snapshot)
    },
    tierColor(tier) {
      return getTierColorClass(tier)
    },
    tierMove(entry) {
      if (!hasTierChanged(entry.start, entry.end)) return null

      return entry.end.raceScore >= entry.start.raceScore
        ? { icon: 'ChevronsUp', color: 'text-lol-gold', title: 'Changement de tier vers le haut' }
        : { icon: 'ChevronsDown', color: 'text-red-400', title: 'Chute de tier' }
    },
    signed(value, digits) {
      const formatted = value.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits
      })
      return value > 0 ? `+${formatted}` : formatted
    }
  }
}
</script>
