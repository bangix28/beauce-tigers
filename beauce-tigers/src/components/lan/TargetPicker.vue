<template>
  <div class="target-picker">
    <p :id="headingId" class="target-picker__title">Choisis ta cible</p>

    <p v-if="!targets.length" class="lan-muted text-sm">
      Personne à viser pour le moment.
    </p>

    <div v-else class="target-picker__list" role="group" :aria-labelledby="headingId">
      <button
        v-for="target in targets"
        :key="target.riotId"
        type="button"
        class="wanted"
        :class="{
          'wanted--active': modelValue === target.riotId,
          'wanted--empty': !selectable(target)
        }"
        :disabled="!selectable(target)"
        :aria-pressed="modelValue === target.riotId ? 'true' : 'false'"
        :title="selectable(target) ? '' : 'Plus aucune relance à lui voler'"
        :data-riot-id="target.riotId"
        @click="$emit('update:modelValue', target.riotId)"
      >
        <Crosshair class="wanted__icon" aria-hidden="true" />
        <span class="wanted__body">
          <span class="wanted__name">{{ target.riotId }}</span>
          <span v-if="!selectable(target)" class="wanted__note">(plus de relance à voler)</span>
          <span v-else-if="showsRerolls" class="wanted__note">
            <span class="wanted__pip" aria-hidden="true"></span>
            a encore des relances
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { Crosshair } from 'lucide-vue-next'
import { PICKPOCKET_CODE, isTargetSelectable } from '@/utils/lanRunState'

let uid = 0

// Cibles d'une carte qui vise un joueur, fournies par l'API (sabotageTargets), en
// petits « avis de recherche ». Le Pickpocket ne peut pas viser un joueur sans
// relance ; la Malédiction si.
export default {
  name: 'TargetPicker',
  components: { Crosshair },
  props: {
    card: { type: Object, required: true },
    targets: { type: Array, required: true },
    modelValue: { type: String, default: null }
  },
  emits: ['update:modelValue'],
  data() {
    uid += 1
    return { headingId: `target-picker-${uid}` }
  },
  computed: {
    /** Les relances de la cible ne comptent que pour une carte qui les vole */
    showsRerolls() {
      return this.card.code === PICKPOCKET_CODE
    }
  },
  methods: {
    selectable(target) {
      return isTargetSelectable(this.card, target)
    }
  }
}
</script>

<style scoped>
.target-picker__title {
  margin-bottom: 0.625rem;
  font-family: var(--font-beaufort), serif;
  font-size: 1.05rem;
  color: var(--lan-ink);
}

.target-picker__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

/* Avis de recherche : petit papier épinglé, légèrement de travers */
.wanted {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 44px;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  border: 1px solid rgba(255, 107, 61, 0.35);
  border-radius: 9999px;
  background:
    linear-gradient(180deg, rgba(255, 107, 61, 0.08), transparent),
    var(--lan-surface-raised);
  color: var(--lan-ink);
  text-align: left;
  cursor: pointer;
  transform: rotate(-0.6deg);
  transition:
    transform var(--motion-press, 120ms) var(--ease-out, ease-out),
    border-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    background-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    box-shadow var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.wanted:nth-child(even) {
  transform: rotate(0.6deg);
}

.wanted:hover:not(:disabled) {
  border-color: var(--lan-ember);
  box-shadow: 0 0 14px rgba(255, 107, 61, 0.25);
  transform: translateY(-2px) rotate(0deg);
}

.wanted:active:not(:disabled) {
  transform: scale(0.97);
}

.wanted:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
}

.wanted--active {
  border-color: var(--lan-ember);
  background:
    radial-gradient(120% 120% at 0% 50%, rgba(255, 107, 61, 0.3), transparent 70%),
    var(--lan-oxblood);
  box-shadow:
    0 0 0 1px var(--lan-ember),
    0 0 18px rgba(255, 107, 61, 0.35);
  transform: rotate(0deg);
}

.wanted__icon {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
  color: var(--lan-ember);
}

.wanted__body {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.wanted__name {
  font-weight: bold;
  font-size: 0.95rem;
}

.wanted__note {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--lan-ink-soft);
}

.wanted__pip {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 35% 30%, #ffc07a, var(--lan-tiger) 50%, var(--lan-tiger-deep));
}

/* Cible désactivée : lisible (contraste AA), juste plus effacée */
.wanted--empty,
.wanted:disabled {
  border-style: dashed;
  border-color: var(--lan-line-strong);
  background: transparent;
  color: var(--lan-ink-soft);
  cursor: not-allowed;
  transform: none;
}

.wanted:disabled .wanted__icon {
  color: var(--lan-ink-mute);
}

@media (prefers-reduced-motion: reduce) {
  .wanted,
  .wanted:nth-child(even),
  .wanted:hover:not(:disabled),
  .wanted:active:not(:disabled) {
    transform: none;
    transition-duration: 120ms;
  }
}
</style>
