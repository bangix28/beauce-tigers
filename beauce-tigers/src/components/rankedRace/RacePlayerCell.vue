<template>
  <div class="flex items-center gap-2.5 min-w-0">
    <img
      :src="getUrlIconSummoner(logoId)"
      :alt="summonerName"
      class="rounded-full border border-lol-gold/60 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
      :class="[avatarClass, glow ? 'avatar-glow' : '']"
    />
    <div class="min-w-0">
      <!-- @click.stop : la cellule est parfois posée dans une ligne cliquable -->
      <router-link
        v-if="accountId"
        :to="{ name: 'AccountDetails', params: { id: accountId } }"
        class="block truncate font-bold text-white hover:text-lol-gold transition-colors duration-200"
        :class="nameClass"
        @click.stop
        >{{ summonerName }}</router-link
      >
      <span v-else class="block truncate font-bold text-gray-200" :class="nameClass">{{
        summonerName
      }}</span>
    </div>
  </div>
</template>

<script>
import { usePlayerDataStore } from '@/stores/playerStore'
import { utilsTools } from '@/mixins/utilsTools.js'

// Avatar + nom d'un coureur, partagé par le podium, la piste et les deux tables.
// Les endpoints de course n'exposent pas l'id numérique du compte — riotId est
// un PUUID, inexploitable pour construire une URL. On retrouve l'id par
// recoupement du summonerName avec la collection déjà chargée par le classement
// global (même colonne des deux côtés). Sans correspondance, le nom reste du
// texte simple plutôt qu'un lien mort.
export default {
  name: 'RacePlayerCell',
  mixins: [utilsTools],
  props: {
    summonerName: { type: String, required: true },
    logoId: { type: String, default: '' },
    size: { type: String, default: 'md' }, // 'sm' (piste, tables) | 'md' (podium)
    /** Anneau doré pulsant, réservé au vainqueur d'une course terminée */
    glow: { type: Boolean, default: false }
  },
  created() {
    this.playerDataStore = usePlayerDataStore()
  },
  computed: {
    accountId() {
      const match = this.playerDataStore.playerData.find((p) => p.name === this.summonerName)
      return match?.id ?? null
    },
    avatarClass() {
      return this.size === 'md' ? 'w-12 h-12' : 'w-9 h-9'
    },
    nameClass() {
      return this.size === 'md' ? 'text-base' : 'text-sm'
    }
  }
}
</script>

<style scoped>
.avatar-glow {
  border-color: var(--color-lol-gold);
  animation: avatarPulse 2.4s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(200, 170, 110, 0.55);
  }
  70% {
    box-shadow: 0 0 0 0.6rem rgba(200, 170, 110, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .avatar-glow {
    animation: none;
    box-shadow: 0 0 10px rgba(200, 170, 110, 0.5);
  }
}
</style>
