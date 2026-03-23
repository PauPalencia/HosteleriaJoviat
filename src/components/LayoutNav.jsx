import React, { useMemo, useState } from "react";

export default function LayoutNav({ isMobile, section, onNavigate, onProfile, onLogout, isAuthenticated, isAdmin }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const baseItems = [
      { key: "inicio", label: "Inicio" },
      { key: "alumnos", label: "Alumnos" },
      { key: "restaurantes", label: "Restaurantes" },
      { key: "auth", label: isAuthenticated ? "Cuenta" : "Login / Registro" }
    ];

    if (isAdmin) {
      baseItems.splice(3, 0,
        { key: "admin-pendientes", label: "Aceptar alumnos" },
        { key: "admin-herramientas", label: "Administradores" }
      );
    }

    return baseItems;
  }, [isAdmin, isAuthenticated]);

  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <div className="mobile-topbar-head">
          <strong>JOVIAT</strong>
          <div className="mobile-actions">
            <button
              className="icon-btn"
              onClick={() => {
                onProfile();
                setOpen(false);
              }}
              aria-label="Perfil"
            >
              👤
            </button>
            <button className="icon-btn" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">☰</button>
          </div>
        </div>

        {open && (
          <div className="mobile-menu-dropdown mobile-menu-shell">
            {items.map((item) => (
              <button
                key={item.key}
                className={section === item.key ? "active" : ""}
                onClick={() => {
                  onNavigate(item.key);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && (
              <button
                className="danger-logout-btn"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        )}
      </header>
    );
  }

  return (
    <aside className="sidebar sidebar-shell">
      <div>
        <div className="sidebar-head">
          <h1>JOVIAT</h1>
          <button className="icon-btn" onClick={onProfile} aria-label="Perfil">👤</button>
        </div>
        <nav>
          {items.map((item) => (
            <button key={item.key} onClick={() => onNavigate(item.key)} className={section === item.key ? "active" : ""}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {isAuthenticated && (
        <div className="sidebar-footer">
          <button className="danger-logout-btn" onClick={onLogout}>
            Salir del usuario
          </button>
        </div>
      )}
    </aside>
  );
}
