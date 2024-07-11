/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_API_QDC_URL: string
  readonly VITE_AVATAR_PLACEHOLDER_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

