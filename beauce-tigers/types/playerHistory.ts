export interface PlayerHistory {
  id: number
  win: boolean
  dateGameEnd: Date
  champion: number
  championName: string | null
  teamPosition: string | null
  gameDuration: number | null
  assist: number
  deaths: number
  kill: number
  creepScore: number | null
  visionScore: number | null
  // Challenges Riot (null sur les vieux matchs) : servent aux moyennes du radar
  kda: number | null
  killParticipation: number | null
  damagePerMinute: number | null
  goldPerMinute: number | null
  visionScorePerMinute: number | null
}
