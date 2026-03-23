import React, { useMemo, useState } from "react";

export default function LayoutNav({
  isMobile,
  section,
  onNavigate,
  onProfile,
  isAuthenticated,
  isAdmin,
  onLogout
}) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const baseItems = [
      { key: "inicio", label: "Inicio" },
      { key: "alumnos", label: "Alumnos" },
      { key: "restaurantes", label: "Restaurantes" }
    ];

    if (isAuthenticated) baseItems.push({ key: "crear", label: "Crear registros" });
    if (isAdmin) baseItems.push({ key: "admin", label: "Administración" });
    if (!isAuthenticated) baseItems.push({ key: "auth", label: "Login / Registro" });

    return baseItems;
  }, [isAuthenticated, isAdmin]);

  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <div className="mobile-topbar-head">
          <strong>JOVIAT</strong>
          <div className="mobile-actions">
            <button className="icon-btn" onClick={onProfile} aria-label="Perfil">👤</button>
            <button className="icon-btn" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">☰</button>
          </div>
        </div>

        {open && (
          <div className="mobile-menu-dropdown">
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
              <button className="danger-btn" onClick={() => {
                onLogout();
                setOpen(false);
              }}>
                LogOut
              </button>
            )}
          </div>
        )}
      </header>
    );
  }

  return (
    <aside className="sidebar">
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
        <button className="danger-btn sidebar-logout" onClick={onLogout}>
          LogOut
        </button>
      )}
    </aside>
  );
}
