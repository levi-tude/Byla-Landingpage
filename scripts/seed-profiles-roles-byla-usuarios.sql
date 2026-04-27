-- BYLA - Perfis iniciais (admin + secretária) por e-mail
-- Pré-requisitos:
-- 1) Rodar scripts/supabase-auth-rbac-byla.sql
-- 2) Criar os usuários em Authentication (Sign up, Invite ou Dashboard)
--    até aparecerem em auth.users com estes e-mails
-- 3) Executar este script no SQL Editor

-- Primeiro administrador
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE lower(email) = lower('levidavitudesilva@gmail.com')
ON CONFLICT (id) DO UPDATE
SET role = excluded.role, updated_at = now();

-- Secretária
INSERT INTO public.profiles (id, role)
SELECT id, 'secretaria'
FROM auth.users
WHERE lower(email) = lower('espacobyla@gmail.com')
ON CONFLICT (id) DO UPDATE
SET role = excluded.role, updated_at = now();

-- Conferência rápida
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) IN (
  lower('levidavitudesilva@gmail.com'),
  lower('espacobyla@gmail.com')
);
