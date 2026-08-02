<template>
  <div class="relative">
    <!-- Pluie d'or : purement décorative, bornée à quelques cycles pour ne pas
         laisser une page terminée bouger indéfiniment. L'overflow-hidden est
         porté par ce calque seul — sur le conteneur, il rognerait le bandeau
         et la carte surélevée du vainqueur -->
    <span
      v-if="animated"
      class="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <span
        v-for="(particle, index) in PARTICLES"
        :key="index"
        class="fleck"
        :class="particle.turquoise ? 'fleck--blue' : ''"
        :style="{
          left: particle.left,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDelay: particle.delay,
          animationDuration: particle.duration,
          '--sway': particle.sway
        }"
      ></span>
    </span>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Le décalage du vainqueur vit sur l'enveloppe : l'animation d'entrée
           occupe le transform de la carte, les deux se composent au lieu de
           s'écraser -->
      <div
        v-for="(entry, index) in entries"
        :key="entry.riotId"
        :class="index === 0 ? 'md:-translate-y-3' : ''"
      >
        <div
          class="group relative h-full overflow-hidden bg-lol-darker/80 border p-5 rounded-sm transition-all duration-300"
          :class="[
            index === 0
              ? 'border-lol-gold/70 shadow-[0_0_18px_rgba(200,170,110,0.15)]'
              : 'border-lol-gold/30 hover:border-lol-gold/60',
            ceremony && index === 0 ? 'podium-winner' : '',
            animated ? 'podium-rise' : ''
          ]"
          :style="animated ? { animationDelay: stepDelay(index, 0) } : null"
        >
          <!-- Rayons tournants derrière le vainqueur d'une course terminée -->
          <span v-if="ceremony && index === 0 && animated" class="rays" aria-hidden="true"></span>

          <!-- Balayage lumineux joué une seule fois, quand la marche se pose -->
          <span
            v-if="animated"
            class="sweep"
            :style="{ animationDelay: stepDelay(index, 350) }"
            aria-hidden="true"
          ></span>

          <!-- Bandeau à cheval sur la bordure : ne décale pas le contenu, donc
               les trois cartes restent alignées -->
          <span
            v-if="ceremony && index === 0"
            class="absolute top-0 left-4 z-20 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] font-beaufort text-lol-gold border border-lol-gold/60 bg-lol-dark rounded-b-sm"
            >Vainqueur</span
          >

          <div class="relative z-10">
            <component
              :is="badgeFor(index)"
              class="absolute top-0 right-0 w-7 h-7"
              :class="[BADGES[index].color, animated ? 'badge-pop' : '']"
              :style="animated ? { animationDelay: stepDelay(index, 150) } : null"
            />

            <RacePlayerCell
              :summoner-name="entry.summonerName"
              :logo-id="entry.logoId"
              size="md"
              :glow="ceremony && index === 0"
            />

            <div class="mt-4 flex items-baseline gap-2">
              <span
                class="font-beaufort text-3xl font-bold"
                :class="[
                  entry.weightedDelta >= 0 ? 'text-lol-gold' : 'text-red-400',
                  impacts[index] && animated ? 'count-impact' : ''
                ]"
                >{{ signedCount(index) }}</span
              >
              <span class="text-xs uppercase tracking-widest text-gray-500">pts pondérés</span>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <img
                :src="getUrlTierEmblem(entry.start.tier)"
                :alt="entry.start.tier"
                class="h-9 w-auto object-contain opacity-60"
              />
              <span class="text-[0.7rem] text-gray-400 truncate">{{ rankLabel(entry.start) }}</span>
              <ArrowRight class="w-4 h-4 text-lol-blue flex-shrink-0" />
              <img
                :src="getUrlTierEmblem(entry.end.tier)"
                :alt="entry.end.tier"
                class="h-9 w-auto object-contain drop-shadow-lg"
                :class="animated ? 'emblem-pop' : ''"
                :style="animated ? { animationDelay: stepDelay(index, 250) } : null"
              />
              <span class="text-[0.7rem] font-bold truncate" :class="tierColor(entry.end.tier)">{{
                rankLabel(entry.end)
              }}</span>
            </div>

            <p class="mt-3 text-xs text-gray-500">
              {{ entry.gamesPlayed }} partie{{ entry.gamesPlayed > 1 ? 's' : '' }}
              <span v-if="entry.winrate != null"> · {{ entry.winrate }}% de victoires</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight, Award, Crown, Medal, Trophy } from 'lucide-vue-next'
import RacePlayerCell from './RacePlayerCell.vue'
import { animateCount } from '@/composables/useCountUp'
import { formatRankLabel } from '@/utils/raceMapper'
import { getTierColorClass } from '@/utils/rank'
import { utilsTools } from '@/mixins/utilsTools.js'

const BADGES = [
  { icon: 'Trophy', color: 'text-yellow-400' },
  { icon: 'Medal', color: 'text-gray-300' },
  { icon: 'Award', color: 'text-amber-700' }
]

// Écart entre deux marches : le 3e monte d'abord, le vainqueur en dernier
const RISE_STEP_MS = 260

// Paillettes réparties sans Math.random : une position figée évite qu'elles
// sautent à chaque re-rendu de la liste
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.6 + 2) % 100}%`,
  size: i % 4 === 0 ? 5 : 3,
  delay: `${(i % 7) * 0.28 + 0.6}s`,
  duration: `${2.5 + (i % 5) * 0.4}s`,
  sway: `${((i % 5) - 2) * 0.9}rem`,
  turquoise: i % 5 === 3
}))

// Podium des 3 meilleures progressions pondérées. Reprend le vocabulaire du
// podium de l'accueil (Trophy / Medal / Award) en langage Hextech. Sur une
// course terminée (ceremony), il joue une remise des prix : montée en marches,
// couronne, halo, balayage et pluie d'or.
export default {
  name: 'RacePodium',
  components: { ArrowRight, Award, Crown, Medal, Trophy, RacePlayerCell },
  mixins: [utilsTools],
  props: {
    entries: { type: Array, required: true },
    /** Course achevée : le classement est définitif, on le célèbre */
    ceremony: { type: Boolean, default: false }
  },
  data() {
    return {
      BADGES,
      PARTICLES,
      // Valeurs affichées pendant l'animation de comptage
      counts: [],
      // Passe à true quand le compteur atteint sa cible, pour le à-coup final
      impacts: [],
      // Résolu ici et pas dans created() : le watcher immediate ci-dessous
      // s'exécute avant created(), il lirait encore la valeur par défaut
      reducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      countTimers: []
    }
  },
  beforeUnmount() {
    this.clearCountTimers()
  },
  watch: {
    entries: {
      immediate: true,
      handler(list) {
        this.clearCountTimers()
        this.counts = list.map(() => 0)
        this.impacts = list.map(() => false)

        list.forEach((entry, index) => {
          const start = () =>
            animateCount(entry.weightedDelta, (value) => {
              this.counts.splice(index, 1, value)
              // Dernière frame : animateCount rend exactement la cible
              if (value === entry.weightedDelta) this.impacts.splice(index, 1, true)
            })

          // En cérémonie, le compteur ne démarre qu'une fois la marche posée
          if (this.animated) {
            this.countTimers.push(
              setTimeout(start, (this.entries.length - 1 - index) * RISE_STEP_MS + 200)
            )
          } else {
            start()
          }
        })
      }
    }
  },
  computed: {
    /** Cérémonie demandée ET mouvement autorisé */
    animated() {
      return this.ceremony && !this.reducedMotion
    }
  },
  methods: {
    clearCountTimers() {
      this.countTimers.forEach(clearTimeout)
      this.countTimers = []
    },
    badgeFor(index) {
      return this.ceremony && index === 0 ? 'Crown' : BADGES[index].icon
    },
    /**
     * Décalage de la marche `index`, plus un retard propre à l'effet. Les
     * offsets restent sous la durée de la montée (550 ms) : au-delà, un élément
     * en fill-mode `both` laisserait un trou visible sur une carte déjà posée.
     */
    stepDelay(index, offsetMs) {
      return `${(this.entries.length - 1 - index) * RISE_STEP_MS + offsetMs}ms`
    },
    rankLabel(snapshot) {
      return formatRankLabel(snapshot)
    },
    tierColor(tier) {
      return getTierColorClass(tier)
    },
    signedCount(index) {
      const value = Math.round(this.counts[index] ?? 0)
      return `${value > 0 ? '+' : ''}${value.toLocaleString('fr-FR')}`
    }
  }
}
</script>

<style scoped>
/* Montée en marches : la carte arrive du bas et se stabilise */
.podium-rise {
  opacity: 0;
  animation: podiumRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes podiumRise {
  from {
    opacity: 0;
    transform: translateY(2.5rem) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Halo du vainqueur porté par un ::after et non par la carte : la carte a déjà
   sa propre `animation` (podiumRise), et deux raccourcis `animation` sur le
   même élément s'écrasent — le vainqueur resterait invisible */
.podium-winner {
  border-color: rgba(200, 170, 110, 0.9);
}

.podium-winner::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  animation: winnerGlow 2.8s ease-in-out infinite;
}

@keyframes winnerGlow {
  0%,
  100% {
    box-shadow: inset 0 0 14px rgba(200, 170, 110, 0.1);
  }
  50% {
    box-shadow: inset 0 0 30px rgba(200, 170, 110, 0.3);
  }
}

.rays {
  position: absolute;
  inset: -45%;
  z-index: 0;
  pointer-events: none;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(200, 170, 110, 0.16) 10deg,
    transparent 20deg,
    transparent 90deg,
    rgba(10, 200, 185, 0.12) 100deg,
    transparent 110deg,
    transparent 180deg,
    rgba(200, 170, 110, 0.16) 190deg,
    transparent 200deg,
    transparent 270deg,
    rgba(10, 200, 185, 0.12) 280deg,
    transparent 290deg
  );
  animation: raySpin 16s linear infinite;
}

@keyframes raySpin {
  to {
    transform: rotate(360deg);
  }
}

/* Éclat qui traverse la carte une fois, à l'atterrissage de la marche */
.sweep {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 35%,
    rgba(255, 255, 255, 0.12) 50%,
    transparent 65%
  );
  transform: translateX(-100%);
  animation: sweepAcross 0.9s ease-out both;
}

@keyframes sweepAcross {
  to {
    transform: translateX(100%);
  }
}

.badge-pop {
  animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes badgePop {
  from {
    opacity: 0;
    transform: translateY(-0.75rem) scale(0.4) rotate(-18deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.emblem-pop {
  animation: emblemPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes emblemPop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* À-coup au moment où le décompte atteint sa valeur finale */
.count-impact {
  display: inline-block;
  animation: countImpact 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes countImpact {
  0% {
    transform: scale(1);
    text-shadow: none;
  }
  45% {
    transform: scale(1.16);
    text-shadow: 0 0 18px rgba(200, 170, 110, 0.75);
  }
  100% {
    transform: scale(1);
    text-shadow: none;
  }
}

.fleck {
  position: absolute;
  top: -0.5rem;
  border-radius: 1px;
  background: linear-gradient(135deg, #f0dca4, var(--color-lol-gold));
  opacity: 0;
  /* Bornée : la pluie s'épuise au lieu de tourner en boucle sous les yeux */
  animation-name: fleckFall;
  animation-timing-function: linear;
  animation-iteration-count: 3;
  animation-fill-mode: forwards;
}

.fleck--blue {
  background: linear-gradient(135deg, #7ff0e6, var(--color-lol-blue));
}

@keyframes fleckFall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 0.95;
  }
  50% {
    transform: translate(var(--sway, 0), 8.5rem) rotate(120deg);
  }
  85% {
    opacity: 0.95;
  }
  100% {
    transform: translate(0, 17rem) rotate(260deg);
    opacity: 0;
  }
}

/* Aucune animation en mouvement réduit : le vainqueur garde un halo fixe */
@media (prefers-reduced-motion: reduce) {
  .podium-rise,
  .badge-pop,
  .emblem-pop,
  .count-impact,
  .sweep {
    animation: none;
    opacity: 1;
  }
  .podium-winner::after {
    animation: none;
    box-shadow: inset 0 0 22px rgba(200, 170, 110, 0.22);
  }
}
</style>
