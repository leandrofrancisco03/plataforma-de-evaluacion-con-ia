import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Variables de entorno con fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Singleton Supabase client instances - ÚNICA INSTANCIA DE CADA TIPO
let supabaseClientInstance: ReturnType<typeof createClient> | null = null;
let supabaseAuthClientInstance: ReturnType<
  typeof createClientComponentClient
> | null = null;

// Client-side Supabase client (for components) - singleton pattern MEJORADO
export const getSupabaseClient = () => {
  if (!supabaseClientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
    }
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClientInstance;
};

// Alternative client using auth helpers (automatically handles env vars)
export const getSupabaseAuthClient = () => {
  if (!supabaseAuthClientInstance) {
    supabaseAuthClientInstance = createClientComponentClient();
  }
  return supabaseAuthClientInstance;
};

// Deprecated: use getSupabaseClient() instead
export const createSupabaseClient = () => {
  return getSupabaseClient();
};

// Default client (safe for both client and server with public access)
export const supabase = getSupabaseClient();

// Server-side Supabase client (for API routes and server components)
// Only use this on the server side where SUPABASE_SERVICE_ROLE_KEY is available
export const createSupabaseServerClient = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "createSupabaseServerClient should only be used on the server side"
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server client");
  }

  return createClient(supabaseUrl, serviceKey);
};

// Type definitions matching your database schema
export type Professor = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school:
    | "ingenieria informatica"
    | "ingenieria electronica"
    | "ingenieria mecatronica"
    | "ingenieria de telecomunicaciones";
  created_at: string;
  updated_at: string;
};
