<template>
  <div class="lan-queues" data-test="lan-queues">
    <p class="lan-queues__label">Défis valables en</p>
    <ul class="flex flex-wrap gap-2">
      <li v-for="queue in queues" :key="queue.id" class="lan-chip" data-test="lan-queue">
        {{ queue.label }}
      </li>
    </ul>
    <p class="lan-muted text-sm" data-test="lan-queues-agent">
      Un agent par partie suffit : le tien ou celui d'un joueur de ta partie. Lance-le avant le
      chargement : démarré après 90 s de jeu, la partie ne compte pour personne.
      <template v-if="hasSoloQueue">
        En classée solo/duo, vous jouez à deux au plus : prévoyez un agent par duo.
      </template>
    </p>
  </div>
</template>

<script>
// File de Riot de la classée solo/duo : on y joue seul ou en duo, jamais à 5.
const RANKED_SOLO_QUEUE_ID = 420

// Files où les parties de la LAN comptent (choisies par l'organisateur), et la
// règle qui en découle : un agent dans chaque partie, pas forcément sur chaque PC.
export default {
  name: 'LanQueues',
  props: {
    /** lan.queues de GET /me/lan-events/current */
    queues: { type: Array, required: true }
  },
  computed: {
    hasSoloQueue() {
      return this.queues.some((queue) => queue.id === RANKED_SOLO_QUEUE_ID)
    }
  }
}
</script>

<style scoped>
.lan-queues {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lan-queues__label {
  color: var(--lan-ink-soft);
  font-size: 0.875rem;
}
</style>
