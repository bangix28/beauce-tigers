<template>
  <div class="relative h-40 w-40 mx-auto">
    <Doughnut :data="chartData" :options="chartOptions" />
    <!-- % centré par superposition : plus simple et plus stylable qu'un plugin Chart.js -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="font-beaufort text-2xl font-bold text-lol-gold">{{ percentLabel }}</span>
      <span class="text-[0.6rem] uppercase tracking-widest text-gray-400">Kill Part.</span>
    </div>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { LOL_BLUE, LOL_GRID } from './chartSetup'

export default {
  name: 'KillParticipationGauge',
  components: { Doughnut },
  props: {
    // Ratio 0-1 tel que renvoyé par l'API
    value: {
      type: Number,
      required: true
    }
  },
  computed: {
    percentLabel() {
      return `${Math.round(this.value * 100)}%`
    },
    chartData() {
      return {
        datasets: [
          {
            data: [this.value, 1 - this.value],
            backgroundColor: [LOL_BLUE, LOL_GRID],
            borderWidth: 0,
            borderRadius: [6, 0]
          }
        ]
      }
    },
    chartOptions() {
      return {
        cutout: '78%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    }
  }
}
</script>
