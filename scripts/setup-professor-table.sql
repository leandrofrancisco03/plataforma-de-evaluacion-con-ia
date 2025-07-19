-- Verificar que la tabla professor existe con la estructura correcta
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'professor'
ORDER BY ordinal_position;

-- Verificar que el enum school_type existe
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'school_type';

-- Habilitar RLS en la tabla professor
ALTER TABLE professor ENABLE ROW LEVEL SECURITY;

-- Crear políticas para la tabla professor
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON professor;
DROP POLICY IF EXISTS "Users can view own profile" ON professor;
DROP POLICY IF EXISTS "Users can update own profile" ON professor;

CREATE POLICY "Enable insert for authenticated users" ON professor
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own profile" ON professor
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON professor
  FOR UPDATE USING (auth.uid() = id);

-- Dar permisos necesarios
GRANT ALL ON professor TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
