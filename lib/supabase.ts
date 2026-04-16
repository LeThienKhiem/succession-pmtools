import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!url || !key) {
  console.warn('[supabase] env vars missing — DB calls will fail gracefully, falling back to mock data')
}

// Use placeholder when env vars missing so module initialises without throwing.
// Actual queries will fail at runtime and be caught by each page's try/catch.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key',
)
