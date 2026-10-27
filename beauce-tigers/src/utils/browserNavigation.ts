// Sortie du site (vers Discord). Isolée dans son module : jsdom ne laisse pas
// espionner window.location, les tests remplacent donc cette fonction.
export const navigateTo = (url: string): void => {
  window.location.assign(url)
}
