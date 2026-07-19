const { createClient } = require('@supabase/supabase-js')

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[supabase] Missing env vars. Copy backend/.env.example → backend/.env and fill in credentials.'
  )
}

/**
 * Server-side Supabase client using the service role key.
 * NEVER send this key to the browser. NEVER prefix it with VITE_.
 */
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

module.exports = supabaseAdmin
