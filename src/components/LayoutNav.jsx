import React from "react";

export default function LayoutNav({ isMobile, section, onNavigate }) {
  const items = [
    { key: "inicio", label: "Inicio" },
    { key: "alumnos", label: "Alumnos" },
    { key: "restaurantes", label: "Restaurantes" },
    { key: "auth", label: "Login / Registro" }
  ];

  if (isMobile) {
    return (
      <header className="mobile-topbar">
        <strong>JOVIAT</strong>
        <div className="mobile-nav-row">
          {items.map((item) => (
            <button key={item.key} className={section === item.key ? "active" : ""} onClick={() => onNavigate(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </header>
    );
  }

  return (
    <aside className="sidebar">
      <h1>JOVIAT</h1>
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
