<template>
  <div class="relative h-40">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { LOL_BLUE, LOL_RED } from './chartSetup'

export default {
  name: 'DamageBarChart',
  components: { Bar },
  props: {
    damageDealt: {
      type: Number,
      default: null
    },
    damageTaken: {
      type: Number,
      default: null
    }
  },
  computed: {
    chartData() {
      // Une stat absente (null) est écartée plutôt qu'affichée comme un vrai 0
      const entries = [
        { label: 'Dégâts infligés', value: this.damageDealt, color: LOL_BLUE },
        { label: 'Dégâts subis', value: this.damageTaken, color: LOL_RED }
      ].filter((e) => e.value != null)

      return {
        labels: entries.map((e) => e.label),
        datasets: [
          {
            data: entries.map((e) => e.value),
            backgroundColor: entries.map((e) => e.color + 'cc'),
            borderColor: entries.map((e) => e.color),
            borderWidth: 1,
            borderRadius: 3,
            barThickness: 28
          }
        ]
      }
    },
    chartOptions() {
      return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x.toLocaleString('fr-FR')} dégâts`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#1e2d45' },
            ticks: {
              callback: (value) => value.toLocaleString('fr-FR')
            }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 13 } }
          }
        }
      }
    }
  }
}
</script>
