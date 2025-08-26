import { createClient } from '@supabase/supabase-js'

// Supabase project credentials
const supabaseUrl = 'https://uqzettnvrfxoatuyecyv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxemV0dG52cmZ4b2F0dXllY3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDA3OTAsImV4cCI6MjA3MTM3Njc5MH0.Uz_BWf0gpifdPoPhjo1VM0sTZ7SvPvyfIC44ixv5o48'

export const supabase = createClient(supabaseUrl, supabaseKey)