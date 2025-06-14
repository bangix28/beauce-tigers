<template>
  <div>
    <div class="divide-y divide-gray-800">
      <div class="cursor-pointer"
           style="opacity: 1; transform: none;">
        <div class="md:hidden p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="font-bold text-lol-gold">#{{this.index + 1}}</span>
              <img alt="Icône"
                   class="w-10 h-10 rounded-full border border-lol-gold"
                   :src="getUrlIconSummoner(this.playerData.logoId)">
              <div>
                <div class="font-bold text-white">{{ playerData.summonerName }}</div>
                <div class="text-sm text-gray-400">Niveau {{ playerData.summonerLevel }}</div>
                <div class="text-sm text-gray-400">
                  {{ playerData.summonerRankedSoloTier || '' }}
                  {{ playerData.summonerRankedSoloRank || 'non classée' }}</div>
              </div>
            </div>
            <svg class="lucide lucide-chevron-right text-gray-500"
                 fill="none"
                 height="20"
                 stroke="currentColor"
                 stroke-linecap="round"
                 stroke-linejoin="round"
                 stroke-width="2"
                 viewBox="0 0 24 24"
                 width="20"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div class="bg-gray-800/50 rounded p-2">
              <div class="text-gray-400">LP</div>
              <div class="font-bold text-lol-gold">{{ playerData.summonerRankedSoloLeaguePoints || '' }} LP</div>
            </div>
            <div class="bg-gray-800/50 rounded p-2">
              <div class="text-gray-400">Win Rate</div>
              <div class="font-bold text-green-500">{{ calculateWinrate(playerData.summoner_ranked_solo_wins, playerData.summonerRankedSoloLosses) }}</div>
            </div>
            <div class="bg-gray-800/50 rounded p-2">
              <div class="text-gray-400">V/D</div>
              <div class="font-bold text-white">{{ playerData.summoner_ranked_solo_wins || 0 }}/{{ playerData.summonerRankedSoloLosses || 0 }}</div>
            </div>
          </div>
        </div>
        <div class="hidden md:grid grid-cols-12 gap-2 items-center p-4 hover:bg-gray-800/50 transition-colors">
          <div class="col-span-1 font-bold text-lol-gold">#{{this.index + 1 }}</div>
          <div class="col-span-3 flex items-center gap-2">
            <img alt="Icône"
                 class="w-12 h-12 rounded-full border border-lol-gold"
                 :src="getUrlIconSummoner(this.playerData.logoId)">
            <div>
              <div class="font-bold text-white">{{ playerData.summonerName }}</div>
              <div class="text-xs text-gray-400">Niveau {{ playerData.summonerLevel }}</div>
            </div>
          </div>
          <div class="col-span-2 font-bold text-white">
            {{ playerData.summonerRankedSoloTier || '' }}
            {{ playerData.summonerRankedSoloRank || 'non classée' }}
          </div>
          <template v-if="playerData.summonerRankedSoloLeaguePoints">
            <div class="col-span-2 font-bold text-lol-gold">{{ playerData.summonerRankedSoloLeaguePoints || '' }} LP</div>
            <div class="col-span-2"><span class="font-bold text-green-500">{{ calculateWinrate(playerData.summoner_ranked_solo_wins, playerData.summonerRankedSoloLosses) }}%</span></div>
            <div class="col-span-2 text-gray-300">{{ playerData.summoner_ranked_solo_wins || 0 }}/{{ playerData.summonerRankedSoloLosses || 0 }}</div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {utilsTools} from "@/mixins/utilsTools.js";
export default {
  name: 'RowDashboard',
  props: {
    index: {
      type: Number,
      required: true
    },
    playerData: {
      type: Object,
      required: true
    }
  },
  mixins: [  utilsTools ],
};
</script>

<style scoped>
/* Ajoute ton style ici */
</style>
