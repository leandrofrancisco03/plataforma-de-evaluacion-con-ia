-- Crear tabla de profesores
CREATE TABLE IF NOT EXISTS professors (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  school TEXT NOT NULL CHECK (school IN ('electronica', 'informatica', 'sistemas', 'telecomunicaciones')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_professors_email ON professors(email);
CREATE INDEX IF NOT EXISTS idx_professors_school ON professors(school);

-- Habilitar RLS (Row Level Security)
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- Crear políticas más permisivas para el registro inicial
CREATE POLICY "Enable insert for authenticated users only" ON professors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own profile" ON professors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON professors
  FOR UPDATE USING (auth.uid() = id);

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.professors (id, email, first_name, last_name, school)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'school', 'informatica')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
