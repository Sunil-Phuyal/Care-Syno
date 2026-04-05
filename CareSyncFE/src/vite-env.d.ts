/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Vite's client.d.ts already covers `*.svg` — only add the ?url variant
declare module '*.svg?url' {
  const src: string;
  export default src;
}