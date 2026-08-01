<template>
  <div v-if="histories.length" class="flex flex-col gap-2">
    <MatchHistoryRow
      v-for="history in histories"
      :key="history.id"
      :history="history"
      @select="goToMatch"
    />
  </div>
  <p v-else class="text-sm text-gray-500 text-center py-6">Aucun historique disponible.</p>
</template>

<script>
import MatchHistoryRow from '@/components/account/MatchHistoryRow.vue'

export default {
  name: 'MatchHistoryList',
  components: { MatchHistoryRow },
  props: {
    histories: {
      type: Array,
      default: () => []
    },
    accountId: {
      type: Number,
      required: true
    },
    accountName: {
      type: String,
      default: ''
    }
  },
  methods: {
    goToMatch(history) {
      // accountId/player en query : ils survivent au F5 et au partage d'URL,
      // contrairement à un state de store (accountId sert au radar vs moyennes).
      // from=account : le bouton retour de la page match ramène ici plutôt
      // qu'au classement (le carrousel de l'accueil n'envoie pas ce flag)
      this.$router.push({
        name: 'MatchDetails',
        params: { id: history.id },
        query: { accountId: this.accountId, player: this.accountName, from: 'account' }
      })
    }
  }
}
</script>
