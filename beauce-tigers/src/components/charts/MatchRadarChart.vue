<template>
  <div class="relative h-72">
    <Radar :data="chartData" :options="chartOptions" :plugins="chartPlugins" />

    <!-- Infobulle d'explication d'un axe (survol de son label) -->
    <div v-if="hoveredExplanation" class="axis-tooltip" :style="tooltipStyle">
      <p class="font-beaufort font-bold text-lol-gold text-xs mb-1">
        {{ axes[hoveredAxis.index].label }}
      </p>
      <p class="text-xs text-gray-300 leading-snug">{{ hoveredExplanation }}</p>
    </div>
  </div>
</template>

<script>
import { Radar } from 'vue-chartjs'
import { LOL_BLUE, LOL_GOLD } from './chartSetup'

export default {
  name: 'MatchRadarChart',
  components: { Radar },
  props: {
    // [{ label: 'Kills', value: 8, avg: 5.2, explanation: '...' }, ...]
    axes: {
      type: Array,
      required: true
    },
    // Légende du polygone "moyenne" : le parent connaît le nombre réel de matchs
    avgLabel: {
      type: String,
      default: 'Moyenne récente'
    }
  },
  data() {
    return {
      // { index, x, y } quand la souris est sur le label d'un axe
      hoveredAxis: null
    }
  },
  created() {
    const component = this
    // Chart.js ne rend pas les labels d'axes interactifs : ce plugin détecte
    // le survol via _pointLabelItems (API interne mais stable, les positions
    // calculées des labels) et alimente l'infobulle HTML du template
    this.chartPlugins = [
      {
        id: 'pointLabelHover',
        afterEvent(chart, args) {
          const event = args.event
          if (event.type !== 'mousemove' && event.type !== 'mouseout') return

          const scale = chart.scales.r
          const labelItems = scale && scale._pointLabelItems
          let found = null

          if (event.type === 'mousemove' && labelItems) {
            const pad = 4
            labelItems.forEach((item, index) => {
              if (
                event.x >= item.left - pad &&
                event.x <= item.right + pad &&
                event.y >= item.top - pad &&
                event.y <= item.bottom + pad
              ) {
                found = { index, x: (item.left + item.right) / 2, y: item.top }
              }
            })
          }

          component.hoveredAxis = found
          chart.canvas.style.cursor = found ? 'help' : 'default'
        }
      }
    ]
  },
  computed: {
    hoveredExplanation() {
      if (!this.hoveredAxis) return null
      return this.axes[this.hoveredAxis.index]?.explanation ?? null
    },
    tooltipStyle() {
      return {
        left: `${this.hoveredAxis.x}px`,
        top: `${this.hoveredAxis.y - 8}px`
      }
    },
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
            label: this.avgLabel,
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

<style scoped>
.axis-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  width: max-content;
  max-width: 220px;
  padding: 0.5rem 0.65rem;
  background: linear-gradient(180deg, #0a1428 0%, #091428 100%);
  border: 1px solid var(--color-lol-gold);
  box-shadow:
    0 0 12px rgba(10, 200, 185, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 50;
  pointer-events: none;
}
</style>
