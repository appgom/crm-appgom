// Cuando el portal se sirve desde su propio subdominio (portal.appgom.com),
// las rutas viven en la raiz ("/login", "/", "/contratos/:id"). Cuando se
// accede desde crm.appgom.com (compatibilidad con enlaces viejos), siguen
// montadas bajo "/portal". Un solo lugar para no repetir el chequeo de host
// en cada pagina del portal.
export const ES_SUBDOMINIO_PORTAL =
  typeof window !== 'undefined' && window.location.hostname.startsWith('portal.');

export const PORTAL_BASE = ES_SUBDOMINIO_PORTAL ? '' : '/portal';
export const PORTAL_HOME = PORTAL_BASE || '/';
