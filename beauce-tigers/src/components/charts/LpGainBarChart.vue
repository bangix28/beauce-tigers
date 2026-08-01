<template>
  <div v-if="deltas.length" class="relative h-40">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">
    Pas assez de relevés sur deux jours consécutifs sur cette période.
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
      // Variation entre deux relevés espacés d'exactement un jour. Un trou dans
      // les données (bot down) produirait une fausse barre "journalière" portant
      // des semaines de progression (ex: +617 LP sur 3 mois) : on l'écarte
      const DAY_MS = 24 * 60 * 60 * 1000
      return this.points.slice(1).flatMap((p, i) => {
        const prev = this.points[i]
        const gapDays = Math.round((new Date(p.date) - new Date(prev.date)) / DAY_MS)
        if (gapDays > 1) return []
        return [{ label: this.formatDate(p.date, 'dd/MM'), value: p.score - prev.score }]
      })
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
