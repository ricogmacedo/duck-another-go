/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ANOTHER_DUCK_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
