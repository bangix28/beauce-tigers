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
                <div class="flex items-center gap-1.5">
                  <!-- @click.stop : le lien navigue vers la page compte sans déplier l'historique inline -->
                  <router-link
                    :to="{ name: 'AccountDetails', params: { id: playerData.id } }"
                    class="font-bold text-white hover:text-lol-gold transition-colors"
                    @click.stop
                  >{{ playerData.name }}</router-link>
                  <span v-if="playerData.soloHotStreak" title="Série de victoires en cours">
                    <Flame class="w-3.5 h-3.5 text-orange-400" />
                  </span>
                  <span v-if="playerData.soloVeteran" title="Vétéran de la division (100+ parties)">
                    <Medal class="w-3 h-3 text-gray-500" />
                  </span>
                  <span v-if="playerData.soloFreshBlood" title="Nouveau dans la division">
                    <Sparkles class="w-3 h-3 text-gray-500" />
                  </span>
                </div>
                <div class="text-xs text-gray-400">Niveau {{ playerData.level }}</div>
                <div class="mt-1 inline-flex flex-col items-center" :title="rankTitle">
                  <img :src="tierEmblemUrl"
                       :alt="rankTitle"
                       class="w-auto object-contain drop-shadow-lg"
                       :class="isUnranked ? 'h-10' : 'h-16'">
                  <span v-if="divisionLabel"
                        class="text-xs font-bold tracking-widest"
                        :class="tierColorClass">{{ divisionLabel }}</span>
                  <div v-if="miniSeriesSlots.length"
                       class="mt-0.5 flex items-center gap-1"
                       :title="`Série de promotion : ${playerData.soloMiniSeriesWins ?? 0}V / ${playerData.soloMiniSeriesLosses ?? 0}D`">
                    <span v-for="(slot, i) in miniSeriesSlots"
                          :key="i"
                          class="w-2 h-2 rounded-full"
                          :class="slot === 'W' ? 'bg-green-400' : slot === 'L' ? 'bg-red-400' : 'bg-gray-600'"></span>
                  </div>
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
              <div class="font-bold text-lol-gold">{{ playerData.rankedSoloPoints ?? 0 }} LP</div>
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
              <div class="font-bold text-white">{{ playerData.rankedSoloWins ?? 0 }}/{{ playerData.rankedSoloLosses ?? 0 }}</div>
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
              <div class="flex items-center gap-1.5">
                <!-- @click.stop : le lien navigue vers la page compte sans déplier l'historique inline -->
                <router-link
                  :to="{ name: 'AccountDetails', params: { id: playerData.id } }"
                  class="font-extrabold text-white text-base hover:text-lol-gold transition-colors"
                  @click.stop
                >{{ playerData.name }}</router-link>
                <span v-if="playerData.soloHotStreak" title="Série de victoires en cours">
                  <Flame class="w-4 h-4 text-orange-400" />
                </span>
                <span v-if="playerData.soloVeteran" title="Vétéran de la division (100+ parties)">
                  <Medal class="w-3.5 h-3.5 text-gray-500" />
                </span>
                <span v-if="playerData.soloFreshBlood" title="Nouveau dans la division">
                  <Sparkles class="w-3.5 h-3.5 text-gray-500" />
                </span>
              </div>
              <div class="text-xs text-gray-500">Niveau {{ playerData.level }}</div>
            </div>
          </div>
          <div class="col-span-2">
            <div class="flex flex-col items-center w-40 max-w-full" :title="rankTitle">
              <img :src="tierEmblemUrl"
                   :alt="rankTitle"
                   class="w-auto object-contain drop-shadow-lg"
                   :class="isUnranked ? 'h-14' : 'h-24'">
              <span v-if="divisionLabel"
                    class="text-sm font-bold tracking-widest"
                    :class="tierColorClass">{{ divisionLabel }}</span>
              <div v-if="miniSeriesSlots.length"
                   class="mt-1 flex items-center gap-1"
                   :title="`Série de promotion : ${playerData.soloMiniSeriesWins ?? 0}V / ${playerData.soloMiniSeriesLosses ?? 0}D`">
                <span v-for="(slot, i) in miniSeriesSlots"
                      :key="i"
                      class="w-2 h-2 rounded-full"
                      :class="slot === 'W' ? 'bg-green-400' : slot === 'L' ? 'bg-red-400' : 'bg-gray-600'"></span>
              </div>
            </div>
          </div>
          <template v-if="isRanked">
            <div class="col-span-2 font-extrabold text-lol-gold text-lg">{{ playerData.rankedSoloPoints ?? 0 }} LP</div>
            <div class="col-span-2">
                <span class="font-extrabold text-lg"
                      :class="calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) > 50 ? 'text-green-400' : 'text-red-400'">
                      {{ calculateWinrate(playerData.rankedSoloWins, playerData.rankedSoloLosses) }}%
                </span>
            </div>
            <div class="col-span-2 text-gray-300 font-bold">{{ playerData.rankedSoloWins ?? 0 }}/{{ playerData.rankedSoloLosses ?? 0 }}</div>
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
import { getTierColorClass } from '@/utils/rank';
import { Flame, Medal, Sparkles } from 'lucide-vue-next';
export default {
  name: 'RowDashboard',
  components: { PlayerDetails, Flame, Medal, Sparkles },
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
  computed: {
    isRanked() {
      // != null couvre null ET undefined : un joueur à 0 LP reste affiché
      return this.playerData.rankedSoloPoints != null;
    },
    tierEmblemUrl() {
      return this.getUrlTierEmblem(this.playerData.rankedSoloTiers);
    },
    rankTitle() {
      const tier = this.playerData.rankedSoloTiers;
      if (!tier || tier === 'UNRANKED') return 'UNRANKED — le poro fait la sieste';
      return `${tier} ${this.playerData.rankedSoloRanks ?? ''}`.trim();
    },
    divisionLabel() {
      const rank = this.playerData.rankedSoloRanks;
      if (!rank || rank === 'UNRANKED') return null;
      return rank;
    },
    isUnranked() {
      const tier = this.playerData.rankedSoloTiers;
      return !tier || tier === 'UNRANKED';
    },
    tierColorClass() {
      // Source unique des couleurs de tier, partagée avec la page compte
      return getTierColorClass(this.playerData.rankedSoloTiers);
    },
    miniSeriesSlots() {
      const p = this.playerData;
      if (!p.soloMiniSeriesTarget) return [];
      const progress = (p.soloMiniSeriesProgress || '').toUpperCase();
      const total = 2 * p.soloMiniSeriesTarget - 1; // Bo5 (target 3) → 5 pastilles
      return Array.from({ length: total }, (_, i) => progress[i] || 'N');
    },
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