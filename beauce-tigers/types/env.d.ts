/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_URL: string;
  readonly VITE_RIOT_ACCOUNT_URL: string;
  readonly VITE_RIOT_HISTORY_URL: string;
  readonly VITE_RIOT_MATCH_DETAIL_URL: string;
  readonly VITE_RIOT_ACCOUNT_DETAIL_URL: string;
  readonly VITE_RIOT_ELO_DAILY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}