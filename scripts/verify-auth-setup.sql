-- Verificar que la tabla professors existe y tiene los datos correctos
SELECT * FROM professors LIMIT 5;

-- Verificar la estructura de la tabla professors
\d professors;

-- Verificar que los usuarios se están creando en auth.users (solo si tienes acceso)
-- Nota: Esta tabla es del sistema de Supabase y maneja automáticamente las contraseñas
-- SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Verificar la relación entre auth.users y professors
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.school,
  p.created_at as profile_created
FROM professors p
ORDER BY p.created_at DESC
LIMIT 10;
