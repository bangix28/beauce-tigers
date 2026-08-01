<template>
  <div class="relative h-56">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { LOL_GOLD, LOL_BLUE, LOL_RED, LOL_GREEN } from './chartSetup'
import { ROLE_LABELS } from '@/utils/roles'

// Couleur FIXE par rôle : un compte qui n'a pas joué Top ne doit pas décaler
// les couleurs des autres rôles (l'identité suit l'entité, pas son rang)
const ROLE_COLORS = {
  TOP: LOL_GOLD,
  JUNGLE: LOL_GREEN,
  MIDDLE: LOL_BLUE,
  BOTTOM: LOL_RED,
  UTILITY: '#a78bfa'
}

// Ordre d'affichage stable (ordre des lanes en jeu)
const ROLE_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']

export default {
  name: 'RolesDoughnutChart',
  components: { Doughnut },
  props: {
    histories: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    roleCounts() {
      const counts = {}
      for (const h of this.histories) {
        if (!h.teamPosition) continue
        counts[h.teamPosition] = (counts[h.teamPosition] ?? 0) + 1
      }
      // Rôles connus dans l'ordre des lanes, puis rôles inattendus éventuels
      const known = ROLE_ORDER.filter((r) => counts[r])
      const others = Object.keys(counts).filter((r) => !ROLE_ORDER.includes(r))
      return [...known, ...others].map((role) => ({
        role,
        label: ROLE_LABELS[role] ?? role,
        count: counts[role]
      }))
    },
    total() {
      return this.roleCounts.reduce((acc, r) => acc + r.count, 0)
    },
    chartData() {
      return {
        labels: this.roleCounts.map((r) => r.label),
        datasets: [
          {
            data: this.roleCounts.map((r) => r.count),
            backgroundColor: this.roleCounts.map((r) => ROLE_COLORS[r.role] ?? '#9ca3af'),
            // Liseré sombre entre les parts (couleur de fond des cartes)
            borderColor: '#0A1428',
            borderWidth: 2,
            // La part survolée se détache du doughnut
            hoverOffset: 10
          }
        ]
      }
    },
    chartOptions() {
      return {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: false,
        // Marge interne : la part détachée (hoverOffset) ne doit pas être rognée
        layout: { padding: 8 },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { boxWidth: 12, padding: 12 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const percent = Math.round((ctx.parsed / this.total) * 100)
                const games = ctx.parsed > 1 ? 'matchs' : 'match'
                return ` ${ctx.parsed} ${games} (${percent}%)`
              }
            }
          }
        }
      }
    }
  }
}
</script>
