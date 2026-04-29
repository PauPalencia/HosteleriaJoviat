// Sistema de traducción estático para ES (español), CA (català) y EN (English)

export const LANGS = ["es", "ca", "en"];
export const LANG_LABELS = { es: "ES", ca: "CA", en: "EN" };

const translations = {
  es: {
    nav_inicio: "Inicio",
    nav_alumnos: "Alumnos",
    nav_restaurantes: "Restaurantes",
    nav_pendientes: "Solicitudes pendientes",
    nav_aprobados: "Solicitudes aprobadas",
    nav_crear_alumnos: "Crear alumnos",
    nav_crear_restaurantes: "Crear restaurantes",
    nav_herramientas: "Panel de administración",
    nav_login: "Iniciar sesión",
    nav_logout: "Cerrar sesión",
    home_heading: "Escola d'Hosteleria Joviat",
    home_sub: "Conectamos el talento de nuestros alumnos con los mejores restaurantes.",
    home_desc: "Descubre los alumnos formados en nuestros programas de hostelería y los restaurantes donde han desarrollado su carrera profesional.",
    home_cta_alumnos: "Explorar Alumnos",
    home_cta_restaurantes: "Explorar Restaurantes",
    contact_hidden: "Inicia sesión para ver",
  },
  ca: {
    nav_inicio: "Inici",
    nav_alumnos: "Alumnes",
    nav_restaurantes: "Restaurants",
    nav_pendientes: "Sol·licituds pendents",
    nav_aprobados: "Sol·licituds aprovades",
    nav_crear_alumnos: "Crear alumnes",
    nav_crear_restaurantes: "Crear restaurants",
    nav_herramientas: "Panell d'administració",
    nav_login: "Iniciar sessió",
    nav_logout: "Tancar sessió",
    home_heading: "Escola d'Hosteleria Joviat",
    home_sub: "Connectem el talent dels nostres alumnes amb els millors restaurants.",
    home_desc: "Descobreix els alumnes formats als nostres programes d'hosteleria i els restaurants on han desenvolupat la seva carrera professional.",
    home_cta_alumnos: "Explorar Alumnes",
    home_cta_restaurantes: "Explorar Restaurants",
    contact_hidden: "Inicia sessió per veure",
  },
  en: {
    nav_inicio: "Home",
    nav_alumnos: "Students",
    nav_restaurantes: "Restaurants",
    nav_pendientes: "Pending requests",
    nav_aprobados: "Approved requests",
    nav_crear_alumnos: "Add students",
    nav_crear_restaurantes: "Add restaurants",
    nav_herramientas: "Admin panel",
    nav_login: "Sign in",
    nav_logout: "Sign out",
    home_heading: "Joviat School of Hospitality",
    home_sub: "Connecting our students' talent with the best restaurants.",
    home_desc: "Discover students trained in our hospitality programs and the restaurants where they have built their professional careers.",
    home_cta_alumnos: "Explore Students",
    home_cta_restaurantes: "Explore Restaurants",
    contact_hidden: "Sign in to view",
  }
};

// Función de traducción con fallback a español
export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.es[key] ?? key;
}
