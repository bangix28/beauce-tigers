<template>
  <div>
    <div
      class="container d-flex flex-column justify-content-center align-items-center align-self-stretch"
    >
      <h1>Leaderboard</h1>
    </div>


    <!--Tableau-->
    <h2 class="mb-3 ms-5">Classement</h2>
    <div id="classement" class="container fs-5">
      <div class="row align-items-center mt-3" v-for="(player,index) in listSummoner">
        <div class="col-1 fs-3 text">#{{index + 1}}</div>
        <div class="col-1"></div>
        <div class="summonerName col-2 text">{{player.summonerName}}</div>
        <div class="rank col-2 text">{{player.summonerRankedSoloRank}} {{player.summonerRankedSoloTier}}</div>
        <div class="lp col-2 text">{{player.summonerRankedSoloLeaguePoints}} LP</div>
        <div class="winLoose col-4 text-end fs-6 text">Loose {{player.summonerRankedSoloLosses ?? 0}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name:"AcceuilComponent",
  data(){
    return {
      listSummoner: []
    }
  },
  mounted() {
    this.fetchData()
    console.log(this.listSummoner)
  },
  methods:{
    async fetchData() {
      let urlToFetch  = import.meta.env.VITE_RIOT_ACCOUNT_URL;
      axios.get(urlToFetch)
        .then(response => {
          console.log(response.data);
          this.listSummoner = response.data.member.sort((a, b) => b.score - a.score);
        })
        .catch(error => {
          console.error(error);
        });
    },
  }
}
</script>

<style scoped></style>
