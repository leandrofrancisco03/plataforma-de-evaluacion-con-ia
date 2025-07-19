-- Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON professors;
DROP POLICY IF EXISTS "Users can view own profile" ON professors;
DROP POLICY IF EXISTS "Users can update own profile" ON professors;
DROP POLICY IF EXISTS "Users can insert own profile" ON professors;

-- Deshabilitar RLS temporalmente para solucionar el problema
ALTER TABLE professors DISABLE ROW LEVEL SECURITY;

-- Eliminar trigger y función existentes si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recrear la tabla con una estructura más simple
DROP TABLE IF EXISTS professors;

CREATE TABLE professors (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  school TEXT NOT NULL CHECK (school IN ('electronica', 'informatica', 'sistemas', 'telecomunicaciones')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_professors_email ON professors(email);
CREATE INDEX idx_professors_school ON professors(school);

-- Dar permisos completos a usuarios autenticados
GRANT ALL ON professors TO authenticated;
GRANT ALL ON professors TO anon;
