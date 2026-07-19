const supabaseAdmin = require('../config/supabase')

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' })
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
  req.user = user

  // Ensure user profile exists in profiles table
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[auth-middleware] Error querying profile:', profileError.message)
    }

    const currentFullName = user.user_metadata?.full_name || user.email.split('@')[0]

    if (!profile) {
      // Create missing profile
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          full_name: currentFullName,
        })
      if (insertError) {
        console.error('[auth-middleware] Profile auto-creation failed:', insertError.message)
      } else {
        console.log(`[auth-middleware] Auto-created profile for user: ${user.id}`)
      }
    } else if (profile.full_name !== currentFullName) {
      // Keep profile name in sync with user metadata
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: currentFullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      if (updateError) {
        console.error('[auth-middleware] Profile update failed:', updateError.message)
      }
    }
  } catch (err) {
    console.error('[auth-middleware] Profile synchronization exception:', err.message)
  }

  next()
}

module.exports = requireAuth
