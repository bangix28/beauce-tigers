<template>
  <div class="container mx-auto px-4 py-8">
    <TopPlayerComponent v-if="listSummoner.length > 0" :listSummoner="listSummoner"/>
    <RankedDashboard :listSummoner="listSummoner"/>
  </div>
</template>

<script>
import {ajaxMixins} from "@/mixins/ajaxMixins";
import HeaderComponent from "@/components/HeaderComponent.vue";
import TopPlayerComponent from "@/components/TopPlayerComponent.vue";
import RankedDashboard from "@/components/RankedDashboard.vue";
export default {
  name:"AcceuilComponent",
  components : {
    HeaderComponent,
    TopPlayerComponent,
    RankedDashboard
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
