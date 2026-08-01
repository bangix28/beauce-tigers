<template>
  <div v-if="championStats.length" class="flex flex-col gap-2">
    <div
      v-for="champ in championStats"
      :key="champ.championId"
      class="flex items-center gap-3 p-2 bg-gray-800/50 rounded"
    >
      <img
        alt="Icône du Champion"
        class="w-10 h-10 rounded-full border border-lol-gold flex-shrink-0"
        :src="getUrlIconChampion(champ.championId)"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-lol-gold truncate">
          {{ champ.championName ?? `Champion ${champ.championId}` }}
        </p>
        <p class="text-xs text-gray-400">
          {{ champ.games }} {{ champ.games > 1 ? 'games' : 'game' }} · KDA {{ champ.kdaRatio.toFixed(2) }}
        </p>
      </div>
      <div class="text-right flex-shrink-0">
        <p
          class="text-sm font-extrabold"
          :class="champ.winrate > 50 ? 'text-green-400' : 'text-red-400'"
        >
          {{ champ.winrate }}%
        </p>
        <p class="text-xs text-gray-500">{{ champ.wins }}V / {{ champ.games - champ.wins }}D</p>
      </div>
    </div>
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">Aucun historique disponible.</p>
</template>

<script>
import { utilsTools } from '@/mixins/utilsTools.js'
import { useKDAFormatter } from '@/composables/useKdaFormatter'

export default {
  name: 'ChampionsPlayedList',
  props: {
    histories: {
      type: Array,
      default: () => []
    }
  },
  mixins: [utilsTools],
  created() {
    this.kdaFormatter = useKDAFormatter()
  },
  computed: {
    championStats() {
      const byChampion = {}

      for (const h of this.histories) {
        const entry = (byChampion[h.champion] ??= {
          championId: h.champion,
          championName: h.championName,
          games: 0,
          wins: 0,
          sumKill: 0,
          sumDeaths: 0,
          sumAssist: 0
        })
        entry.games += 1
        if (h.win) entry.wins += 1
        entry.sumKill += h.kill ?? 0
        entry.sumDeaths += h.deaths ?? 0
        entry.sumAssist += h.assist ?? 0
        // Certains vieux matchs n'ont pas le nom : on garde le premier connu
        entry.championName ??= h.championName
      }

      return Object.values(byChampion)
        .map((c) => ({
          ...c,
          winrate: Math.round((c.wins / c.games) * 100),
          // Ratio agrégé sur l'ensemble des games du champion
          kdaRatio: this.kdaFormatter.formatKDA(c.sumKill, c.sumDeaths, c.sumAssist).ratio
        }))
        .sort((a, b) => b.games - a.games || b.winrate - a.winrate)
    }
  }
}
</script>
