/**
 * Calcule le KDA Ratio (Kills + Assists) / Deaths.
 * Gère le cas de 0 mort en retournant un grand nombre (pour les "Perfect KDA").
 * @param kills Nombre de Kills
 * @param deaths Nombre de Deaths
 * @param assists Nombre d'Assists
 * @returns Le ratio KDA (nombre)
 */
const calculateKdaRatio = (kills: number, deaths: number, assists: number): number => {
  if (deaths === 0) {
    // Si 0 mort, on donne un score très élevé (Perfect KDA)
    return (kills + assists);
  }
  return (kills + assists) / deaths;
};

/**
 * Formate le KDA dans une chaîne HTML avec des classes Tailwind CSS
 * pour un affichage coloré et stylisé.
 * @param kills Nombre de Kills
 * @param deaths Nombre de Deaths
 * @param assists Nombre d'Assists
 * @returns Un objet contenant la chaîne KDA (string) et le KDA Ratio (number)
 */
export function useKDAFormatter() {
  const formatKDA = (kills: number, deaths: number, assists: number): { htmlKDA: string, ratio: number, highlightClass: string } => {
    const ratio = calculateKdaRatio(kills, deaths, assists);
    let highlightClass = 'text-gray-300'; // Couleur par défaut

    // Appliquer une classe de surbrillance basée sur la performance (ratio)
    if (deaths === 0) {
      highlightClass = 'text-lol-perfect border-lol-perfect'; // Ex: Jaune vif/Or pour un KDA parfait
    } else if (ratio >= 4) {
      highlightClass = 'text-lol-excellent'; // Ex: Vert clair pour un très bon KDA
    } else if (ratio >= 2.5) {
      highlightClass = 'text-lol-good'; // Ex: Vert-jaune pour un KDA correct
    } else if (ratio < 1) {
      highlightClass = 'text-lol-poor'; // Ex: Rouge pour un KDA faible
    }

    // Chaîne HTML simple pour l'affichage (utilisez un v-html pour l'intégrer)
    const htmlKDA = `
      <span class="font-bold text-yellow-400">${kills}</span> / 
      <span class="font-bold text-red-500">${deaths}</span> / 
      <span class="font-bold text-blue-400">${assists}</span>
    `;

    return {
      htmlKDA,
      ratio,
      highlightClass
    };
  };

  return {
    formatKDA,
  };
}