import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: () => Promise.resolve({ error: new Error('not configured') }),
        signOut: () => Promise.resolve(),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('not configured') }),
        insert: () => Promise.resolve({ data: null, error: new Error('not configured') }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('not configured') }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: new Error('not configured') }) }),
      }),
    }
