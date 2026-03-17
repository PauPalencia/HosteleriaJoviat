import React, { useState } from "react";

export default function LayoutNav({ isMobile, section, onNavigate, onProfile }) {
  const [open, setOpen] = useState(false);

  const items = [
    { key: "inicio", label: "Inicio" },
    { key: "alumnos", label: "Alumnos" },
    { key: "restaurantes", label: "Restaurantes" },
    { key: "auth", label: "Login / Registro" }
  ];

  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <div className="mobile-topbar-head">
          <strong>JOVIAT</strong>
          <div className="mobile-actions">
            <button className="icon-btn" onClick={onProfile} aria-label="Perfil">👤</button>
            <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">☰</button>
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
          </div>
        )}
      </header>
    );
  }

  return (
    <aside className="sidebar">
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
    </aside>
  );
}
