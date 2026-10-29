import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// Version de l'appli (package.json, montée avec `npm version`) et identifiant
// du build : inscrits dans le JS et publiés dans version.json. Un onglet ouvert
// compare les builds pour savoir qu'un déploiement est passé, même sans
// changement de version.
const APP_VERSION = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
const APP_BUILD = Date.now().toString(36)

/** Publie version.json à la racine du build (rien en dev : pas de déploiement à guetter) */
const appVersionFile = () => ({
  name: 'app-version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ version: APP_VERSION, build: APP_BUILD })
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    appVersionFile()
  ],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __APP_BUILD__: JSON.stringify(command === 'build' ? APP_BUILD : 'dev')
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // L'URL de retour Discord est déclarée sur ce port au caractère près :
  // mieux vaut échouer au démarrage que servir le front sur un autre port
  server: {
    port: 3000,
    strictPort: true
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    restoreMocks: true
  }
}))
