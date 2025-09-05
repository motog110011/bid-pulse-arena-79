import { createClient } from '@supabase/supabase-js'

// Use the correct Supabase project configuration
const SUPABASE_URL = "https://qxodekhmjymqyzudfbtv.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b2Rla2htanltcXl6dWRmYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzAwMjgsImV4cCI6MjA2OTYwNjAyOH0.8jceQn1atomnP0yrXR3N5m88ECDDXyKrdigmNp_X0rA"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)