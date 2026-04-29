import React from "react";
import { t } from "../utils/translations";

// Imagen de fondo: interior elegante de restaurante (Unsplash, libre de uso)
const BG_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80";

export default function InicioPage({ onNavigate, lang = "es" }) {
  return (
    <div className="home-hero" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
      {/* Capa oscura semitransparente sobre la imagen */}
      <div className="home-overlay" />

      {/* Contenido centrado del hero */}
      <div className="home-content">
        {/* Logo / marca */}
        <div className="home-brand">JOVIAT</div>

        {/* Título principal */}
        <h1 className="home-title">{t(lang, "home_heading")}</h1>

        {/* Subtítulo descriptivo */}
        <p className="home-sub">{t(lang, "home_sub")}</p>
        <p className="home-desc">{t(lang, "home_desc")}</p>

        {/* Botones de llamada a la acción */}
        <div className="home-cta-row">
          <button
            className="home-cta-btn home-cta-primary"
            onClick={() => onNavigate("alumnos")}
          >
            {t(lang, "home_cta_alumnos")}
          </button>
          <button
            className="home-cta-btn home-cta-secondary"
            onClick={() => onNavigate("restaurantes")}
          >
            {t(lang, "home_cta_restaurantes")}
          </button>
        </div>
      </div>
    </div>
  );
}
