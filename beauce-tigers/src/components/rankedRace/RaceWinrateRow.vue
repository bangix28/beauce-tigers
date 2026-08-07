<template>
  <div>
    <!-- Desktop -->
    <div class="hidden md:grid grid-cols-12 gap-2 items-center p-4">
      <div
        class="col-span-1 font-extrabold text-lg"
        :class="rank === 1 ? 'text-lol-gold' : 'text-gray-400'"
      >
        {{ rank != null ? `#${rank}` : '—' }}
      </div>

      <div class="col-span-4">
        <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
      </div>

      <div class="col-span-3 font-bold">
        <span class="text-green-400">{{ entry.wins }}V</span>
        <span class="text-gray-600"> / </span>
        <span class="text-red-400">{{ entry.losses }}D</span>
      </div>

      <div class="col-span-2">
        <template v-if="rank != null">
          <span class="text-gray-300 font-bold">{{ entry.gamesPlayed }}</span>
        </template>
        <template v-else>
          <span class="text-gray-400 text-sm">{{ entry.gamesPlayed }}/{{ gamesRequired }}</span>
          <!-- Seuil court : une pastille par partie, comme les séries de promotion -->
          <span v-if="gaugeSlots" class="flex items-center gap-1 mt-1">
            <span
              v-for="slot in gaugeSlots"
              :key="slot.index"
              class="w-2 h-2 rounded-sm"
              :class="slot.filled ? 'bg-lol-gold' : 'bg-gray-700'"
            ></span>
          </span>
          <!-- Seuil long (événements à 15 parties) : une barre, sinon la
               colonne déborde de sa largeur -->
          <span v-else class="block w-20 h-1.5 bg-gray-700 rounded-sm mt-2 overflow-hidden">
            <span class="block h-full bg-lol-gold" :style="{ width: `${gaugePercent}%` }"></span>
          </span>
        </template>
      </div>

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
    <div class="md:hidden p-4 flex items-center gap-3">
      <span
        class="font-extrabold text-base w-8 flex-shrink-0"
        :class="rank === 1 ? 'text-lol-gold' : 'text-gray-400'"
        >{{ rank != null ? `#${rank}` : '—' }}</span
      >
      <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />
      <div class="ml-auto text-right flex-shrink-0">
        <span
          class="block font-extrabold"
          :class="
            entry.winrate == null
              ? 'text-gray-600'
              : entry.winrate >= 50
                ? 'text-green-400'
                : 'text-red-400'
          "
          >{{ entry.winrate == null ? '—' : entry.winrate + '%' }}</span
        >
        <span class="block text-xs text-gray-500">
          {{ entry.wins }}V / {{ entry.losses }}D
          <template v-if="rank == null"> · {{ entry.gamesPlayed }}/{{ gamesRequired }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import RacePlayerCell from './RacePlayerCell.vue'

// Au-delà, les pastilles débordent de la colonne : on bascule sur une barre.
// Les événements admin montent jusqu'à 15 parties requises.
const GAUGE_MAX_SLOTS = 8

// Une ligne du classement winrate. rank à null = joueur non qualifié : la
// colonne parties devient une jauge vers le seuil au lieu d'un simple total.
export default {
  name: 'RaceWinrateRow',
  components: { RacePlayerCell },
  props: {
    entry: { type: Object, required: true },
    rank: { type: Number, default: null },
    gamesRequired: { type: Number, required: true }
  },
  computed: {
    /** Pastilles discrètes, ou null si le seuil est trop haut pour tenir */
    gaugeSlots() {
      if (this.gamesRequired < 1 || this.gamesRequired > GAUGE_MAX_SLOTS) return null

      return Array.from({ length: this.gamesRequired }, (_, index) => ({
        index,
        filled: index < this.entry.gamesPlayed
      }))
    },
    gaugePercent() {
      if (this.gamesRequired < 1) return 0
      return Math.min(100, (this.entry.gamesPlayed / this.gamesRequired) * 100)
    }
  }
}
</script>
