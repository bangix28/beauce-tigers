<template>
  <transition name="fade">
    <div class="bg-gray-900/60 border-t border-gray-800">
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div
          v-if="playerHistory && playerHistory.length"
          class="overflow-x-auto flex gap-4 p-4 justify-start flex-nowrap"
        >
          <div
            v-for="(history, idx) in playerHistory"
            :key="idx"
            class="flex flex-col items-center justify-between p-4 bg-gray-800 rounded-lg shadow-xl transition transform hover:scale-105 hover:brightness-110 duration-300 flex-shrink-0 lg:flex-shrink-1 basis-[35vw] sm:basis-[15rem] md:basis-[13rem] lg:basis-100 cursor-pointer"
            :class="[
              getKdaFormat(history).highlightClass,
              history.win ? 'border-4 border-green-500' : 'border-4 border-red-500'
            ]"
            @click="goToMatch(history)"
          >
            <div class="relative mb-3">
              <img
                alt="Icône du Champion"
                class="w-16 h-16 rounded-full border-2 border-lol-gold"
                :src="getUrlIconChampion(history.champion)"
              />
            </div>

            <div class="text-center w-full">
              <p v-if="history.championName" class="text-sm font-bold text-lol-gold mb-1">
                {{ history.championName }}
              </p>

              <p class="text-sm font-semibold mb-2">
                <span v-html="getKdaFormat(history).htmlKDA"></span>
              </p>

              <p
                class="font-bold text-xs uppercase mb-1"
                :class="history.win ? 'text-green-400' : 'text-red-400'"
              >
                {{ history.win ? 'VICTOIRE' : 'DÉFAITE' }} ({{
                  getKdaFormat(history).ratio.toFixed(2)
                }})
              </p>
            </div>

            <div class="mt-2 w-full text-center border-t border-gray-700 pt-2">
              <p
                v-if="history.creepScore != null || history.visionScore != null"
                class="text-xs text-gray-400 mb-1"
              >
                <span v-if="history.creepScore != null">{{ history.creepScore }} CS</span>
                <span v-if="history.creepScore != null && history.visionScore != null"> · </span>
                <span v-if="history.visionScore != null">Vision {{ history.visionScore }}</span>
              </p>

              <p v-if="history.gameDuration != null" class="text-xs text-gray-400 mb-1">
                Durée : {{ history.gameDuration }} minutes
              </p>

              <p class="text-xs text-gray-500">
                {{ formatDate(history.dateGameEnd) }}
              </p>

              <p
                class="flex items-center justify-center gap-1 text-xs text-lol-blue mt-2 uppercase tracking-wide"
              >
                Voir le détail
                <ChevronRight class="w-3.5 h-3.5" />
              </p>
            </div>
          </div>
        </div>
        <div v-else class="text-sm p-5 text-center text-gray-500">Aucun historique disponible.</div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ajaxMixins } from '@/mixins/ajaxMixins.js'
import { utilsTools } from '@/mixins/utilsTools.js'
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import { usePlayerHistoryStore } from '@/stores/playerHistoryStore'
import { ChevronRight } from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'


export default {
  name: 'PlayerDetails',
  components: { ChevronRight, LoadingSpinner },
  props: {
    toogleHistory: {
      type: Boolean,
      default: false
    },
    playerData: {
      type: Object,
      required: true
    }
  },
  mixins: [ajaxMixins, utilsTools],
  created() {
    this.kdaFormatter = useKDAFormatter()
  },
  async mounted() {
    const playerHistory = usePlayerHistoryStore();
    this.loading = true
    await playerHistory.fetchListPlayerHistoryData(this.playerData.id)
    this.playerHistory = playerHistory.PlayerHistoryData
    this.loading = false
  },
  data() {
    return {
      playerHistory: [],
      loading: false
    }
  },
  methods: {
    getKdaFormat(historyItem) {
      return this.kdaFormatter.formatKDA(
        historyItem.kill,
        historyItem.deaths,
        historyItem.assist
      )
    },
    goToMatch(history) {
      // accountId/player en query : ils survivent au F5 et au partage d'URL,
      // contrairement à un state de store (accountId sert au radar vs moyennes)
      this.$router.push({
        name: 'MatchDetails',
        params: { id: history.id },
        query: { accountId: this.playerData.id, player: this.playerData.name }
      })
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
