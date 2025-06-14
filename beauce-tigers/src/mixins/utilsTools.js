
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
        }
    }
};
