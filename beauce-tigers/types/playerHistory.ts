export interface PlayerHistory {
  id: number,
  win: boolean,
  dateGameEnd: Date,
  champion: number,
  gameDuration: string,
  assist: number,
  deaths: number,
  kill: number,
}
