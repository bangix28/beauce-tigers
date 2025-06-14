<template>
  <div>
    <div class="d-flex flex-row border rounded">
      <div v-for="(result, index) in listGames" :key="index" class="col-4">
        <div :class="['result-block', this.getResultMessage(result.isWin)]">
          {{ this.getResultMessage(result.isWin)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { utilsTools } from "@/mixins/utilsTools.js";
export default {
  name: "HistoryLolComponent",
  mixins: [ utilsTools ],
  props: {
    dataSummonerGames: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      listGames: this.dataSummonerGames.member,
    };
  }
};
</script>

<style scoped>
.result-block {
  padding: 20px;
  text-align: center;
  font-size: 1.5rem;
}

.Victoire {
  background-color: rgba(0, 255, 0, 0.66);
}

.Defaite {
  background-color: rgba(255, 0, 0, 0.5);
}
</style>
