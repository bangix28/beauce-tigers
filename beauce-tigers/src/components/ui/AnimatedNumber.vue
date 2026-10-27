<template>
  <span
    class="animated-number"
    :class="{ 'animated-number--bump': bumping }"
    @animationend="bumping = false"
    >{{ shown }}</span
  >
</template>

<script>
import { animateBetween } from '@/composables/useAnimatedNumber'

// Nombre qui défile jusqu'à sa nouvelle valeur. Au montage, la valeur est posée
// telle quelle : seul un CHANGEMENT s'anime, pour guider l'œil vers lui.
export default {
  name: 'AnimatedNumber',
  props: {
    value: { type: Number, required: true }
  },
  data() {
    return {
      display: this.value,
      bumping: false
    }
  },
  computed: {
    shown() {
      return Math.round(this.display)
    }
  },
  watch: {
    value(to) {
      this.cancel?.()
      this.bumping = to > this.display
      this.cancel = animateBetween(this.display, to, (v) => (this.display = v))
    }
  },
  beforeUnmount() {
    this.cancel?.()
  }
}
</script>

<style scoped>
.animated-number {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}

/* Petit sursaut quand le nombre monte (des points gagnés) */
.animated-number--bump {
  animation: number-bump var(--motion-slow) var(--ease-spring);
}

@keyframes number-bump {
  40% {
    transform: scale(1.12);
    color: var(--lan-points, #F2C14E);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-number--bump {
    animation: none;
  }
}
</style>
