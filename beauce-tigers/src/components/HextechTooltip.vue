<template>
  <!-- tabindex : rend le tooltip accessible au clavier et au tap mobile (focus) -->
  <span class="tt-trigger" :tabindex="hasTooltip ? 0 : -1">
    <slot />

    <span v-if="hasTooltip" class="hextech-tooltip" role="tooltip">
      <span class="flex items-center justify-between gap-4 mb-2">
        <span class="font-beaufort font-bold text-lol-gold">{{ title }}</span>
        <span v-if="meta" class="text-yellow-400 text-xs whitespace-nowrap">{{ meta }}</span>
      </span>
      <span class="tt-body" v-html="formattedDescription"></span>
    </span>
  </span>
</template>

<script>
import { formatRiotMarkup } from '@/utils/riotMarkup'

// Tooltip Hextech générique (items, runes, sorts d'invocateur) : cadre or,
// fond sombre, description au markup Riot interprété. Sans title, il se
// contente de rendre le déclencheur (slot) sans tooltip.
export default {
  name: 'HextechTooltip',
  props: {
    title: {
      type: String,
      default: null
    },
    // Info secondaire alignée à droite (prix "3200 PO", "CD : 300 sec"...)
    meta: {
      type: String,
      default: null
    },
    // Description brute au format markup Riot
    description: {
      type: String,
      default: ''
    }
  },
  computed: {
    hasTooltip() {
      return this.title != null && this.title !== ''
    },
    formattedDescription() {
      return formatRiotMarkup(this.description ?? '')
    }
  }
}
</script>

<style scoped>
.tt-trigger {
  position: relative;
  display: inline-flex;
  outline: none;
}

.hextech-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  max-width: 85vw;
  padding: 0.75rem;
  text-align: left;
  background: linear-gradient(180deg, #0a1428 0%, #091428 100%);
  border: 1px solid var(--color-lol-gold);
  box-shadow:
    0 0 12px rgba(10, 200, 185, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 50;
  pointer-events: none;
}

/* Flèche vers le déclencheur */
.hextech-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-lol-gold);
}

.tt-trigger:hover .hextech-tooltip,
.tt-trigger:focus .hextech-tooltip,
.tt-trigger:focus-within .hextech-tooltip {
  display: block;
}

.tt-body {
  display: block;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #cbd5e1;
}

/* Le contenu vient d'un v-html : :deep() obligatoire pour styler les spans */
.tt-body :deep(.tt-stats) {
  color: #f1f5f9;
}
.tt-body :deep(.tt-attention) {
  color: #ffffff;
  font-weight: bold;
}
.tt-body :deep(.tt-title) {
  color: var(--color-lol-gold);
  font-weight: bold;
}
.tt-body :deep(.tt-rules) {
  color: #6b7280;
  font-style: italic;
}
.tt-body :deep(.tt-physical) {
  color: #ff8c34;
}
.tt-body :deep(.tt-magic) {
  color: #00b0f0;
}
.tt-body :deep(.tt-true) {
  color: #f9966b;
}
.tt-body :deep(.tt-status) {
  color: #9ca3af;
  font-style: italic;
}
.tt-body :deep(.tt-onhit) {
  color: #fcc419;
}
.tt-body :deep(.tt-heal) {
  color: #1ede8d;
}
.tt-body :deep(.tt-shield) {
  color: #b3f3f1;
}
</style>
