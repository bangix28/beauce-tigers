<template>
  <div class="skeleton" :class="`skeleton--${variant}`" aria-hidden="true">
    <template v-if="variant === 'card'">
      <span class="skeleton__badge motion-skeleton" />
      <span class="skeleton__art motion-skeleton" />
      <span class="skeleton__line skeleton__line--title motion-skeleton" />
      <span class="skeleton__line motion-skeleton" />
      <span class="skeleton__line skeleton__line--short motion-skeleton" />
    </template>
    <template v-else>
      <span class="skeleton__line skeleton__line--title motion-skeleton" />
      <span
        v-for="n in lines"
        :key="n"
        class="skeleton__line motion-skeleton"
        :class="{ 'skeleton__line--short': n === lines }"
      />
    </template>
  </div>
</template>

<script>
// Forme grise qui annonce ce qui arrive : une carte défi ou un panneau de texte.
// Purement décoratif : le conteneur porte aria-busy et le libellé de chargement.
export default {
  name: 'SkeletonCard',
  props: {
    variant: {
      type: String,
      default: 'card',
      validator: (value) => ['card', 'panel'].includes(value)
    },
    lines: { type: Number, default: 2 }
  }
}
</script>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--lan-line, rgba(200, 170, 110, 0.16));
  background: var(--lan-surface, #151a2b);
}

.skeleton--card {
  aspect-ratio: 5 / 7;
  align-items: center;
}

.skeleton span {
  display: block;
  border-radius: 8px;
}

.skeleton__badge {
  width: 4.5rem;
  height: 1.25rem;
  border-radius: 9999px;
}

.skeleton__art {
  width: 4rem;
  height: 4rem;
  margin: 0.5rem 0;
  border-radius: 9999px;
}

.skeleton__line {
  width: 100%;
  height: 0.875rem;
}

.skeleton__line--title {
  width: 60%;
  height: 1.25rem;
}

.skeleton--panel .skeleton__line--title {
  width: 40%;
}

.skeleton__line--short {
  width: 45%;
}

@media (max-width: 639px) {
  .skeleton {
    padding: 1rem;
  }
}
</style>
