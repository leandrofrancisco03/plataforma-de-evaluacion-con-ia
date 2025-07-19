-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can insert own profile" ON professors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON professors;

-- Crear política más permisiva para INSERT
CREATE POLICY "Enable insert for authenticated users" ON professors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Asegurar que las otras políticas existan
DROP POLICY IF EXISTS "Users can view own profile" ON professors;
CREATE POLICY "Users can view own profile" ON professors
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON professors;
CREATE POLICY "Users can update own profile" ON professors
  FOR UPDATE USING (auth.uid() = id);

-- Verificar que RLS esté habilitado
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
