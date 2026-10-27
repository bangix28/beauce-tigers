<template>
  <span
    ref="trigger"
    class="card-peek-trigger"
    :class="`card-peek-trigger--${card.rarity}`"
    tabindex="0"
    :aria-describedby="descriptionId"
    @mouseenter="showSoon"
    @mouseleave="hideSoon"
    @focus="show"
    @blur="hide"
    @keydown.esc="hide"
  >
    <slot />
    <span :id="descriptionId" class="sr-only">{{ spokenDescription }}</span>

    <!-- Dans body : aucun parent (accordéon, panneau) ne peut la couper -->
    <Teleport to="body">
      <Transition name="card-peek">
        <div
          v-if="open"
          ref="peek"
          class="card-peek"
          :data-side="side"
          :style="position"
          aria-hidden="true"
          data-test="card-peek"
        >
          <!-- Carte déjà jouée : « Carte secrète » n'a plus de sens, elle est révélée -->
          <LanCard :card="card" :hints="false" />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script>
import LanCard from '@/components/lan/LanCard.vue'

const RARITY_LABELS = {
  silver: 'Argent',
  gold: 'Or',
  prismatic: 'Prismatique',
  saboteur: 'Saboteur'
}

/** Délai avant d'ouvrir au survol : balayer une liste ne fait pas clignoter des cartes partout */
const HOVER_INTENT_MS = 90
const HIDE_DELAY_MS = 60
const VIEWPORT_MARGIN = 12
const GAP = 18

let uid = 0

// Nom de carte qui, survolé (ou focus clavier, ou toucher), fait sortir la vraie
// carte à côté de la ligne — comme on regarde un augment en jeu. La description
// reste lue par les lecteurs d'écran sans rien survoler.
export default {
  name: 'CardPeek',
  components: { LanCard },
  props: {
    card: { type: Object, required: true }
  },
  data() {
    uid += 1
    return {
      descriptionId: `card-peek-${uid}`,
      open: false,
      side: 'right',
      position: { top: '-9999px', left: '-9999px' },
      timer: null
    }
  },
  computed: {
    spokenDescription() {
      const rarity = RARITY_LABELS[this.card.rarity] ?? this.card.rarity
      const points = this.card.points ? `, ${this.card.points} points` : ''
      return `${rarity}${points}. ${this.card.description}`
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
    this.unlisten()
  },
  methods: {
    showSoon() {
      clearTimeout(this.timer)
      this.timer = setTimeout(this.show, HOVER_INTENT_MS)
    },
    hideSoon() {
      clearTimeout(this.timer)
      this.timer = setTimeout(this.hide, HIDE_DELAY_MS)
    },
    show() {
      clearTimeout(this.timer)
      if (this.open) return
      this.open = true
      // Défilement ou redimensionnement : la carte ne suivrait plus sa ligne
      window.addEventListener('scroll', this.hide, true)
      window.addEventListener('resize', this.hide)
      this.$nextTick(this.place)
    },
    hide() {
      clearTimeout(this.timer)
      this.open = false
      this.unlisten()
    },
    unlisten() {
      window.removeEventListener('scroll', this.hide, true)
      window.removeEventListener('resize', this.hide)
    },
    /** À droite du nom, centrée sur la ligne ; à gauche si l'écran manque de place */
    place() {
      const trigger = this.$refs.trigger
      const peek = this.$refs.peek
      if (!trigger || !peek) return

      const anchor = trigger.getBoundingClientRect()
      const width = peek.offsetWidth
      const height = peek.offsetHeight
      const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN
      const maxTop = window.innerHeight - height - VIEWPORT_MARGIN

      let left = anchor.right + GAP
      this.side = 'right'
      if (left > maxLeft) {
        left = anchor.left - GAP - width
        this.side = 'left'
      }
      const top = anchor.top + anchor.height / 2 - height / 2

      this.position = {
        left: `${Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft))}px`,
        top: `${Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop))}px`
      }
    }
  }
}
</script>

<style scoped>
/* Déclencheur discret : pas de soulignement façon infobulle ; au survol le nom
   prend la couleur de sa matière */
.card-peek-trigger {
  --peek-ink: var(--lan-silver);
  display: inline-flex;
  min-width: 0;
  border-radius: 4px;
  cursor: default;
  transition: color var(--motion-base, 220ms) var(--ease-out, ease-out);
}

.card-peek-trigger--gold {
  --peek-ink: var(--lan-honey);
}

.card-peek-trigger--prismatic {
  --peek-ink: var(--lan-pearl-1);
}

.card-peek-trigger--saboteur {
  --peek-ink: var(--lan-ember);
}

.card-peek-trigger:hover,
.card-peek-trigger:focus-visible {
  color: var(--peek-ink);
}

.card-peek-trigger:focus-visible {
  outline: 2px solid var(--lan-tiger);
  outline-offset: 3px;
}

/* La carte, tenue légèrement de travers, avec une ombre de vraie carte posée
   au-dessus de la table plutôt qu'une lueur */
.card-peek {
  position: fixed;
  z-index: 60;
  width: 13.5rem;
  pointer-events: none;
  transform: rotate(-2deg);
  filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
}

.card-peek[data-side='left'] {
  transform: rotate(2deg);
}

/* On la tire de la ligne : elle glisse depuis le nom en se redressant */
.card-peek-enter-active {
  transition:
    opacity 180ms var(--ease-out, ease-out),
    transform 260ms var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
}

.card-peek-leave-active {
  transition:
    opacity 120ms ease-in,
    transform 120ms ease-in;
}

.card-peek-enter-from,
.card-peek-leave-to {
  opacity: 0;
  transform: translateX(-14px) rotate(-7deg) scale(0.94);
}

.card-peek[data-side='left'].card-peek-enter-from,
.card-peek[data-side='left'].card-peek-leave-to {
  transform: translateX(14px) rotate(7deg) scale(0.94);
}

@media (prefers-reduced-motion: reduce) {
  .card-peek,
  .card-peek[data-side='left'] {
    transform: none;
  }

  .card-peek-enter-active,
  .card-peek-leave-active {
    transition: opacity 120ms linear;
  }

  .card-peek-enter-from,
  .card-peek-leave-to,
  .card-peek[data-side='left'].card-peek-enter-from,
  .card-peek[data-side='left'].card-peek-leave-to {
    transform: none;
  }
}
</style>
