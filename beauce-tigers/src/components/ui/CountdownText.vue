<template>
  <time v-if="label" :datetime="isoTarget" class="countdown">{{ prefix }} {{ label }}</time>
</template>

<script>
import { formatCountdown, msUntil } from '@/composables/useCountdown'

/** Le libellé est à la minute : pas besoin de recalculer plus souvent */
const TICK_MS = 15 * 1000

// Compte à rebours discret (« Ça ouvre dans 2 h 14 »). Rien n'est affiché une
// fois l'heure passée : c'est à la page de se relire à ce moment-là.
export default {
  name: 'CountdownText',
  props: {
    target: { type: [String, Date], required: true },
    prefix: { type: String, default: 'Ça ouvre dans' }
  },
  data() {
    return { now: Date.now() }
  },
  computed: {
    label() {
      return formatCountdown(msUntil(this.target, this.now))
    },
    isoTarget() {
      const date = new Date(this.target)
      return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }
  },
  mounted() {
    this.timer = setInterval(() => (this.now = Date.now()), TICK_MS)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.countdown {
  font-variant-numeric: tabular-nums;
}
</style>
