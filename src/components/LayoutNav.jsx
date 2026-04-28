import React, { useMemo, useState } from "react";

// Mapa de iconos para cada sección del menú
const SECTION_ICONS = {
  "inicio":                    "🏠",
  "alumnos":                   "🎓",
  "restaurantes":              "🍽️",
  "admin-pendientes":          "📋",
  "admin-aprobados":           "✅",
  "admin-crear-alumnos":       "➕",
  "admin-crear-restaurantes":  "🏪",
  "admin-herramientas":        "⚙️",
  "auth":                      "🔑",
  "perfil":                    "👤"
};

export default function LayoutNav({ isMobile, section, onNavigate, onProfile, onLogout, isAuthenticated, isAdmin }) {
  const [open, setOpen] = useState(false);

  // Construye la lista de ítems de navegación según el rol del usuario
  const items = useMemo(() => {
    const baseItems = [
      { key: "inicio",        label: "Inicio" },
      { key: "alumnos",       label: "Alumnos" },
      { key: "restaurantes",  label: "Restaurantes" }
    ];

    if (isAdmin) {
      baseItems.push(
        { key: "admin-pendientes",         label: "Solicitudes pendientes" },
        { key: "admin-aprobados",          label: "Solicitudes aprobadas" },
        { key: "admin-crear-alumnos",      label: "Crear alumnos" },
        { key: "admin-crear-restaurantes", label: "Crear restaurantes" },
        { key: "admin-herramientas",       label: "Panel de administración" }
      );
    }

    if (!isAuthenticated) {
      baseItems.push({ key: "auth", label: "Login / Sign in" });
    }

    return baseItems;
  }, [isAdmin, isAuthenticated]);

  // ── Versión móvil: topbar con menú desplegable ────────────────────────────
  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <div className="mobile-topbar-head">
          <strong className="topbar-brand">JOVIAT</strong>
          <div className="mobile-actions">
            {/* Botón de perfil */}
            <button
              className="icon-btn"
              onClick={() => { onProfile(); setOpen(false); }}
              aria-label="Perfil"
              title="Mi perfil"
            >
              {isAuthenticated ? "👤" : "🔑"}
            </button>
            {/* Botón hamburguesa */}
            <button
              className="icon-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
              title="Menú"
            >
              ☰
            </button>
          </div>
        </div>

        {open && (
          <nav className="mobile-menu-dropdown mobile-menu-shell">
            {items.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${section === item.key ? "active" : ""}`}
                onClick={() => { onNavigate(item.key); setOpen(false); }}
              >
                <span className="nav-icon">{SECTION_ICONS[item.key] || "•"}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}

            {isAuthenticated && (
              <button
                className="danger-logout-btn nav-item"
                onClick={() => { onLogout(); setOpen(false); }}
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Cerrar sesión</span>
              </button>
            )}
          </nav>
        )}
      </header>
    );
  }

  // ── Versión escritorio: sidebar fija ─────────────────────────────────────
  return (
    <aside className="sidebar sidebar-shell">
      <div>
        {/* Cabecera: logo + botón de perfil */}
        <div className="sidebar-head">
          <h1 className="sidebar-logo">JOVIAT</h1>
          <button
            className="icon-btn profile-icon-btn"
            onClick={onProfile}
            aria-label="Mi perfil"
            title={isAuthenticated ? "Mi perfil" : "Iniciar sesión"}
          >
            {isAuthenticated ? "👤" : "🔑"}
          </button>
        </div>

        {/* Ítems de navegación */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${section === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
              title={item.label}
            >
              <span className="nav-icon">{SECTION_ICONS[item.key] || "•"}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Pie de la barra lateral: botón de cerrar sesión */}
      {isAuthenticated && (
        <div className="sidebar-footer">
          <button className="danger-logout-btn nav-item" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
}
