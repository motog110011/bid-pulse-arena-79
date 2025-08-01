import { createClient } from '@supabase/supabase-js'

// For Lovable projects with native Supabase integration, 
// the connection is automatically configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)