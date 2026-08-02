<template>
  <div>
    <div class="hextech-divider"></div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-3 py-5">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-lol-gold">{{ title }}</h1>
        <p class="text-xs uppercase tracking-widest text-gray-400 mt-1">
          {{ queueLabel }}
          <span v-if="windowLabel" class="text-gray-600"> · </span>
          <span v-if="windowLabel" class="text-gray-300">{{ windowLabel }}</span>
        </p>
      </div>

      <div
        v-if="countdown"
        class="flex items-center gap-2 md:self-center"
        :class="countdown.stamp ? 'countdown-stamp' : ''"
      >
        <component :is="countdown.icon" class="w-4 h-4" :class="countdown.classes" />
        <span class="font-beaufort text-sm uppercase tracking-widest" :class="countdown.classes">{{
          countdown.label
        }}</span>
      </div>
    </div>

    <div class="hextech-divider"></div>
  </div>
</template>

<script>
import { differenceInCalendarDays } from 'date-fns'
import { Flag, Hourglass, Timer } from 'lucide-vue-next'
import { raceWindowEnd } from '@/utils/raceMapper'
import { utilsTools } from '@/mixins/utilsTools.js'

// Bandeau de tête : intitulé de la course, fenêtre et temps restant.
export default {
  name: 'RaceHero',
  components: { Flag, Hourglass, Timer },
  mixins: [utilsTools],
  props: {
    title: { type: String, required: true },
    window: { type: Object, default: null },
    queue: { type: String, default: 'solo' }
  },
  computed: {
    queueLabel() {
      return this.queue === 'flex' ? 'Flexible' : 'SoloQ'
    },
    windowLabel() {
      if (!this.window?.start || !this.window?.end) return ''
      // Format numérique : date-fns n'est pas configuré en locale fr, un
      // 'dd MMM' sortirait des mois en anglais
      return `${this.formatDate(this.window.start, 'dd/MM')} → ${this.formatDate(this.window.end, 'dd/MM')}`
    },
    countdown() {
      if (!this.window?.start || !this.window?.end) return null

      const now = new Date()
      const start = new Date(`${this.window.start}T00:00:00`)
      const end = raceWindowEnd(this.window.end)

      if (now < start) {
        const days = differenceInCalendarDays(start, now)
        return {
          icon: 'Hourglass',
          classes: 'text-gray-400',
          label: days <= 1 ? 'Débute demain' : `Débute dans ${days} jours`
        }
      }

      if (now >= end) {
        // stamp : le verdict s'abat comme un tampon, en écho à la cérémonie
        return { icon: 'Flag', classes: 'text-gray-400', label: 'Course terminée', stamp: true }
      }

      // end pointe sur le lendemain du dernier jour : un écart de 1 signifie
      // qu'on est sur le dernier jour de course
      const days = differenceInCalendarDays(end, now)
      if (days <= 1) {
        return { icon: 'Timer', classes: 'text-lol-blue animate-pulse', label: 'Dernier jour !' }
      }

      return { icon: 'Timer', classes: 'text-lol-gold', label: `J-${days - 1} avant l'arrivée` }
    }
  }
}
</script>

<style scoped>
.countdown-stamp {
  animation: stampIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes stampIn {
  from {
    opacity: 0;
    transform: scale(1.7) rotate(-6deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .countdown-stamp {
    animation: none;
  }
}
</style>
