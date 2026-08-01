<template>
  <transition name="fade">
    <div class="bg-gray-900/60 border-t border-gray-800">
      <div v-if="loading" class="flex flex-col items-center justify-center text-xs text-gray-500">
        <svg
          aria-hidden="true"
          class="w-8 mt-2 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <p class="my-4">{{ randomLoadingMessage(loading, loadingMessage) }}</p>
      </div>
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
import { LOADING_MESSAGES } from '@/assets/loadingMessages.js'
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import { usePlayerHistoryStore } from '@/stores/playerHistoryStore'
import { ChevronRight } from 'lucide-vue-next'


export default {
  name: 'PlayerDetails',
  components: { ChevronRight },
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
      loading: false,
      loadingMessage: LOADING_MESSAGES
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
/* Styles pour le KDA (à ajouter à votre fichier CSS principal ou à cette balise) */
.text-lol-perfect {
  color: #fcc419;
} /* Or */
.text-lol-excellent {
  color: #81c784;
} /* Vert clair */
.text-lol-good {
  color: #ffee58;
} /* Jaune-vert */
.text-lol-poor {
  color: #ef5350;
} /* Rouge */
</style>
