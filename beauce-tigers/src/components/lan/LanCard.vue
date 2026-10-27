<template>
  <div
    class="lan-card"
    :class="[
      `lan-card--${card.rarity}`,
      {
        'lan-card--selected': selected,
        'lan-card--compact': compact,
        'lan-card--face-down': faceDown,
        'lan-card--locked': locked,
        'lan-card--dimmed': dimmed
      }
    ]"
    :data-code="card.code"
  >
    <div class="lan-card__inner">
      <div class="lan-card__face lan-card__front" :aria-hidden="faceDown ? 'true' : undefined">
        <div class="lan-card__frame">
          <span class="lan-card__sheen" aria-hidden="true"></span>

          <div class="lan-card__top">
            <span class="lan-card__rarity">{{ rarityLabel }}</span>
            <span v-if="card.points" class="lan-card__points">
              {{ card.points }}<span class="lan-card__points-unit"> pts</span>
            </span>
          </div>

          <div class="lan-card__medal" aria-hidden="true">
            <component :is="icon" class="lan-card__icon" stroke-width="1.5" />
            <span v-if="multiplier" class="lan-card__multiplier">×{{ multiplier }}</span>
          </div>

          <h3 class="lan-card__label">{{ card.label }}</h3>
          <p v-if="!compact" class="lan-card__description">{{ card.description }}</p>

          <p v-if="card.needsTarget && showHints" class="lan-card__hint">
            <Target class="lan-card__hint-icon" aria-hidden="true" /> Vise un joueur · effet immédiat
          </p>
          <p v-else-if="card.secret && showHints" class="lan-card__hint">
            <EyeOff class="lan-card__hint-icon" aria-hidden="true" /> Carte secrète
          </p>

          <slot />
        </div>
      </div>

      <!-- Dos aux couleurs des Tigers : rendu seulement si la carte a déjà été face cachée -->
      <div v-if="hasBack" class="lan-card__face lan-card__back" aria-hidden="true">
        <div class="lan-card__back-frame">
          <span class="lan-card__back-medal">
            <PawPrint class="lan-card__back-icon" stroke-width="1.75" />
          </span>
          <span class="lan-card__back-name">Beauce Tigers</span>
        </div>
      </div>
    </div>

    <span v-if="locked" class="lan-card__seal" role="img" aria-label="Carte verrouillée sur ce match">
      <Lock class="lan-card__seal-icon" stroke-width="2.25" aria-hidden="true" />
    </span>
  </div>
</template>

<script>
import {
  Axe,
  Brush,
  Crosshair,
  Crown,
  Droplet,
  EyeOff,
  Flame,
  Ghost,
  HandCoins,
  HeartHandshake,
  Infinity as InfinityIcon,
  Lock,
  PawPrint,
  Shield,
  ShieldCheck,
  Skull,
  Sparkles,
  Sword,
  Swords,
  Target,
  ThumbsDown,
  Users,
  Zap
} from 'lucide-vue-next'

// Icône par code de carte : le code est stable, le libellé peut changer
// (« Martyr » est devenu « Gameplay Shaco » sans changer de code)
const CARD_ICONS = {
  double_kill: Swords,
  triple_kill: Swords,
  quadra_kill: Flame,
  penta_kill: Crown,
  prudent: Shield,
  team_spirit: Users,
  hunter: Crosshair,
  wingman: HeartHandshake,
  executioner: Axe,
  duelist: Sword,
  cleaner: Brush,
  first_blood: Droplet,
  untouchable: ShieldCheck,
  immortal: InfinityIcon,
  blitz: Zap,
  bad_loser: ThumbsDown,
  martyr: Ghost,
  pickpocket: HandCoins,
  curse: Skull
}

// Les séries d'éliminations partagent une famille d'icônes : le badge les distingue
const KILL_MULTIPLIERS = {
  double_kill: 2,
  triple_kill: 3,
  quadra_kill: 4,
  penta_kill: 5
}

const RARITY_LABELS = {
  silver: 'Argent',
  gold: 'Or',
  prismatic: 'Prismatique',
  saboteur: 'Saboteur'
}

// Carte défi façon augment d'ARAM : matière selon la rareté, dos Tigers, sceau une fois verrouillée
export default {
  name: 'LanCard',
  components: { EyeOff, Lock, PawPrint, Target },
  props: {
    card: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    /** Variante réduite (historique, carte active) : sans description */
    compact: { type: Boolean, default: false },
    /** Dos visible : la carte se retourne quand il repasse à false */
    faceDown: { type: Boolean, default: false },
    /** Carte jouée sur un match en cours : sceau imprimé dessus */
    locked: { type: Boolean, default: false },
    /** Carte écartée d'un choix en cours */
    dimmed: { type: Boolean, default: false },
    /** Mentions de règle (« Vise un joueur », « Carte secrète ») : utiles au choix, pas après coup */
    hints: { type: Boolean, default: true }
  },
  data() {
    return { hasBack: this.faceDown }
  },
  computed: {
    showHints() {
      return this.hints && !this.compact
    },
    icon() {
      return CARD_ICONS[this.card.code] ?? Sparkles
    },
    multiplier() {
      return KILL_MULTIPLIERS[this.card.code] ?? null
    },
    rarityLabel() {
      return RARITY_LABELS[this.card.rarity] ?? this.card.rarity
    }
  },
  watch: {
    faceDown(value) {
      if (value) this.hasBack = true
    }
  }
}
</script>

<style scoped>
.lan-card {
  /* Matière par défaut : acier poli (argent) */
  --rarity-ink: #e6eaf0;
  --rarity-accent: var(--lan-silver);
  --rarity-glow: rgba(217, 222, 229, 0.18);
  --rarity-border: linear-gradient(155deg, #f6f8fb, #8b95a3 42%, #d9dee5 70%, #6b7482);
  --rarity-bg:
    linear-gradient(160deg, rgba(217, 222, 229, 0.1), transparent 45%),
    linear-gradient(180deg, #232a39, #161b28);
  --rarity-sheen: linear-gradient(
    115deg,
    transparent 35%,
    rgba(235, 242, 255, 0.16) 48%,
    transparent 60%
  );

  position: relative;
  height: 100%;
  border-radius: var(--lan-radius);
  perspective: 1100px;
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.35),
    0 0 18px var(--rarity-glow);
  transition:
    transform var(--motion-base, 220ms) var(--ease-out, ease-out),
    box-shadow var(--motion-base, 220ms) var(--ease-out, ease-out),
    opacity var(--motion-base, 220ms) var(--ease-out, ease-out),
    filter var(--motion-base, 220ms) var(--ease-out, ease-out);
}

/* Or : miel sombre et filet doré */
.lan-card--gold {
  --rarity-ink: #f7d47e;
  --rarity-accent: var(--lan-honey);
  --rarity-glow: rgba(242, 193, 78, 0.26);
  --rarity-border: linear-gradient(155deg, #ffeab0, #b8862b 45%, #f2c14e 72%, #7a5414);
  --rarity-bg:
    radial-gradient(90% 60% at 50% 0%, rgba(242, 193, 78, 0.24), transparent 70%),
    linear-gradient(180deg, #2b210e, #191308);
  --rarity-sheen: linear-gradient(
    115deg,
    transparent 35%,
    rgba(255, 226, 154, 0.2) 48%,
    transparent 60%
  );
}

/* Prismatique : nacre aux pastels chauds, le reflet glisse au survol */
.lan-card--prismatic {
  --rarity-ink: #ffe9da;
  --rarity-accent: var(--lan-pearl-2);
  --rarity-glow: rgba(255, 180, 162, 0.3);
  --rarity-border: linear-gradient(
    135deg,
    var(--lan-pearl-1),
    var(--lan-pearl-2) 30%,
    var(--lan-pearl-3) 60%,
    var(--lan-pearl-4) 85%,
    var(--lan-pearl-1)
  );
  --rarity-bg:
    radial-gradient(80% 55% at 20% 0%, rgba(255, 180, 162, 0.22), transparent 70%),
    radial-gradient(80% 55% at 85% 100%, rgba(160, 196, 255, 0.18), transparent 70%),
    linear-gradient(180deg, #2a2230, #1a1724);
  --rarity-sheen: linear-gradient(
    115deg,
    transparent 25%,
    rgba(255, 180, 162, 0.22) 38%,
    rgba(255, 226, 154, 0.24) 46%,
    rgba(181, 234, 215, 0.22) 54%,
    rgba(160, 196, 255, 0.22) 62%,
    transparent 75%
  );
}

/* Saboteur : braise sur sang séché */
.lan-card--saboteur {
  --rarity-ink: #ffb59c;
  --rarity-accent: var(--lan-ember);
  --rarity-glow: rgba(255, 107, 61, 0.3);
  --rarity-border: linear-gradient(160deg, var(--lan-ember), #7a2a1a 45%, var(--lan-oxblood) 70%, #c2461f);
  --rarity-bg:
    radial-gradient(90% 60% at 50% 110%, rgba(255, 107, 61, 0.3), transparent 70%),
    linear-gradient(180deg, var(--lan-oxblood), #1d0907);
  --rarity-sheen: linear-gradient(
    115deg,
    transparent 35%,
    rgba(255, 107, 61, 0.16) 48%,
    transparent 60%
  );
}

.lan-card:hover:not(.lan-card--compact):not(.lan-card--dimmed),
.lan-card--selected {
  transform: translateY(-4px);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.4),
    0 0 26px var(--lan-tiger-glow),
    0 0 18px var(--rarity-glow);
}

.lan-card--selected {
  box-shadow:
    0 0 0 2px var(--lan-tiger),
    0 16px 34px rgba(0, 0, 0, 0.45),
    0 0 32px var(--lan-tiger-glow);
}

.lan-card--dimmed {
  opacity: 0.4;
  filter: saturate(0.35);
}

/* --- Retournement 3D --- */
.lan-card__inner {
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--motion-slow, 420ms) var(--ease-out, cubic-bezier(0.2, 0.8, 0.2, 1));
}

/* Passer face cachée est instantané : seul le retournement vers la face se voit */
.lan-card--face-down .lan-card__inner {
  transform: rotateY(180deg);
  transition: none;
}

.lan-card__face {
  height: 100%;
  padding: 2px;
  border-radius: var(--lan-radius);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.lan-card__front {
  background: var(--rarity-border);
}

.lan-card__back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  background: linear-gradient(155deg, #e9d29c, var(--lan-gold) 40%, #7a5c2a);
}

/* --- Face --- */
.lan-card__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  padding: 1rem 1rem 1.125rem;
  overflow: hidden;
  border-radius: calc(var(--lan-radius) - 2px);
  background: var(--rarity-bg);
}

.lan-card__sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--rarity-sheen);
  background-size: 250% 100%;
  background-position: 100% 0;
  transition: background-position 700ms var(--ease-out, ease-out);
}

.lan-card:hover .lan-card__sheen,
.lan-card--selected .lan-card__sheen {
  background-position: 0 0;
}

/* La nacre garde un léger reflet même au repos */
.lan-card--prismatic .lan-card__sheen {
  background-position: 70% 0;
}

.lan-card--prismatic:hover .lan-card__sheen,
.lan-card--prismatic.lan-card--selected .lan-card__sheen {
  background-position: 5% 0;
}

.lan-card__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

/* Seule capitale espacée restante du thème : l'étiquette de rareté */
.lan-card__rarity {
  font-size: 0.68rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--rarity-accent);
}

.lan-card__points {
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 1.15rem;
  line-height: 1;
  color: var(--lan-points);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 10px rgba(242, 193, 78, 0.35);
}

.lan-card__points-unit {
  font-size: 0.8rem;
  font-weight: normal;
}

.lan-card__medal {
  position: relative;
  align-self: center;
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  margin: 0.5rem 0 0.25rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--rarity-accent) 40%, transparent);
  background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--rarity-accent) 22%, transparent), transparent 70%);
  color: var(--rarity-accent);
  box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.35);
}

.lan-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  filter: drop-shadow(0 0 8px var(--rarity-glow));
}

.lan-card__multiplier {
  position: absolute;
  right: -0.4rem;
  bottom: -0.2rem;
  padding: 0.05rem 0.4rem;
  border-radius: 9999px;
  background: var(--lan-tiger);
  color: var(--lan-on-tiger);
  font-family: var(--font-beaufort), serif;
  font-weight: bold;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.lan-card__label {
  position: relative;
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.25;
  color: var(--rarity-ink);
}

.lan-card__description {
  position: relative;
  flex: 1;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--lan-ink-soft);
}

.lan-card__hint {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--rarity-ink);
}

.lan-card__hint-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

/* --- Variante compacte --- */
.lan-card--compact .lan-card__frame {
  gap: 0.25rem;
  padding: 0.65rem 0.75rem 0.75rem;
}

.lan-card--compact .lan-card__medal {
  width: 2.75rem;
  height: 2.75rem;
  margin: 0.25rem 0;
}

.lan-card--compact .lan-card__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.lan-card--compact .lan-card__multiplier {
  font-size: 0.7rem;
  right: -0.55rem;
}

.lan-card--compact .lan-card__label {
  font-size: 1rem;
}

.lan-card--compact .lan-card__points {
  font-size: 1.1rem;
}

/* --- Dos Tigers --- */
.lan-card__back-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  border-radius: calc(var(--lan-radius) - 2px);
  background:
    radial-gradient(circle at 50% 45%, rgba(240, 138, 36, 0.28), transparent 55%),
    repeating-linear-gradient(
      118deg,
      transparent 0 16px,
      rgba(240, 138, 36, 0.16) 16px 22px,
      transparent 22px 30px,
      rgba(10, 20, 40, 0.5) 30px 33px
    ),
    linear-gradient(180deg, #121a30, #0a1020);
}

.lan-card__back-medal {
  display: grid;
  place-items: center;
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 9999px;
  border: 2px solid var(--lan-gold);
  background: radial-gradient(circle, #1d2338, #0a1020);
  color: var(--lan-tiger);
  box-shadow: 0 0 20px var(--lan-tiger-glow);
}

.lan-card__back-icon {
  width: 2.25rem;
  height: 2.25rem;
}

.lan-card__back-name {
  font-family: var(--font-beaufort), serif;
  font-size: 1rem;
  color: var(--lan-gold);
}

.lan-card--compact .lan-card__back-medal {
  width: 2.75rem;
  height: 2.75rem;
}

.lan-card--compact .lan-card__back-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* --- Sceau : la carte est jouée sur ce match --- */
.lan-card__seal {
  position: absolute;
  right: -0.6rem;
  bottom: -0.6rem;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 46% 54% 50% 50% / 52% 48% 52% 48%;
  background: radial-gradient(circle at 38% 32%, #ffb06a, var(--lan-tiger) 40%, var(--lan-tiger-deep) 75%, #8a3f06);
  color: var(--lan-on-tiger);
  box-shadow:
    inset 0 0 0 3px rgba(26, 15, 5, 0.25),
    inset 0 -4px 8px rgba(0, 0, 0, 0.25),
    0 6px 14px rgba(0, 0, 0, 0.45);
  transform: rotate(-12deg);
  animation: lan-seal-stamp 380ms var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1)) both;
}

.lan-card__seal::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: inherit;
  border: 1.5px dashed rgba(26, 15, 5, 0.45);
}

.lan-card__seal-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.lan-card--compact .lan-card__seal {
  width: 2.5rem;
  height: 2.5rem;
}

.lan-card--compact .lan-card__seal-icon {
  width: 1rem;
  height: 1rem;
}

@keyframes lan-seal-stamp {
  from {
    opacity: 0;
    transform: rotate(-24deg) scale(1.8);
  }
  60% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: rotate(-12deg) scale(1);
  }
}

@keyframes lan-seal-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lan-card,
  .lan-card:hover:not(.lan-card--compact):not(.lan-card--dimmed),
  .lan-card--selected {
    transform: none;
    transition-duration: 120ms;
  }

  /* Pas de rotation : la face apparaît en fondu par-dessus le dos */
  .lan-card__inner,
  .lan-card--face-down .lan-card__inner {
    transform: none;
    transition: none;
  }

  .lan-card__face {
    backface-visibility: visible;
    -webkit-backface-visibility: visible;
    transition: opacity 120ms linear;
  }

  .lan-card__back {
    transform: none;
    opacity: 0;
  }

  .lan-card--face-down .lan-card__back {
    opacity: 1;
  }

  .lan-card--face-down .lan-card__front {
    opacity: 0;
  }

  .lan-card__sheen {
    transition: none;
  }

  .lan-card__seal {
    animation: lan-seal-fade 120ms linear both;
  }
}
</style>
