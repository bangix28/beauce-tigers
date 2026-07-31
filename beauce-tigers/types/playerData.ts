export interface PlayerData {
  id: number
  lastUpdate: Date
  logoId: number
  score: number
  level: number
  name: string
  rankedSoloPoints: number | null
  rankedSoloLosses: number | null
  rankedSoloTiers: string | null
  rankedSoloRanks: string | null
  rankedSoloWins: number | null
  soloHotStreak: boolean
  soloVeteran: boolean
  soloFreshBlood: boolean
  soloMiniSeriesWins: number | null
  soloMiniSeriesLosses: number | null
  soloMiniSeriesTarget: number | null
  soloMiniSeriesProgress: string | null
}
