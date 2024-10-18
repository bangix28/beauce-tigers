<template>
  <div>
    <div
      class="container d-flex flex-column justify-content-center align-items-center align-self-stretch"
    >
      <h1>Leaderboard</h1>
    </div>


    <!--Tableau-->
    <h2 class="mb-3 ms-5 col-12">Classement</h2>
    <div id="classement" class="container fs-5">
      <div v-for="(player, index) in listSummoner" :key="index" class="row align-items-center justify-content-center mt-3">
        <div class="col-12 col-sm-1 fs-3 text">#{{index + 1}}</div>
        <div class="col-12 col-sm-2 summonerName text">{{player.summonerName}}</div>
        <div class="col-12 col-sm-3 rank text">{{player.summonerRankedSoloRank || 'non classée'}} {{player.summonerRankedSoloTier || ''}}</div>
        <template v-if="player.summonerRankedSoloLeaguePoints">
          <div class="col-12 col-sm-2 lp text">{{player.summonerRankedSoloLeaguePoints || ''}} LP</div>
          <div class="col-12 col-sm-4 winLoose text-sm-end fs-6 text">Win {{player.summoner_ranked_solo_wins || 0}}  / Loose {{player.summonerRankedSoloLosses || 0}}</div>
        </template>
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
