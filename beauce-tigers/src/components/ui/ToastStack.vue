<template>
  <div class="toast-stack">
    <TransitionGroup name="toast" tag="div" class="toast-stack__list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.tone || 'info'}`"
        :role="toast.role || 'status'"
        :aria-live="toast.role === 'alert' ? 'assertive' : 'polite'"
        :data-test="toast.dataTest"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast)"
        @focusin="pause(toast.id)"
        @focusout="resume(toast)"
      >
        <component :is="iconOf(toast)" class="toast__icon" aria-hidden="true" />
        <div class="toast__body">
          <p v-if="toast.title" class="toast__title">{{ toast.title }}</p>
          <p class="toast__text">{{ toast.text }}</p>
          <p v-if="toast.hint" class="toast__hint">{{ toast.hint }}</p>
        </div>
        <button
          type="button"
          class="toast__close"
          aria-label="Fermer la notification"
          @click="$emit('dismiss', toast.id)"
        >
          <X class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { CircleAlert, CircleCheck, HandCoins, Skull, Sparkles, X } from 'lucide-vue-next'

const ICONS = { error: CircleAlert, success: CircleCheck, sabotage: Skull, pickpocketed: HandCoins }

// Pile de notifications. Le parent possède la liste ; la pile se charge des
// délais d'expiration (`duration` en ms, 0 = jusqu'à fermeture) et les met en
// pause tant que le pointeur ou le focus est dessus, pour laisser le temps de lire.
export default {
  name: 'ToastStack',
  components: { X },
  props: {
    /** [{ id, text, title?, hint?, tone?, role?: 'status'|'alert', duration?, dataTest? }] */
    toasts: { type: Array, default: () => [] }
  },
  emits: ['dismiss'],
  created() {
    this.timers = new Map()
  },
  watch: {
    toasts(toasts) {
      this.syncTimers(toasts)
    }
  },
  mounted() {
    this.syncTimers(this.toasts)
  },
  beforeUnmount() {
    this.timers.forEach((timer) => clearTimeout(timer))
    this.timers.clear()
  },
  methods: {
    /** Arme le délai des nouveaux toasts, oublie celui des toasts disparus */
    syncTimers(toasts) {
      const ids = new Set(toasts.map((t) => t.id))
      for (const id of [...this.timers.keys()]) {
        if (!ids.has(id)) this.pause(id)
      }
      toasts.forEach((toast) => this.resume(toast))
    },
    iconOf(toast) {
      return ICONS[toast.icon] ?? ICONS[toast.tone] ?? Sparkles
    },
    pause(id) {
      clearTimeout(this.timers.get(id))
      this.timers.delete(id)
    },
    resume(toast) {
      if (!toast.duration || this.timers.has(toast.id)) return
      this.timers.set(
        toast.id,
        setTimeout(() => {
          this.timers.delete(toast.id)
          this.$emit('dismiss', toast.id)
        }, toast.duration)
      )
    }
  }
}
</script>

<style scoped>
/* Mobile : en haut, sous l'en-tête, pour ne pas couvrir la barre de confirmation
   ancrée en bas ; à partir de 768 px, en bas à droite */
.toast-stack {
  position: fixed;
  z-index: 60;
  top: 5rem;
  left: 1rem;
  right: 1rem;
  pointer-events: none;
}

@media (min-width: 768px) {
  .toast-stack {
    top: auto;
    left: auto;
    right: 1.5rem;
    bottom: 1.5rem;
    width: 24rem;
  }
}

.toast-stack__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 0.75rem 0.875rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--lan-line, rgba(200, 170, 110, 0.16));
  background: var(--lan-surface-raised, #1d2338);
  color: var(--lan-ink, #f4e9d8);
  box-shadow: 0 14px 36px -12px rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}

.toast__icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
  color: var(--lan-gold, #c8aa6e);
}

.toast__body {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-family: var(--font-beaufort), serif;
  font-size: 1.05rem;
}

.toast__text {
  font-size: 0.9375rem;
}

.toast__hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--lan-ink-soft, #cdbfa8);
}

.toast__close {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: -0.5rem -0.25rem -0.5rem 0;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--lan-ink-soft, #cdbfa8);
  transition: color var(--motion-press) var(--ease-out), background-color var(--motion-press) var(--ease-out);
}

.toast__close:hover {
  color: var(--lan-ink, #f4e9d8);
  background: rgba(244, 233, 216, 0.06);
}

.toast__close:focus-visible {
  outline: 2px solid var(--lan-tiger, #f08a24);
  outline-offset: 2px;
}

.toast--success {
  border-color: rgba(10, 200, 185, 0.45);
}

.toast--success .toast__icon {
  color: var(--lan-success, #0ac8b9);
}

.toast--error {
  border-color: rgba(232, 64, 87, 0.5);
}

.toast--error .toast__icon {
  color: var(--lan-fail, #e84057);
}

/* Saboteur : braise sur sang séché */
.toast--sabotage {
  border-color: var(--lan-ember, #ff6b3d);
  background: linear-gradient(135deg, var(--lan-oxblood, #3a1512), var(--lan-surface-raised, #1d2338));
  box-shadow:
    0 0 24px -8px rgba(255, 107, 61, 0.55),
    0 14px 36px -12px rgba(0, 0, 0, 0.65);
}

.toast--sabotage .toast__icon {
  color: var(--lan-ember, #ff6b3d);
}
</style>
