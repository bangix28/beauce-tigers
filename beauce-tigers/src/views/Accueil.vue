<template>
  <div class="container mx-auto px-10 py-8">
    <TopPlayerComponent v-if="listSummoner.length > 0" :listSummoner="listSummoner" />
    <RankedDashboard :listSummoner="listSummoner" />
  </div>
</template>

<script>
import { ajaxMixins } from '@/mixins/ajaxMixins'
import HeaderComponent from '@/components/HeaderComponent.vue'
import TopPlayerComponent from '@/components/TopPlayerComponent.vue'
import RankedDashboard from '@/components/RankedDashboard.vue'
import { usePlayerDataStore } from '@/stores/playerStore'

export default {
  name: 'AcceuilComponent',
  components: {
    HeaderComponent,
    TopPlayerComponent,
    RankedDashboard
  },
  mixins: [ajaxMixins],
  data() {
    return {
      listSummoner: [],
      refreshIntervalId: null
    }
  },
  methods: {
    async refreshList() {
      const playerStore = usePlayerDataStore()
      await playerStore.fetchListPlayerData()
      this.listSummoner = playerStore.playerData.sort((a, b) => b.score - a.score)
      console.log(this.listSummoner, this.refreshIntervalId)
    }
  },
  async mounted() {
    await this.refreshList()

    this.refreshIntervalId = setInterval(() => {
      this.refreshList()
    }, 30 * 60 * 1000)
  },
  beforeUnmount() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId)
      this.refreshIntervalId = null
    }
  }
}
</script>

<style scoped></style>
