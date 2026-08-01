<template>
  <div v-if="deltas.length" class="relative h-40">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">
    Pas assez de données sur cette période.
  </p>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { LOL_GREEN, LOL_RED, LOL_GRID } from './chartSetup'
import { utilsTools } from '@/mixins/utilsTools.js'

export default {
  name: 'LpGainBarChart',
  components: { Bar },
  mixins: [utilsTools],
  props: {
    // Les mêmes points { date, score } que la courbe d'elo, déjà filtrés par
    // période par le parent : les barres réagissent aux mêmes boutons
    points: {
      type: Array,
      required: true
    }
  },
  computed: {
    deltas() {
      // Variation entre deux relevés consécutifs. Un trou dans les données
      // (bot down un jour) fait porter au delta plusieurs jours — assumé,
      // cohérent avec l'axe CategoryScale non linéaire de la courbe
      return this.points.slice(1).map((p, i) => ({
        label: this.formatDate(p.date, 'dd/MM'),
        value: p.score - this.points[i].score
      }))
    },
    chartData() {
      return {
        labels: this.deltas.map((d) => d.label),
        datasets: [
          {
            data: this.deltas.map((d) => d.value),
            backgroundColor: this.deltas.map((d) => (d.value >= 0 ? LOL_GREEN + 'b3' : LOL_RED + 'b3')),
            borderColor: this.deltas.map((d) => (d.value >= 0 ? LOL_GREEN : LOL_RED)),
            borderWidth: 1,
            borderRadius: 2,
            maxBarThickness: 24
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              // Signe explicite : "+18 LP" / "-25 LP"
              label: (ctx) => ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y} LP`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 8, maxRotation: 0 }
          },
          y: {
            grid: { color: LOL_GRID },
            ticks: { maxTicksLimit: 5 }
          }
        }
      }
    }
  }
}
</script>
