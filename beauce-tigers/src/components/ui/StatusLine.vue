<template>
  <p class="status-line" aria-live="polite">
    <ArrowRight class="status-line__icon" aria-hidden="true" />
    <Transition name="fade" mode="out-in">
      <span :key="text">{{ text }}</span>
    </Transition>
  </p>
</template>

<script>
import { ArrowRight } from 'lucide-vue-next'

// Ligne « quoi faire maintenant » : un fondu marque chaque changement d'étape
export default {
  name: 'StatusLine',
  components: { ArrowRight },
  props: {
    text: { type: String, required: true }
  }
}
</script>

<style scoped>
.status-line {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--lan-ink, #f4e9d8);
  font-size: 1rem;
  line-height: 1.5;
}

.status-line__icon {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
  color: var(--lan-tiger, #f08a24);
}
</style>
