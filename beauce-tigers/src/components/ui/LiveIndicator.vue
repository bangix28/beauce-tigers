<template>
  <span class="live-indicator" :title="hint">
    <span class="motion-live-dot" aria-hidden="true" />
    {{ label }}
    <span class="sr-only">: {{ hint }}</span>
  </span>
</template>

<script>
// Point « en direct » : rappelle que la page se met à jour toute seule
export default {
  name: 'LiveIndicator',
  props: {
    label: { type: String, default: 'En direct' },
    hint: { type: String, default: 'la page se met à jour toute seule' }
  }
}
</script>

<style scoped>
.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid var(--lan-line, rgba(200, 170, 110, 0.16));
  color: var(--lan-ink-soft, #cdbfa8);
  font-size: 0.8125rem;
  line-height: 1.4;
  white-space: nowrap;
}
</style>
