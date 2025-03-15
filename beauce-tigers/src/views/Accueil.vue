<template>
  <div>
    <div
      class="container d-flex flex-column justify-content-center align-items-center align-self-stretch"
    >
      <h1 class="display-1">Leaderboard</h1>
    </div>
    <!--Tableau-->
    <h2 class="mb-3 col-12">Classement</h2>
    <div id="classement" class="container fs-5">
      <div v-for="(player, index) in listSummoner" :key="index" class="row align-items-center justify-content-center mt-3">
      <SummonerDataList :playerData="player" :index="index" />
      </div>
    </div>
  </div>
</template>

<script>
import SummonerDataList from "@/components/SummonerDataList.vue";
import {ajaxMixins} from "@/mixins/ajaxMixins";
export default {
  name:"AcceuilComponent",
  components : {
    SummonerDataList
  },
  mixins: [ajaxMixins],
  data(){
    return {
      listSummoner: []
    }
  },
  mounted() {
    this.loadDataListSummoner()
  },
  methods:{
    loadDataListSummoner () {
      let urlToFetch = import.meta.env.VITE_RIOT_ACCOUNT_URL;
      this.fetchData(urlToFetch, responseData => {
        this.listSummoner = responseData.member.sort((a, b) => b.score - a.score);
      });
    },
  },
}
</script>

<style scoped></style>
