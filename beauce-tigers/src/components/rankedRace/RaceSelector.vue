<template>
  <div class="space-y-3">
    <!-- Périodes calendaires + événements, défilables horizontalement sur mobile -->
    <div class="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1">
      <button
        v-for="period in PERIODS"
        :key="period.key"
        :class="chipClass(isCalendar && selection.period === period.key)"
        @click="selectPeriod(period.key)"
      >
        {{ period.label }}
      </button>

      <span v-if="events.length" class="h-5 border-l border-gray-700 mx-1 flex-shrink-0"></span>

      <button
        v-for="event in events"
        :key="event.id"
        :class="[chipClass(!isCalendar && selection.id === event.id), 'flex items-center gap-1.5']"
        :title="eventTitle(event)"
        @click="$emit('update:selection', { kind: 'event', id: event.id })"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="statusDot(event.status)"
        ></span>
        {{ event.name }}
      </button>
    </div>

    <!-- La file d'un événement est fixée par l'admin : le toggle se désactive -->
    <div class="flex items-center gap-2">
      <span class="text-[0.65rem] uppercase tracking-widest text-gray-500 mr-1">File</span>
      <button
        v-for="queue in QUEUES"
        :key="queue.key"
        :disabled="!isCalendar"
        :class="[
          chipClass(activeQueue === queue.key),
          !isCalendar ? 'opacity-40 cursor-not-allowed' : ''
        ]"
        :title="isCalendar ? '' : 'La file est imposée par cet événement'"
        @click="selectQueue(queue.key)"
      >
        {{ queue.label }}
      </button>
    </div>
  </div>
</template>

<script>
const PERIODS = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' }
]

const QUEUES = [
  { key: 'solo', label: 'SoloQ' },
  { key: 'flex', label: 'Flexible' }
]

const STATUS_DOTS = {
  active: 'bg-lol-blue animate-pulse',
  upcoming: 'bg-gray-500',
  finished: 'bg-gray-700'
}

const STATUS_LABELS = {
  active: 'En cours',
  upcoming: 'À venir',
  finished: 'Terminé'
}

// Barre de sélection : périodes calendaires, événements admin, puis la file.
// Reprend les boutons de période de la page compte pour rester homogène.
export default {
  name: 'RaceSelector',
  props: {
    events: { type: Array, required: true },
    selection: { type: Object, required: true },
    /** File réellement renvoyée par l'API — fait foi quand un événement l'impose */
    resolvedQueue: { type: String, default: null }
  },
  emits: ['update:selection'],
  data() {
    return { PERIODS, QUEUES }
  },
  computed: {
    isCalendar() {
      return this.selection.kind === 'calendar'
    },
    activeQueue() {
      return this.isCalendar ? this.selection.queue : this.resolvedQueue
    }
  },
  methods: {
    chipClass(active) {
      return [
        'px-3 py-1 text-xs uppercase tracking-wider font-beaufort border rounded-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0',
        active
          ? 'bg-lol-gold/20 text-lol-gold border-lol-gold'
          : 'text-gray-400 border-gray-700 hover:border-lol-gold/50 hover:text-gray-200'
      ]
    },
    statusDot(status) {
      return STATUS_DOTS[status] ?? 'bg-gray-700'
    },
    eventTitle(event) {
      return `${STATUS_LABELS[event.status] ?? ''} · ${event.window.start} → ${event.window.end}`
    },
    selectPeriod(period) {
      // Quitter un événement ramène sur la file solo, la seule garantie valide
      const queue = this.isCalendar ? this.selection.queue : 'solo'
      this.$emit('update:selection', { kind: 'calendar', queue, period })
    },
    selectQueue(queue) {
      if (!this.isCalendar) return
      this.$emit('update:selection', { kind: 'calendar', queue, period: this.selection.period })
    }
  }
}
</script>
