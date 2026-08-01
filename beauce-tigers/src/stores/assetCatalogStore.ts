import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// Axios nu (pas apiClient) : le CDN CommunityDragon n'a rien à voir avec le BFF
const CDRAGON_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/'
const CATALOG_BASE = CDRAGON_BASE + 'v1/'
// Catalogue localisé : mêmes iconPath que "default", mais name/description en français
const CATALOG_FR = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/fr_fr/v1/'

// Infos d'un item pour le tooltip (description au format markup Riot)
export interface ItemInfo {
  name: string
  description: string
  priceTotal: number
}

export interface SummonerSpellInfo {
  name: string
  description: string
  // Secondes
  cooldown: number | null
}

export interface PerkInfo {
  name: string
  description: string
}

// Les catalogues exposent un iconPath du type
// "/lol-game-data/assets/ASSETS/Items/Icons2D/1001_...png" ;
// l'asset réel est servi sous le même chemin en minuscules, préfixé par CDRAGON_BASE
const iconPathToUrl = (iconPath: string): string =>
  CDRAGON_BASE + iconPath.replace('/lol-game-data/assets/', '').toLowerCase()

export const useAssetCatalogStore = defineStore('assetCatalog', () => {
  const itemIconById = ref<Record<number, string>>({})
  const itemInfoById = ref<Record<number, ItemInfo>>({})
  const summonerSpellIconById = ref<Record<number, string>>({})
  const summonerSpellInfoById = ref<Record<number, SummonerSpellInfo>>({})
  const perkIconById = ref<Record<number, string>>({})
  const perkInfoById = ref<Record<number, PerkInfo>>({})
  const perkStyleIconById = ref<Record<number, string>>({})
  const perkStyleInfoById = ref<Record<number, PerkInfo>>({})

  // Promesse mémorisée : un seul chargement par session, même en appels concurrents
  let catalogPromise: Promise<void> | null = null

  const loadCatalogs = () => {
    if (catalogPromise) return catalogPromise

    // fr_fr pour les tooltips ; repli sur default (anglais) si la locale manque
    const getLocalized = (file: string) =>
      axios.get(CATALOG_FR + file).catch(() => axios.get(CATALOG_BASE + file))

    catalogPromise = Promise.all([
      getLocalized('items.json'),
      getLocalized('summoner-spells.json'),
      getLocalized('perks.json'),
      getLocalized('perkstyles.json')
    ])
      .then(([items, spells, perks, perkStyles]) => {
        for (const item of items.data) {
          if (item.iconPath) itemIconById.value[item.id] = item.iconPath
          itemInfoById.value[item.id] = {
            name: item.name ?? '',
            description: item.description ?? '',
            priceTotal: item.priceTotal ?? 0
          }
        }
        for (const spell of spells.data) {
          if (spell.iconPath) summonerSpellIconById.value[spell.id] = spell.iconPath
          summonerSpellInfoById.value[spell.id] = {
            name: spell.name ?? '',
            description: spell.description ?? '',
            cooldown: spell.cooldown ?? null
          }
        }
        // perks.json contient aussi les stat shards (5001-5013)
        for (const perk of perks.data) {
          if (perk.iconPath) perkIconById.value[perk.id] = perk.iconPath
          perkInfoById.value[perk.id] = {
            name: perk.name ?? '',
            // longDesc est la fiche complète façon jeu ; shortDesc en secours
            description: perk.longDesc || perk.shortDesc || ''
          }
        }
        for (const style of perkStyles.data.styles) {
          if (style.iconPath) perkStyleIconById.value[style.id] = style.iconPath
          perkStyleInfoById.value[style.id] = {
            name: style.name ?? '',
            description: style.tooltip ?? ''
          }
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

  const getItemInfo = (id: number | null): ItemInfo | null => {
    if (id == null) return null
    return itemInfoById.value[id] ?? null
  }

  const getSummonerSpellInfo = (id: number | null): SummonerSpellInfo | null => {
    if (id == null) return null
    return summonerSpellInfoById.value[id] ?? null
  }

  const getPerkInfo = (id: number | null): PerkInfo | null => {
    if (id == null) return null
    return perkInfoById.value[id] ?? null
  }

  const getPerkStyleInfo = (id: number | null): PerkInfo | null => {
    if (id == null) return null
    return perkStyleInfoById.value[id] ?? null
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
    getItemInfo,
    getSummonerSpellIconUrl,
    getSummonerSpellInfo,
    getPerkIconUrl,
    getPerkInfo,
    getPerkStyleIconUrl,
    getPerkStyleInfo
  }
})
