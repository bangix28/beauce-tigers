<template>
  <div v-if="points.length" class="relative h-64 sm:h-72">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-10">
    Pas encore de données d'elo sur cette période.
  </p>
</template>

<script>
import { Line } from 'vue-chartjs'
import { LOL_GOLD, LOL_BLUE, LOL_GRID } from './chartSetup'
import { decomposeEloScore } from '@/utils/rank'
import { utilsTools } from '@/mixins/utilsTools.js'

export default {
  name: 'EloDailyChart',
  components: { Line },
  mixins: [utilsTools],
  props: {
    // Points { date, score } triés par date ASC, déjà filtrés par période par le parent
    points: {
      type: Array,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.points.map((p) => this.formatDate(p.date, 'dd/MM')),
        datasets: [
          {
            data: this.points.map((p) => p.score),
            borderColor: LOL_GOLD,
            borderWidth: 2,
            // Sur les longues périodes les points se chevauchent : on ne garde
            // que la ligne, le survol reste possible (interaction mode index)
            pointRadius: this.points.length > 45 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: LOL_BLUE,
            pointBorderColor: LOL_GOLD,
            fill: true,
            tension: 0.3,
            backgroundColor: (ctx) => {
              // Le dégradé dépend de la zone de tracé, absente au premier
              // appel (chart pas encore layouté) : repli sur un or uni
              const { ctx: canvas, chartArea } = ctx.chart
              if (!chartArea) return 'rgba(200, 170, 110, 0.15)'
              const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              gradient.addColorStop(0, 'rgba(200, 170, 110, 0.35)')
              gradient.addColorStop(1, 'rgba(200, 170, 110, 0)')
              return gradient
            }
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${decomposeEloScore(ctx.parsed.y).label}`
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
            ticks: {
              maxTicksLimit: 6,
              // Les valeurs d'axe deviennent des rangs lisibles ("GOLD II · 30 LP")
              callback: (value) => decomposeEloScore(value).label
            }
          }
        }
      }
    }
  }
}
</script>
