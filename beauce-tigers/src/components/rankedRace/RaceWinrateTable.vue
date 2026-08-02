<template>
  <div>
    <!-- En-tête desktop -->
    <div
      class="hidden md:grid grid-cols-12 gap-2 items-center px-4 pb-3 text-xs font-semibold text-gray-400 border-b border-gray-800 font-beaufort"
    >
      <div class="col-span-1">#</div>
      <div class="col-span-4">Invocateur</div>
      <div class="col-span-3">Victoires / Défaites</div>
      <div class="col-span-2">Parties</div>
      <div class="col-span-2">Winrate</div>
    </div>

    <div v-if="qualified.length" class="divide-y divide-gray-800/70">
      <div
        v-for="(entry, index) in qualified"
        :key="entry.riotId"
        class="group transition-colors duration-200 animate-fade-in-stagger"
        :class="index === 0 ? 'bg-lol-gold/10 border-l-4 border-lol-gold' : 'hover:bg-gray-800/40'"
        :style="{ animationDelay: rowDelay(index) }"
      >
        <RaceWinrateRow :entry="entry" :rank="index + 1" :games-required="gamesRequired" />
      </div>
    </div>

    <p v-else class="text-sm text-gray-500 text-center py-6">
      Personne n'a encore atteint {{ gamesRequired }} parties sur cette période.
    </p>

    <template v-if="notQualified.length">
      <div class="hextech-divider my-5"></div>
      <h3 class="text-xs uppercase tracking-widest text-gray-500 mb-3 px-4">
        Pas encore qualifiés
        <span class="text-gray-600">· il manque des parties</span>
      </h3>

      <div class="divide-y divide-gray-800/70 opacity-60">
        <div
          v-for="(entry, index) in notQualified"
          :key="entry.riotId"
          class="group animate-fade-in-stagger"
          :style="{ animationDelay: rowDelay(index) }"
        >
          <RaceWinrateRow :entry="entry" :rank="null" :games-required="gamesRequired" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import RaceWinrateRow from './RaceWinrateRow.vue'
import { staggerDelay } from '@/utils/animation'

// Classement winrate de la période. Les joueurs sous le seuil de parties sont
// relégués dans une section grisée avec une jauge de progression vers le seuil.
export default {
  name: 'RaceWinrateTable',
  components: { RaceWinrateRow },
  props: {
    qualified: { type: Array, required: true },
    notQualified: { type: Array, required: true },
    gamesRequired: { type: Number, required: true }
  },
  methods: {
    rowDelay(index) {
      return staggerDelay(index)
    }
  }
}
</script>
