<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-400">
    <div>
      <h3 class="text-xs uppercase tracking-widest text-gray-300 mb-2">Comment on compte</h3>
      <ul class="space-y-1.5 list-none">
        <li>
          <span class="text-lol-blue">◆</span> Un relevé de rang est pris chaque jour : la
          progression est l'écart entre le premier et le dernier relevé de la période.
        </li>
        <li>
          <span class="text-lol-blue">◆</span> Master, Grand Master et Challenger partagent un même
          plancher : seuls les LP les départagent, pas de gain fantôme à la promotion.
        </li>
        <li>
          <span class="text-lol-blue">◆</span> Deux classements de progression coexistent : les
          <span class="text-lol-gold">LP gagnés</span> comptent chaque LP à l'identique, la
          <span class="text-lol-gold">progression pondérée</span> les multiplie par le coefficient
          du tier de départ.
        </li>
        <li>
          <span class="text-lol-blue">◆</span> À égalité de progression, celui qui a joué le moins
          de parties passe devant ; puis le meilleur winrate.
        </li>
        <li>
          <span class="text-lol-blue">◆</span> Le classement winrate exige
          <span class="text-lol-gold">{{ gamesRequired }} parties</span> minimum sur la période.
        </li>
      </ul>
    </div>

    <div>
      <h3 class="text-xs uppercase tracking-widest text-gray-300 mb-2">
        Coefficients de pondération
      </h3>
      <p class="mb-3 text-xs">
        Chaque gain quotidien est multiplié par le coefficient du tier d'où il part : gagner des LP
        est plus dur en haut de l'échelle.
      </p>
      <div class="flex flex-wrap gap-x-4 gap-y-1.5">
        <span
          v-for="coefficient in COEFFICIENTS"
          :key="coefficient.label"
          class="text-xs whitespace-nowrap"
        >
          <span :class="coefficient.color">{{ coefficient.label }}</span>
          <span class="text-gray-600"> ×</span>
          <span class="text-gray-300">{{ coefficient.value }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { TIER_COLOR_CLASSES } from '@/utils/rank'

// Coefficients appliqués côté api-bot (Domain\RankedRace\TierCoefficient).
// Recopiés ici pour l'affichage : sans eux, le classement pondéré est illisible.
const COEFFICIENTS = [
  { label: 'Iron', value: '1.0', color: TIER_COLOR_CLASSES.IRON },
  { label: 'Bronze', value: '1.0', color: TIER_COLOR_CLASSES.BRONZE },
  { label: 'Silver', value: '1.1', color: TIER_COLOR_CLASSES.SILVER },
  { label: 'Gold', value: '1.25', color: TIER_COLOR_CLASSES.GOLD },
  { label: 'Platinum', value: '1.4', color: TIER_COLOR_CLASSES.PLATINUM },
  { label: 'Emerald', value: '1.6', color: TIER_COLOR_CLASSES.EMERALD },
  { label: 'Diamond', value: '1.8', color: TIER_COLOR_CLASSES.DIAMOND },
  { label: 'Master+', value: '2.2', color: TIER_COLOR_CLASSES.MASTER }
]

export default {
  name: 'RaceRulesCard',
  props: {
    gamesRequired: { type: Number, default: 5 }
  },
  data() {
    return { COEFFICIENTS }
  }
}
</script>
