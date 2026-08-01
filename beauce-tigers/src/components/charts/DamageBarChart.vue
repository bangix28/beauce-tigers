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
      return {
        labels: ['Dégâts infligés', 'Dégâts subis'],
        datasets: [
          {
            data: [this.damageDealt ?? 0, this.damageTaken ?? 0],
            backgroundColor: [LOL_BLUE + 'cc', LOL_RED + 'cc'],
            borderColor: [LOL_BLUE, LOL_RED],
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
