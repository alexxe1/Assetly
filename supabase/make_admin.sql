-- Ejecutar este script para darle permisos de administrador a un usuario
-- Reemplazá 'tu_usuario' con el username del usuario a promover

update public.profiles
set is_admin = true
where username = 'tu_usuario';
