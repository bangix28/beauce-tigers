<template>
  <div v-if="histories.length">
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <!-- Winrate des matchs affichés -->
      <KillParticipationGauge :value="winRatio" label="Winrate" />

      <div class="flex flex-col items-center sm:items-start gap-3">
        <!-- Série V/D chronologique (gauche = plus ancien) -->
        <div
          class="flex items-center gap-1.5"
          :title="`${wins} victoire(s), ${histories.length - wins} défaite(s)`"
        >
          <span
            v-for="(win, i) in chronologicalResults"
            :key="i"
            class="w-2.5 h-2.5 rounded-full"
            :class="win ? 'bg-green-400' : 'bg-red-400'"
          ></span>
        </div>

        <!-- KDA moyen par match + ratio agrégé -->
        <div>
          <p class="text-lg font-semibold">
            <span v-html="kdaFormat.htmlKDA"></span>
            <span class="text-gray-400 text-sm ml-2">({{ kdaFormat.ratio.toFixed(2) }})</span>
          </p>
          <p class="text-xs uppercase tracking-widest text-gray-400 mt-1">
            KDA moyen par match
          </p>
        </div>
      </div>
    </div>

    <div v-if="statTiles.length" class="grid grid-cols-2 gap-3 mt-6">
      <StatTile v-for="tile in statTiles" :key="tile.label" :label="tile.label" :value="tile.value" />
    </div>
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">Aucun historique disponible.</p>
</template>

<script>
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import KillParticipationGauge from '@/components/charts/KillParticipationGauge.vue'
import StatTile from '@/components/charts/StatTile.vue'

// Moyenne en écartant les null (vieux matchs sans challenges Riot) : les
// compter comme 0 tirerait les stats vers le bas artificiellement
const avgOf = (values) => {
  const clean = values.filter((v) => v != null)
  return clean.length ? clean.reduce((sum, v) => sum + v, 0) / clean.length : null
}

export default {
  name: 'RecentFormSummary',
  components: { KillParticipationGauge, StatTile },
  props: {
    // Les matchs affichés par la page (ordre API : plus récent en premier)
    histories: {
      type: Array,
      default: () => []
    }
  },
  created() {
    this.kdaFormatter = useKDAFormatter()
  },
  computed: {
    wins() {
      return this.histories.filter((h) => h.win).length
    },
    winRatio() {
      return this.histories.length ? this.wins / this.histories.length : 0
    },
    chronologicalResults() {
      // La liste arrive DESC : on l'inverse pour lire la forme de gauche à droite
      return this.histories.map((h) => h.win).reverse()
    },
    kdaFormat() {
      // Moyennes par match (1 décimale) ; le ratio agrégé (somme K+A / somme D)
      // est plus robuste qu'une moyenne de ratios par match
      const n = this.histories.length
      const sum = (key) => this.histories.reduce((acc, h) => acc + (h[key] ?? 0), 0)
      const round1 = (v) => Math.round((v / n) * 10) / 10
      return this.kdaFormatter.formatKDA(round1(sum('kill')), round1(sum('deaths')), round1(sum('assist')))
    },
    statTiles() {
      const tiles = []

      // CS/min : somme des CS / somme des durées (pas une moyenne de ratios),
      // gameDuration est déjà en minutes
      const withCs = this.histories.filter((h) => h.creepScore != null && h.gameDuration > 0)
      const totalMinutes = withCs.reduce((acc, h) => acc + h.gameDuration, 0)
      if (totalMinutes > 0) {
        const totalCs = withCs.reduce((acc, h) => acc + h.creepScore, 0)
        tiles.push({ label: 'CS / min', value: (totalCs / totalMinutes).toFixed(1) })
      }

      const damage = avgOf(this.histories.map((h) => h.damagePerMinute))
      if (damage != null) {
        tiles.push({ label: 'Dégâts / min', value: Math.round(damage).toLocaleString('fr-FR') })
      }

      const gold = avgOf(this.histories.map((h) => h.goldPerMinute))
      if (gold != null) {
        tiles.push({ label: 'Or / min', value: Math.round(gold).toLocaleString('fr-FR') })
      }

      const vision = avgOf(this.histories.map((h) => h.visionScorePerMinute))
      if (vision != null) {
        tiles.push({ label: 'Vision / min', value: vision.toFixed(2) })
      }

      return tiles
    }
  }
}
</script>
