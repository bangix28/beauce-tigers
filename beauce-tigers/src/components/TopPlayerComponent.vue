<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div
        v-for="(player, index) in topPlayers"
        :key="player.id"
        class="relative p-6 rounded-lg border border-gray-800"
        :class="badges[index].bgColor"
        @click="playTeemoSound"

    >
      <div class="absolute top-4 right-4">
        <component :is="badges[index].icon" class="w-8 h-8" :class="badges[index].color" />
      </div>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <img
              :src="getUrlIconSummoner(player.logoId)"
              :alt="player.name"
              class="w-16 h-16 rounded-full border-2 border-lol-gold"
          />
          <div class="absolute -bottom-1 -right-1 bg-lol-dark rounded-full px-2 py-1 text-xs border border-lol-gold">
            {{ player.level }}
          </div>
        </div>
        <div>
          <h3 class="text-xl font-bold text-lol-gold">{{ player.name }}</h3>
          <div class="flex items-center mt-1 space-x-2">
            <span class="text-sm text-gray-400">Niveau {{ player.level }}</span>
          </div>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="bg-gray-800/50 rounded p-2">
          <div class="text-sm text-gray-400">Rang</div>
          <div class="font-bold text-white">#{{ index + 1 }}</div>
        </div>
        <div class="bg-gray-800/50 rounded p-2">
          <div class="text-sm text-gray-400">Win Rate</div>
          <div class="font-bold text-emerald-400">{{ calculateWinrate(player.rankedSoloWins, player.rankedSoloLosses) }}%</div>
        </div>
        <div class="bg-gray-800/50 rounded p-2">
          <div class="text-sm text-gray-400">LP</div>
          <div class="font-bold text-yellow-400">{{ player.rankedSoloPoints ?? 0 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {utilsTools} from "@/mixins/utilsTools.js";
import { Trophy, Medal, Award } from 'lucide-vue-next';

export default {
  name: 'TopPlayers',
  props: {
    listSummoner: Array,
  },
  mixins: [  utilsTools ],

  data() {
    return {
      topPlayers: this.listSummoner.slice(0, 3) ?? [],
      badges: [
        { icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', scale: 1.1 },
        { icon: Medal, color: 'text-gray-300', bgColor: 'bg-gray-400/10', scale: 1 },
        { icon: Award, color: 'text-amber-700', bgColor: 'bg-amber-700/10', scale: 1 },
      ],
    }
  }
};
</script>

<style scoped>
/* Ajoute ton style ici */
</style>
