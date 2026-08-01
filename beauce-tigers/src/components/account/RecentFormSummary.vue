<template>
  <div v-if="histories.length">
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <!-- Winrate des matchs affichés -->
      <KillParticipationGauge :value="winRatio" label="Winrate" />

      <div class="flex flex-col items-center sm:items-start gap-3">
        <!-- Série V/D chronologique (gauche = plus ancien), apparition en cascade,
             détail du match correspondant au survol de chaque pastille -->
        <div class="flex items-center gap-1.5">
          <span
            v-for="(match, i) in chronologicalResults"
            :key="i"
            class="w-2.5 h-2.5 rounded-full opacity-0 animate-fade-in cursor-help transition-transform hover:scale-150"
            :class="match.win ? 'bg-green-400' : 'bg-red-400'"
            :style="{ animationDelay: `${i * 60}ms` }"
            :title="dotTitle(match)"
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
      <StatTile
        v-for="tile in statTiles"
        :key="tile.label"
        :label="tile.label"
        :value="tile.value"
        :explanation="tile.explanation"
      />
    </div>
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">Aucun historique disponible.</p>
</template>

<script>
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import { utilsTools } from '@/mixins/utilsTools.js'
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
  mixins: [utilsTools],
  created() {
    this.kdaFormatter = useKDAFormatter()
  },
  methods: {
    // Détail du match derrière une pastille : "Victoire · Ahri · 12/3/9 · 28/07/2026"
    dotTitle(match) {
      const parts = [match.win ? 'Victoire' : 'Défaite']
      if (match.championName) parts.push(match.championName)
      parts.push(`${match.kill}/${match.deaths}/${match.assist}`)
      const date = this.formatDate(match.dateGameEnd)
      if (date) parts.push(date)
      return parts.join(' · ')
    }
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
      return [...this.histories].reverse()
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
        tiles.push({
          label: 'CS / min',
          value: (totalCs / totalMinutes).toFixed(1),
          explanation:
            'Sbires et monstres de la jungle tués par minute, calculé sur le total des derniers matchs (somme des CS divisée par la somme des durées).'
        })
      }

      const damage = avgOf(this.histories.map((h) => h.damagePerMinute))
      if (damage != null) {
        tiles.push({
          label: 'Dégâts / min',
          value: Math.round(damage).toLocaleString('fr-FR'),
          explanation:
            'Dégâts infligés aux champions ennemis par minute, en moyenne sur les matchs où la statistique est disponible.'
        })
      }

      const gold = avgOf(this.histories.map((h) => h.goldPerMinute))
      if (gold != null) {
        tiles.push({
          label: 'Or / min',
          value: Math.round(gold).toLocaleString('fr-FR'),
          explanation:
            "Or gagné par minute (sbires, kills, objectifs, revenu passif), en moyenne sur les matchs où la statistique est disponible."
        })
      }

      const vision = avgOf(this.histories.map((h) => h.visionScorePerMinute))
      if (vision != null) {
        tiles.push({
          label: 'Vision / min',
          value: vision.toFixed(2),
          explanation:
            'Score de vision par minute : balises posées, détruites et vision utile apportée à l’équipe.'
        })
      }

      return tiles
    }
  }
}
</script>
