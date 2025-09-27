<template>
  <div>
    <div class="divide-y divide-gray-800">
      <div
        class="cursor-pointer"
        @click="toggleDetails"
        :class="[
            index === 0 ? 'bg-lol-gold/10 border-l-4 border-lol-gold shadow-lg' : 'hover:bg-gray-800/70',
            { 'bg-gray-800/70': toogleHistory }
        ]"
        style="opacity: 1; transform: none; transition: background-color 0.2s, border-color 0.2s;"
      >
        <div class="md:hidden p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="font-extrabold text-lg"
                    :class="index === 0 ? 'text-lol-gold' : 'text-gray-400'">
                #{{ index + 1 }}
              </span>

              <img alt="Icône"
                   class="w-10 h-10 rounded-full border border-lol-gold"
                   :src="getUrlIconSummoner(playerData.logoId)">
              <div>
                <div class="font-bold text-white">{{ playerData.name }}</div>
                <div class="text-xs text-gray-400">Niveau {{ playerData.level }}</div>
                <div class="text-sm text-gray-300 font-semibold">
                  {{ playerData.rankedSoloTiers || 'Unranked' }} {{ playerData.rankedSoloRanks}}
                </div>
              </div>
            </div>
            <svg class="lucide lucide-chevron-right text-gray-500"
                 :class="{ 'rotate-90': toogleHistory }"
                 style="transition: transform 0.2s ease;"
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
            <div class="bg-gray-700 rounded p-2 border border-gray-600">
              <div class="text-gray-400">LP</div>
              <div class="font-bold text-lol-gold">{{ playerData.rankedSoloPoints || 0 }} LP</div>
            </div>
            <div class="bg-gray-700 rounded p-2 border border-gray-600">
              <div class="text-gray-400">Win Rate</div>
              <div class="font-extrabold"
                   :class="calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) > 50 ? 'text-green-400' : 'text-red-400'">
                {{ calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) }}%
              </div>
            </div>
            <div class="bg-gray-700 rounded p-2 border border-gray-600">
              <div class="text-gray-400">V/D</div>
              <div class="font-bold text-white">{{ playerData.rankedSoloWins || 0 }}/{{ playerData.rankedSoloLosses || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="hidden md:grid grid-cols-12 gap-2 items-center p-4">
          <div class="col-span-1 font-extrabold text-lg"
               :class="index === 0 ? 'text-lol-gold' : 'text-gray-400'">
            #{{ index + 1 }}
          </div>
          <div class="col-span-3 flex items-center gap-3">
            <img alt="Icône"
                 class="w-14 h-14 rounded-full border-2 border-lol-gold"
                 :src="getUrlIconSummoner(playerData.logoId)">
            <div>
              <div class="font-extrabold text-white text-base">{{ playerData.name }}</div>
              <div class="text-xs text-gray-500">Niveau {{ playerData.level }}</div>
            </div>
          </div>
          <div class="col-span-2 font-extrabold text-lg text-gray-300">
            {{ playerData.rankedSoloTiers }} {{ playerData.rankedSoloRanks}}
          </div>
          <template v-if="playerData.rankedSoloPoints">
            <div class="col-span-2 font-extrabold text-lol-gold text-lg">{{ playerData.rankedSoloPoints || 0 }} LP</div>
            <div class="col-span-2">
                <span class="font-extrabold text-lg"
                      :class="calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) > 50 ? 'text-green-400' : 'text-red-400'">
                      {{ calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) }}%
                </span>
            </div>
            <div class="col-span-2 text-gray-300 font-bold">{{ playerData.rankedSoloWins || 0 }}/{{ playerData.rankedSoloLosses || 0 }}</div>
          </template>
        </div>
      </div>
      <PlayerDetails v-if="toogleHistory" :toogleHistory="toogleHistory" :playerData="playerData" />
    </div>
  </div>
</template>

<script>
import {utilsTools} from "@/mixins/utilsTools.js";
import PlayerDetails from "@/components/PlayerDetails.vue";
export default {
  name: 'RowDashboard',
  components: { PlayerDetails },
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
  data() {
    return {
      toogleHistory: false,
    }
  },
  methods: {
    toggleDetails() {
      this.toogleHistory = !this.toogleHistory;
    }
  }
};
</script>

<style scoped>
/* Ajoute ton style ici */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>