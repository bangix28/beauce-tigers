<template>
  <div class="relative h-72">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Radar } from 'vue-chartjs'
import { LOL_BLUE, LOL_GOLD } from './chartSetup'

export default {
  name: 'MatchRadarChart',
  components: { Radar },
  props: {
    // [{ label: 'Kills', value: 8, avg: 5.2 }, ...]
    axes: {
      type: Array,
      required: true
    }
  },
  computed: {
    // Chart.js n'a pas de max par axe sur un radar : on normalise chaque axe
    // sur 0-1 avec max = 1.15 × max(valeur, moyenne) pour ne jamais coller au bord
    axisMaxes() {
      return this.axes.map((a) => 1.15 * Math.max(a.value ?? 0, a.avg ?? 0, 0.0001))
    },
    chartData() {
      return {
        labels: this.axes.map((a) => a.label),
        datasets: [
          {
            label: 'Moyenne 5 derniers',
            data: this.axes.map((a, i) => (a.avg ?? 0) / this.axisMaxes[i]),
            borderColor: LOL_GOLD,
            borderDash: [6, 4],
            borderWidth: 1.5,
            backgroundColor: LOL_GOLD + '14',
            pointBackgroundColor: LOL_GOLD,
            pointRadius: 2,
            fill: true
          },
          {
            label: 'Ce match',
            data: this.axes.map((a, i) => (a.value ?? 0) / this.axisMaxes[i]),
            borderColor: LOL_BLUE,
            borderWidth: 2,
            backgroundColor: LOL_BLUE + '33',
            pointBackgroundColor: LOL_BLUE,
            pointRadius: 3,
            fill: true
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 1,
            // Valeurs normalisées : les ticks n'ont pas de sens pour l'utilisateur
            ticks: { display: false },
            grid: { color: '#1e2d45' },
            angleLines: { color: '#1e2d45' },
            pointLabels: {
              color: '#C8AA6E',
              font: { size: 12, family: 'Spiegel, sans-serif' }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 14, padding: 16 }
          },
          tooltip: {
            callbacks: {
              // Tooltip avec les valeurs réelles, pas les ratios normalisés
              label: (ctx) => {
                const axis = this.axes[ctx.dataIndex]
                const real = ctx.datasetIndex === 0 ? axis.avg : axis.value
                return ` ${ctx.dataset.label} : ${Number(real ?? 0).toFixed(2)}`
              }
            }
          }
        }
      }
    }
  }
}
</script>
