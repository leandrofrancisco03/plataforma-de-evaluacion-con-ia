import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Variables de entorno con fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const   supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Client-side Supabase client (for components)
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    console.log("URL:", supabaseUrl)
    console.log("ANON KEY:", supabaseAnonKey ? "✅ Present" : "❌ Missing")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Alternative client using auth helpers (automatically handles env vars)
export const createSupabaseAuthClient = () => {
  return createClientComponentClient()
}

// Default client (safe for both client and server with public access)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes and server components)
// Only use this on the server side where SUPABASE_SERVICE_ROLE_KEY is available
export const createSupabaseServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('createSupabaseServerClient should only be used on the server side')
  }
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server client')
  }
  
  return createClient(supabaseUrl, serviceKey)
}

// Type definitions matching your database schema
export type Professor = {
  id: string
  email: string
  first_name: string
  last_name: string
  school: 
    | "ingenieria informatica"
    | "ingenieria electronica" 
    | "ingenieria mecatronica"
    | "ingenieria de telecomunicaciones"
  created_at: string
  updated_at: string
}
