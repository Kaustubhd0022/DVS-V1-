/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_HUGGINGFACE_API_TOKEN?: string;
  readonly VITE_HUGGINGFACE_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
