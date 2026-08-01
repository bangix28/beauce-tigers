import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// Axios nu (pas apiClient) : le CDN CommunityDragon n'a rien à voir avec le BFF
const CDRAGON_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/'
const CATALOG_BASE = CDRAGON_BASE + 'v1/'

// Les catalogues exposent un iconPath du type
// "/lol-game-data/assets/ASSETS/Items/Icons2D/1001_...png" ;
// l'asset réel est servi sous le même chemin en minuscules, préfixé par CDRAGON_BASE
const iconPathToUrl = (iconPath: string): string =>
  CDRAGON_BASE + iconPath.replace('/lol-game-data/assets/', '').toLowerCase()

export const useAssetCatalogStore = defineStore('assetCatalog', () => {
  const itemIconById = ref<Record<number, string>>({})
  const summonerSpellIconById = ref<Record<number, string>>({})
  const perkIconById = ref<Record<number, string>>({})
  const perkStyleIconById = ref<Record<number, string>>({})

  // Promesse mémorisée : un seul chargement par session, même en appels concurrents
  let catalogPromise: Promise<void> | null = null

  const loadCatalogs = () => {
    if (catalogPromise) return catalogPromise

    catalogPromise = Promise.all([
      axios.get(CATALOG_BASE + 'items.json'),
      axios.get(CATALOG_BASE + 'summoner-spells.json'),
      axios.get(CATALOG_BASE + 'perks.json'),
      axios.get(CATALOG_BASE + 'perkstyles.json')
    ])
      .then(([items, spells, perks, perkStyles]) => {
        for (const item of items.data) {
          if (item.iconPath) itemIconById.value[item.id] = item.iconPath
        }
        for (const spell of spells.data) {
          if (spell.iconPath) summonerSpellIconById.value[spell.id] = spell.iconPath
        }
        // perks.json contient aussi les stat shards (5001-5013)
        for (const perk of perks.data) {
          if (perk.iconPath) perkIconById.value[perk.id] = perk.iconPath
        }
        for (const style of perkStyles.data.styles) {
          if (style.iconPath) perkStyleIconById.value[style.id] = style.iconPath
        }
      })
      .catch(() => {
        // CDN indisponible : maps vides, les icônes sont simplement masquées
        // (les getters retournent null et les <img> sont derrière des v-if)
        catalogPromise = null
      })

    return catalogPromise
  }

  const getItemIconUrl = (id: number | null): string | null => {
    if (id == null || !itemIconById.value[id]) return null
    return iconPathToUrl(itemIconById.value[id])
  }

  const getSummonerSpellIconUrl = (id: number | null): string | null => {
    if (id == null || !summonerSpellIconById.value[id]) return null
    return iconPathToUrl(summonerSpellIconById.value[id])
  }

  const getPerkIconUrl = (id: number | null): string | null => {
    if (id == null || !perkIconById.value[id]) return null
    return iconPathToUrl(perkIconById.value[id])
  }

  const getPerkStyleIconUrl = (id: number | null): string | null => {
    if (id == null || !perkStyleIconById.value[id]) return null
    return iconPathToUrl(perkStyleIconById.value[id])
  }

  return {
    loadCatalogs,
    getItemIconUrl,
    getSummonerSpellIconUrl,
    getPerkIconUrl,
    getPerkStyleIconUrl
  }
})
