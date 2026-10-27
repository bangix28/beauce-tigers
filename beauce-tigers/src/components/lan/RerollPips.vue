<template>
  <span class="reroll-pips" role="img" :aria-label="label" :title="label">
    <span
      v-for="index in total"
      :key="pipKey(index - 1)"
      class="reroll-pips__pip"
      :class="{
        'reroll-pips__pip--full': index - 1 < left,
        'reroll-pips__pip--gained': isChanged(index - 1, 'gained'),
        'reroll-pips__pip--lost': isChanged(index - 1, 'lost')
      }"
      data-test="reroll-pip"
      aria-hidden="true"
    ></span>
  </span>
</template>

<script>
// Relances du joueur en jetons : pleins pour celles qui restent, vides pour celles
// dépensées. Le jeton qui vient de changer « pop » pour attirer l'œil.
export default {
  name: 'RerollPips',
  props: {
    left: { type: Number, required: true },
    /** Relances de départ (catalogue.rules.initialRerolls) : nombre de jetons au repos */
    initial: { type: Number, default: 3 }
  },
  data() {
    return {
      // Dernier jeton changé ; stamp relance l'animation sur un même jeton
      change: null
    }
  },
  computed: {
    total() {
      return Math.max(this.initial, this.left, 0)
    },
    label() {
      if (this.left <= 0) return 'Plus aucune relance'
      return this.left === 1 ? 'Il te reste 1 relance' : `Il te reste ${this.left} relances`
    }
  },
  watch: {
    left(now, before) {
      if (now === before) return
      this.change =
        now > before
          ? { index: now - 1, kind: 'gained', stamp: Date.now() }
          : { index: now, kind: 'lost', stamp: Date.now() }
    }
  },
  methods: {
    isChanged(index, kind) {
      return this.change?.index === index && this.change.kind === kind
    },
    pipKey(index) {
      return this.change?.index === index ? `${index}-${this.change.stamp}` : `${index}`
    }
  }
}
</script>

<style scoped>
.reroll-pips {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  vertical-align: middle;
}

/* Jeton façon jeton de poker : orange tigre, liseré pointillé */
.reroll-pips__pip {
  position: relative;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 9999px;
  border: 1.5px dashed var(--lan-line-strong);
  background: transparent;
}

.reroll-pips__pip--full {
  border: none;
  background: radial-gradient(circle at 35% 30%, #ffc07a, var(--lan-tiger) 45%, var(--lan-tiger-deep));
  box-shadow:
    inset 0 0 0 2px rgba(26, 15, 5, 0.25),
    0 0 8px rgba(240, 138, 36, 0.35);
}

.reroll-pips__pip--full::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  border: 1.5px dashed rgba(255, 240, 220, 0.75);
}

.reroll-pips__pip--gained {
  animation: pip-gain 420ms var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1)) both;
}

.reroll-pips__pip--lost {
  animation: pip-lose 380ms var(--ease-out, ease-out) both;
}

@keyframes pip-gain {
  from {
    opacity: 0;
    transform: scale(0.2) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Le jeton dépensé saute puis se vide */
@keyframes pip-lose {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 var(--lan-tiger-glow);
  }
  40% {
    transform: scale(1.35);
    box-shadow: 0 0 0 6px rgba(240, 138, 36, 0);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reroll-pips__pip--gained,
  .reroll-pips__pip--lost {
    animation: pip-fade 120ms linear both;
  }
}

@keyframes pip-fade {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}
</style>
