<template>
  <div
    class="flex items-center gap-4 p-3 sm:p-4 bg-gray-800/50 hover:bg-gray-800 border-l-4 rounded-r cursor-pointer transition-colors duration-200"
    :class="history.win ? 'border-green-500' : 'border-red-500'"
    @click="$emit('select', history)"
  >
    <img
      alt="Icône du Champion"
      class="w-12 h-12 rounded-full border-2 border-lol-gold flex-shrink-0"
      :src="getUrlIconChampion(history.champion)"
    />

    <div class="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 items-center">
      <div class="min-w-0">
        <p v-if="history.championName" class="text-sm font-bold text-lol-gold truncate">
          {{ history.championName }}
        </p>
        <p
          class="text-xs font-bold uppercase"
          :class="history.win ? 'text-green-400' : 'text-red-400'"
        >
          {{ history.win ? 'Victoire' : 'Défaite' }}
        </p>
      </div>

      <div>
        <p class="text-sm font-semibold">
          <span v-html="kdaFormat.htmlKDA"></span>
        </p>
        <p class="text-xs text-gray-400">KDA {{ kdaFormat.ratio.toFixed(2) }}</p>
      </div>

      <div class="text-xs text-gray-400">
        <p v-if="history.creepScore != null || history.visionScore != null">
          <span v-if="history.creepScore != null">{{ history.creepScore }} CS</span>
          <span v-if="history.creepScore != null && history.visionScore != null"> · </span>
          <span v-if="history.visionScore != null">Vision {{ history.visionScore }}</span>
        </p>
        <p v-if="history.gameDuration != null">{{ history.gameDuration }} minutes</p>
      </div>

      <div class="hidden md:block text-xs text-gray-500">
        {{ formatDate(history.dateGameEnd, 'dd/MM/yyyy HH:mm') }}
      </div>
    </div>

    <p
      class="hidden lg:flex items-center gap-1 text-xs text-lol-blue uppercase tracking-wide flex-shrink-0"
    >
      Voir le détail
      <ChevronRight class="w-3.5 h-3.5" />
    </p>
  </div>
</template>

<script>
import { utilsTools } from '@/mixins/utilsTools.js'
import { useKDAFormatter } from '@/composables/useKdaFormatter'
import { ChevronRight } from 'lucide-vue-next'

export default {
  name: 'MatchHistoryRow',
  components: { ChevronRight },
  props: {
    history: {
      type: Object,
      required: true
    }
  },
  emits: ['select'],
  mixins: [utilsTools],
  created() {
    this.kdaFormatter = useKDAFormatter()
  },
  computed: {
    kdaFormat() {
      return this.kdaFormatter.formatKDA(this.history.kill, this.history.deaths, this.history.assist)
    }
  }
}
</script>
