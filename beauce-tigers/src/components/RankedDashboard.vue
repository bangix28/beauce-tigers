<template>
  <div>
    <div class="space-y-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl mt-10 font-bold text-lol-gold">Classement Global</h2>
        <button class="flex items-center gap-2 px-4 py-2 bg-lol-darker hover:bg-gray-800 rounded-lg text-gray-300 transition-colors">
          <span class="hidden sm:inline">Actualiser</span>
        </button>
      </div>
      <div class="bg-lol-darker rounded-lg border border-gray-800 overflow-hidden">
        <div class="hidden md:grid grid-cols-12 gap-2 p-4 text-sm font-semibold text-gray-400 border-b border-gray-800">
          <div class="col-span-1">#</div>
          <div class="col-span-3">Invocateur</div>
          <div class="col-span-2">Division</div>
          <div class="col-span-2">LP</div>
          <div class="col-span-2">Win Rate</div>
          <div class="col-span-2">V/D</div>
        </div>
        <div v-for="(player, index) in listSummoner"
             :key="index"
             class="row align-items-center justify-content-center mt-3">
          <RowDashboard :index="index"
                        :playerData="player"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {utilsTools} from "@/mixins/utilsTools.js";
import {Award, Medal, Trophy} from 'lucide-vue-next';
import RowDashboard from "@/components/RowDashboard.vue";

export default {
  name: 'TopPlayers',
  components: {RowDashboard},
  props: {
    listSummoner: Array,
  },
  mixins: [utilsTools],

  data() {
    return {
      topPlayers: this.listSummoner.slice(0, 3) ?? [],
      badges: [
        {icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', scale: 1.1},
        {icon: Medal, color: 'text-gray-300', bgColor: 'bg-gray-400/10', scale: 1},
        {icon: Award, color: 'text-amber-700', bgColor: 'bg-amber-700/10', scale: 1},
      ],
    }
  },
  mounted() {
    console.log(this.topPlayers);
  }
};
</script>

<style scoped>
/* Ajoute ton style ici */
</style>
