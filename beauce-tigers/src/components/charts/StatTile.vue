<template>
  <!-- Avec explanation : tuile enveloppée dans un tooltip Hextech ; sans, rendu
       inchangé (la page match l'utilise sans tooltip) -->
  <HextechTooltip v-if="explanation" :title="label" :description="explanation" class="w-full">
    <div class="tile w-full cursor-help">
      <span class="font-beaufort text-2xl font-bold text-lol-gold">{{ value }}</span>
      <span class="text-xs uppercase tracking-widest text-gray-400 text-center">{{ label }}</span>
    </div>
  </HextechTooltip>
  <div v-else class="tile">
    <span class="font-beaufort text-2xl font-bold text-lol-gold">{{ value }}</span>
    <span class="text-xs uppercase tracking-widest text-gray-400 text-center">{{ label }}</span>
  </div>
</template>

<script>
import HextechTooltip from '@/components/HextechTooltip.vue'

export default {
  name: 'StatTile',
  components: { HextechTooltip },
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    // Description affichée dans un tooltip Hextech au survol (optionnelle)
    explanation: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--color-lol-darker);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 0.25rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.tile:hover {
  border-color: rgba(200, 170, 110, 0.7);
  transform: translateY(-2px);
}
</style>
