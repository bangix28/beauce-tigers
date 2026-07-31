export interface PlayerHistory {
  id: number
  win: boolean
  dateGameEnd: Date
  champion: number
  championName: string | null
  gameDuration: number | null
  assist: number
  deaths: number
  kill: number
  creepScore: number | null
  visionScore: number | null
}
