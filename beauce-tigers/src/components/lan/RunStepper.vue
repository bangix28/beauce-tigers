<template>
  <div class="run-stepper" :style="{ '--progress': progress }">
    <span class="run-stepper__track" aria-hidden="true">
      <span class="run-stepper__fill"></span>
    </span>

    <ol class="run-stepper__list" aria-label="Étapes de ta manche">
      <li
        v-for="(item, index) in STEPS"
        :key="item.key"
        class="run-stepper__step"
        :class="`run-stepper__step--${status(index)}`"
        :aria-current="item.key === step ? 'step' : undefined"
        :data-step="item.key"
      >
        <span class="run-stepper__dot" aria-hidden="true">
          <Check v-if="status(index) === 'done'" class="run-stepper__check" stroke-width="3" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="run-stepper__label">
          {{ item.label }}
          <span v-if="status(index) === 'done'" class="sr-only">(fait)</span>
        </span>
      </li>
    </ol>
  </div>
</template>

<script>
import { Check } from 'lucide-vue-next'

const STEPS = [
  { key: 'choose', label: 'Choisir' },
  { key: 'play', label: 'Jouer' },
  { key: 'verdict', label: 'Verdict' }
]

// Où en est la manche : Choisir → Jouer → Verdict, la barre se remplit à chaque étape
export default {
  name: 'RunStepper',
  components: { Check },
  props: {
    step: {
      type: String,
      required: true,
      validator: (value) => STEPS.some((item) => item.key === value)
    }
  },
  data() {
    return { STEPS }
  },
  computed: {
    currentIndex() {
      return Math.max(
        STEPS.findIndex((item) => item.key === this.step),
        0
      )
    },
    progress() {
      return this.currentIndex / (STEPS.length - 1)
    }
  },
  methods: {
    status(index) {
      if (index < this.currentIndex) return 'done'
      return index === this.currentIndex ? 'current' : 'upcoming'
    }
  }
}
</script>

<style scoped>
.run-stepper {
  position: relative;
}

.run-stepper__list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* La piste relie le centre du premier point au centre du dernier */
.run-stepper__track {
  position: absolute;
  top: 0.875rem;
  left: calc(100% / 6);
  right: calc(100% / 6);
  height: 3px;
  border-radius: 9999px;
  background: var(--lan-line-strong);
  overflow: hidden;
}

.run-stepper__fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--lan-tiger-deep), var(--lan-tiger));
  transform: scaleX(var(--progress, 0));
  transform-origin: left center;
  transition: transform var(--motion-slow, 420ms) var(--ease-out, ease-out);
}

.run-stepper__step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  text-align: center;
}

.run-stepper__dot {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  border: 2px solid var(--lan-line-strong);
  background: var(--lan-surface);
  color: var(--lan-ink-mute);
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  transition:
    background-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    border-color var(--motion-base, 220ms) var(--ease-out, ease-out),
    color var(--motion-base, 220ms) var(--ease-out, ease-out),
    transform var(--motion-base, 220ms) var(--ease-spring, ease-out);
}

.run-stepper__check {
  width: 0.9rem;
  height: 0.9rem;
}

.run-stepper__label {
  font-size: 0.9rem;
  color: var(--lan-ink-mute);
}

.run-stepper__step--done .run-stepper__dot {
  border-color: var(--lan-tiger);
  background: var(--lan-tiger);
  color: var(--lan-on-tiger);
}

.run-stepper__step--done .run-stepper__label {
  color: var(--lan-ink-soft);
}

.run-stepper__step--current .run-stepper__dot {
  border-color: var(--lan-tiger);
  color: var(--lan-tiger);
  transform: scale(1.12);
  box-shadow: 0 0 0 4px rgba(240, 138, 36, 0.18);
}

.run-stepper__step--current .run-stepper__label {
  color: var(--lan-ink);
  font-weight: bold;
}

@media (prefers-reduced-motion: reduce) {
  .run-stepper__fill,
  .run-stepper__dot {
    transition-duration: 120ms;
  }

  .run-stepper__step--current .run-stepper__dot {
    transform: none;
  }
}
</style>
