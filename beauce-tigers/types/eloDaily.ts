export interface EloDailyPoint {
  // Date ISO renvoyée par l'API (type DATE côté Doctrine, sérialisé en datetime)
  date: string
  // Elo cumulé : tier * 1000 + division * 100 + LP (voir utils/rank.ts)
  score: number
}
