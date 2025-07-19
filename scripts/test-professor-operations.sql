-- Test para verificar que las operaciones en la tabla professor funcionan correctamente

-- 1. Verificar estructura de la tabla
\d professor;

-- 2. Verificar enum values
SELECT unnest(enum_range(NULL::school_type)) as school_options;

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'professor';

-- 4. Test de inserción (esto se ejecutará desde la aplicación)
-- INSERT INTO professor (id, email, first_name, last_name, school) 
-- VALUES ('test-uuid', 'test@example.com', 'Test', 'User', 'ingenieria informatica');

-- 5. Verificar datos existentes
SELECT id, email, first_name, last_name, school, created_at 
FROM professor 
ORDER BY created_at DESC 
LIMIT 5;
