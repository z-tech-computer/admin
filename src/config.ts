const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const;

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY",
  );
}

export default config;
