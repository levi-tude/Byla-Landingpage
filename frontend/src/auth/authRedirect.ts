/**
 * Base URL usada em links de recuperação de senha (deve estar em
 * Supabase → Authentication → URL Configuration → Redirect URLs).
 */
export function getAuthSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function getPasswordRecoveryRedirectUrl(): string {
  return `${getAuthSiteOrigin()}/redefinir-senha`;
}
