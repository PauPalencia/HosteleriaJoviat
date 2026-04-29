import React, { useMemo, useState } from "react";
import {
  HomeIcon, StudentsIcon, RestaurantsIcon, ClipboardIcon, CheckCircleIcon,
  UserPlusIcon, StoreIcon, SlidersIcon, LogInIcon, LogOutIcon, UserCircleIcon, GlobeIcon
} from "./SvgIcons";
import { t, LANGS, LANG_LABELS } from "../utils/translations";

// Mapa de sección → componente de icono SVG
const SECTION_ICONS = {
  "inicio":                    HomeIcon,
  "alumnos":                   StudentsIcon,
  "restaurantes":              RestaurantsIcon,
  "admin-pendientes":          ClipboardIcon,
  "admin-aprobados":           CheckCircleIcon,
  "admin-crear-alumnos":       UserPlusIcon,
  "admin-crear-restaurantes":  StoreIcon,
  "admin-herramientas":        SlidersIcon,
  "auth":                      LogInIcon,
};

// Clave de traducción para cada sección
const SECTION_KEYS = {
  "inicio":                    "nav_inicio",
  "alumnos":                   "nav_alumnos",
  "restaurantes":              "nav_restaurantes",
  "admin-pendientes":          "nav_pendientes",
  "admin-aprobados":           "nav_aprobados",
  "admin-crear-alumnos":       "nav_crear_alumnos",
  "admin-crear-restaurantes":  "nav_crear_restaurantes",
  "admin-herramientas":        "nav_herramientas",
  "auth":                      "nav_login",
};

export default function LayoutNav({
  isMobile, section, onNavigate, onProfile, onLogout,
  isAuthenticated, isAdmin,
  lang = "es", onLangChange,
  userEmail, userPhoto
}) {
  const [open, setOpen] = useState(false);

  // Lista de secciones según el rol del usuario
  const items = useMemo(() => {
    const base = [
      { key: "inicio" },
      { key: "alumnos" },
      { key: "restaurantes" },
    ];

    if (isAdmin) {
      base.push(
        { key: "admin-pendientes" },
        { key: "admin-aprobados" },
        { key: "admin-crear-alumnos" },
        { key: "admin-crear-restaurantes" },
        { key: "admin-herramientas" },
      );
    }

    if (!isAuthenticated) {
      base.push({ key: "auth" });
    }

    return base;
  }, [isAdmin, isAuthenticated]);

  // Renderiza un ítem de navegación con icono SVG + etiqueta traducida
  function NavItem({ itemKey, onClick }) {
    const IconComponent = SECTION_ICONS[itemKey] || HomeIcon;
    const label = t(lang, SECTION_KEYS[itemKey] || itemKey);
    const isActive = section === itemKey;
    return (
      <button
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={onClick}
        title={label}
      >
        <span className="nav-icon"><IconComponent size={18} /></span>
        <span className="nav-label">{label}</span>
      </button>
    );
  }

  // Selector de idioma: tres botones pill (ES / CA / EN)
  function LangSelector() {
    return (
      <div className="lang-selector">
        <span className="lang-selector-icon"><GlobeIcon size={14} /></span>
        {LANGS.map((l) => (
          <button
            key={l}
            className={`lang-btn ${lang === l ? "lang-btn-active" : ""}`}
            onClick={() => onLangChange(l)}
            aria-pressed={lang === l}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
    );
  }

  // ── Versión móvil ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <div className="mobile-topbar-head">
          <strong className="topbar-brand">JOVIAT</strong>
          <div className="mobile-actions">
            <button
              className="icon-btn"
              onClick={() => { onProfile(); setOpen(false); }}
              aria-label="Perfil"
            >
              <UserCircleIcon size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </div>
        </div>

        {open && (
          <nav className="mobile-menu-dropdown mobile-menu-shell">
            {items.map((item) => (
              <NavItem
                key={item.key}
                itemKey={item.key}
                onClick={() => { onNavigate(item.key); setOpen(false); }}
              />
            ))}

            {isAuthenticated && (
              <button
                className="danger-logout-btn nav-item"
                onClick={() => { onLogout(); setOpen(false); }}
              >
                <span className="nav-icon"><LogOutIcon size={18} /></span>
                <span className="nav-label">{t(lang, "nav_logout")}</span>
              </button>
            )}

            {/* Selector de idioma en menú móvil */}
            <div className="mobile-lang-wrap">
              <LangSelector />
            </div>
          </nav>
        )}
      </header>
    );
  }

  // ── Versión escritorio: sidebar ────────────────────────────────────────────
  return (
    <aside className="sidebar sidebar-shell">
      <div className="sidebar-top">
        {/* Cabecera: logo + botón de perfil */}
        <div className="sidebar-head">
          <h1 className="sidebar-logo">JOVIAT</h1>
          <button
            className="icon-btn profile-icon-btn"
            onClick={onProfile}
            aria-label="Mi perfil"
            title={isAuthenticated ? "Mi perfil" : "Iniciar sesión"}
          >
            <UserCircleIcon size={18} />
          </button>
        </div>

        {/* Info del usuario autenticado: foto circular + email */}
        {isAuthenticated && userEmail && (
          <div className="sidebar-user-info">
            {userPhoto && (
              <img
                src={userPhoto}
                alt="avatar"
                className="sidebar-user-avatar"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            <span className="sidebar-user-email" title={userEmail}>
              {userEmail.length > 22 ? userEmail.slice(0, 22) + "…" : userEmail}
            </span>
          </div>
        )}

        {/* Ítems de navegación */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavItem
              key={item.key}
              itemKey={item.key}
              onClick={() => onNavigate(item.key)}
            />
          ))}
        </nav>
      </div>

      {/* Pie de la barra: idioma + cerrar sesión */}
      <div className="sidebar-footer">
        <LangSelector />
        {isAuthenticated && (
          <button className="danger-logout-btn nav-item" onClick={onLogout}>
            <span className="nav-icon"><LogOutIcon size={18} /></span>
            <span className="nav-label">{t(lang, "nav_logout")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
