import { format } from 'date-fns'
import { RANKED_EMBLEMS } from '@/assets/rankedEmblems.js'

export const utilsTools = {
    methods: {
        randomLoadingMessage(loadingHistory, loadingMessages) {
            let currentLoadingMessage = 'Loading...';
            if (loadingHistory) {
                const randomIndex = Math.floor(Math.random() * loadingMessages.length);
                currentLoadingMessage = loadingMessages[randomIndex];
            }
            return currentLoadingMessage;
        },

        getResultMessage(result) {
            return result === true ? 'Victoire' : 'Defaite'
        },

        calculateWinrate(wins, losses) {
            const winsInt = parseInt(wins, 10);
            const lossesInt = parseInt(losses, 10);
            const totalGames = winsInt + lossesInt;
            return totalGames > 0 ? ((winsInt / totalGames) * 100).toFixed(2) : 0;
        },

        getUrlIconSummoner(iconID) {
          return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${iconID}.jpg`
        },

        getUrlIconChampion(iconID) {
          return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${iconID}.png`
        },

        // Splash centré par championId, sans gestion de version ("latest").
        // Les icônes items/sorts/runes nécessitent un catalogue id → chemin :
        // elles vivent dans le store assetCatalogStore, pas ici
        getUrlChampionSplash(championId) {
          return `https://cdn.communitydragon.org/latest/champion/${championId}/splash-art/centered`
        },

        // Emblèmes ailés servis en local (rognés de leur marge transparente) ;
        // les non-classés ont droit à un poro qui fait la sieste
        getUrlTierEmblem(tier) {
          return RANKED_EMBLEMS[tier] ?? RANKED_EMBLEMS.UNRANKED
        },

        getTeemoSound(){
          return `https://raw.communitydragon.org/latest/plugins/rcp-fe-audio/global/default/teemo.ogg`
        },

        // Simple helper to play audio from a URL. Uses HTMLAudioElement.
        playAudioFrom(url) {
          try {
            const audio = new Audio(url);
            // Avoid very loud volume by default (optional slight improvement)
            audio.volume = 0.9;
            audio.play().catch((e) => {
              // Some browsers require user gesture; clicking the card counts as gesture
              console.warn('Audio play prevented or failed:', e);
            });
          } catch (e) {
            console.error('Failed to initialize audio:', e);
          }
        },

        // Convenience method to play the Teemo sound defined above
        playTeemoSound() {
          this.playAudioFrom(this.getTeemoSound());
        },

      formatDate(date, formatString = 'dd/MM/yyyy') {
        if (!date) return '';
        try {
          return format(new Date(date), formatString);
        } catch (e) {
          console.error('Erreur de formatage de date dans la Mixin:', e);
          return '';
        }
      },

    }
};
