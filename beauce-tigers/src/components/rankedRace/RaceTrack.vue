<template>
  <div>
    <div class="space-y-2">
      <div
        v-for="(entry, index) in visibleEntries"
        :key="entry.riotId"
        class="group grid grid-cols-[9.5rem_1fr_5rem] sm:grid-cols-[13rem_1fr_6rem] items-center gap-3"
      >
        <RacePlayerCell :summoner-name="entry.summonerName" :logo-id="entry.logoId" size="sm" />

        <!-- Couloir de course : l'axe zéro ne se matérialise que si quelqu'un a reculé -->
        <div
          class="relative h-6 bg-lol-darker border border-lol-gold/20 rounded-sm overflow-hidden"
        >
          <span
            v-if="scale.zeroPct > 0"
            class="absolute inset-y-0 w-px bg-gray-600"
            :style="{ left: `${scale.zeroPct}%` }"
          ></span>

          <span
            class="absolute inset-y-0.5 rounded-sm"
            :class="[
              entry.weightedDelta < 0
                ? 'bg-red-500/50'
                : 'bg-gradient-to-r from-lol-gold/40 to-lol-gold',
              reducedMotion ? '' : 'race-bar',
              index === 0 && entry.weightedDelta > 0 ? 'race-bar--leader' : '',
              ceremony && !reducedMotion && index === 0 && entry.weightedDelta > 0
                ? 'race-bar--crowned'
                : ''
            ]"
            :style="barStyle(entry, index)"
          ></span>
        </div>

        <span
          class="font-beaufort text-sm font-bold text-right"
          :class="entry.weightedDelta >= 0 ? 'text-green-400' : 'text-red-400'"
          >{{ signed(entry.weightedDelta) }}</span
        >

        <!-- Détail départ → arrivée révélé au survol, comme les lignes de match -->
        <div
          class="hidden md:block col-start-2 max-h-0 opacity-0 overflow-hidden transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100"
        >
          <p class="text-[0.7rem] text-lol-blue/90 pt-1">
            {{ rankLabel(entry.start) }} → {{ rankLabel(entry.end) }} ·
            {{ entry.gamesPlayed }} partie{{ entry.gamesPlayed > 1 ? 's' : '' }}
            <span v-if="entry.winrate != null"> · {{ entry.winrate }}%</span>
          </p>
        </div>
      </div>
    </div>

    <button
      v-if="hiddenCount > 0"
      class="mt-4 flex items-center gap-1.5 text-xs uppercase tracking-widest font-beaufort text-gray-400 hover:text-lol-gold transition-colors duration-200"
      @click="expanded = !expanded"
    >
      <ChevronDown
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
      />
      {{
        expanded
          ? 'Réduire la piste'
          : `+ ${hiddenCount} autre${hiddenCount > 1 ? 's' : ''} coureur${hiddenCount > 1 ? 's' : ''}`
      }}
    </button>
  </div>
</template>

<script>
import { ChevronDown } from 'lucide-vue-next'
import RacePlayerCell from './RacePlayerCell.vue'
import { formatRankLabel } from '@/utils/raceMapper'

// Nombre de couloirs affichés avant repli : au-delà, la piste devient illisible
// et le classement complet reste disponible dans la table en dessous
const TRACK_PREVIEW_SIZE = 8

export default {
  name: 'RaceTrack',
  components: { ChevronDown, RacePlayerCell },
  props: {
    entries: { type: Array, required: true },
    /** Course terminée : la barre de tête reçoit un reflet qui la parcourt */
    ceremony: { type: Boolean, default: false }
  },
  data() {
    return {
      expanded: false,
      // Les barres partent à 0 puis s'étirent : il faut un premier rendu à vide
      revealed: false,
      reducedMotion: false
    }
  },
  mounted() {
    this.reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.play()
  },
  watch: {
    // Changer de course rejoue la course : les barres repartent de zéro
    entries() {
      this.expanded = false
      this.revealed = false
      this.play()
    }
  },
  computed: {
    visibleEntries() {
      return this.expanded ? this.entries : this.entries.slice(0, TRACK_PREVIEW_SIZE)
    },
    hiddenCount() {
      return Math.max(0, this.entries.length - TRACK_PREVIEW_SIZE)
    },
    // Échelle commune : positifs et négatifs se partagent la largeur autour
    // d'un axe zéro qui se décale, plutôt qu'un axe fixe au centre qui
    // gaspillerait la moitié de la piste quand personne ne recule
    scale() {
      const deltas = this.entries.map((e) => e.weightedDelta)
      const maxPos = Math.max(0, ...deltas)
      const maxNeg = Math.max(0, ...deltas.map((d) => -d))
      const total = maxPos + maxNeg || 1
      return { total, zeroPct: (maxNeg / total) * 100 }
    }
  },
  methods: {
    play() {
      if (this.reducedMotion) {
        this.revealed = true
        return
      }
      // rAF plutôt que nextTick : garantit que la largeur 0 a été peinte avant
      // la transition, sinon le navigateur fusionne les deux styles
      requestAnimationFrame(() => requestAnimationFrame(() => (this.revealed = true)))
    },
    barStyle(entry, index) {
      const pct = (Math.abs(entry.weightedDelta) / this.scale.total) * 100
      const style = {
        width: this.revealed ? `${pct}%` : '0%',
        transitionDelay: `${index * 60}ms`
      }

      if (entry.weightedDelta < 0) {
        style.right = `${100 - this.scale.zeroPct}%`
      } else {
        style.left = `${this.scale.zeroPct}%`
      }

      return style
    },
    rankLabel(snapshot) {
      return formatRankLabel(snapshot)
    },
    signed(value) {
      const rounded = Math.round(value)
      return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('fr-FR')}`
    }
  }
}
</script>

<style scoped>
.race-bar {
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.group:hover .race-bar {
  filter: brightness(1.25);
}

/* Reflet qui parcourt la barre du vainqueur sur une course close. En ::before
   pour laisser le ::after au damier d'arrivée */
.race-bar--crowned::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 40%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 60%
  );
  animation: barShine 2.6s ease-in-out 1.2s infinite;
}

@keyframes barShine {
  0% {
    transform: translateX(-100%);
  }
  55%,
  100% {
    transform: translateX(100%);
  }
}

/* Damier d'arrivée collé au bout de la barre de tête */
.race-bar--leader::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 8px;
  background-image:
    linear-gradient(45deg, #0a1428 25%, transparent 25%, transparent 75%, #0a1428 75%),
    linear-gradient(45deg, #0a1428 25%, transparent 25%, transparent 75%, #0a1428 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    4px 4px;
  background-color: #ffffff;
}
</style>
