import React, { useEffect, useRef, useState } from "react";
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete";
import { t } from "../utils/translations";

/* Valores vacíos del formulario */
const EMPTY_FORM = {
  name: "",
  address: "",
  email: "",
  phone: "",
  photoUrl: "",
  lat: "",
  lng: ""
};

export default function AdminCreateRestaurantPage({ onCreateRestaurant, isSubmitting, lang = "es" }) {
  const [form, setForm] = useState(EMPTY_FORM);

  /* Ref del contenedor del buscador (para detectar clics fuera y cerrar el dropdown) */
  const searchWrapRef = useRef(null);

  /* Hook de autocompletado: devuelve predicciones y funciones para interactuar */
  const {
    query,
    predictions,
    loading,
    ready,
    handleSearch,
    selectPrediction,
    clearPredictions
  } = usePlacesAutocomplete((placeData) => {
    /* Cuando el usuario selecciona un lugar, rellenar los campos del formulario */
    setForm((current) => ({
      ...current,
      name:    placeData.name    || current.name,
      address: placeData.address || current.address,
      phone:   placeData.phone   || current.phone,
      lat:     placeData.lat     || current.lat,
      lng:     placeData.lng     || current.lng
    }));
  });

  /* Cerrar el dropdown si el usuario hace clic fuera del buscador */
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        clearPredictions();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearPredictions]);

  return (
    <section className="panel">
      <h2>{t(lang, "cr_title")}</h2>
      <p className="section-helper-text">{t(lang, "cr_helper")}</p>

      {/* ── Buscador de Google Places con dropdown personalizado ─────────────── */}
      <div className="places-search-wrap" ref={searchWrapRef}>
        <div className="places-search-field">
          {/* Icono de búsqueda */}
          <span className="places-search-icon" aria-hidden="true">🔍</span>

          <input
            type="text"
            className="places-search-input"
            placeholder={ready ? t(lang, "cr_search_ready") : t(lang, "cr_search_loading")}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={!ready}
            autoComplete="off"
          />

          {/* Spinner mientras hay petición en vuelo */}
          {loading && <span className="places-search-spinner" aria-label="Buscando..." />}

          {/* Botón para limpiar la búsqueda */}
          {query && (
            <button
              type="button"
              className="places-clear-btn"
              onClick={() => { handleSearch(""); }}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Texto de ayuda bajo el buscador */}
        <p className="places-search-hint">{t(lang, "cr_search_hint")}</p>

        {/* Dropdown de predicciones */}
        {predictions.length > 0 && (
          <ul className="places-dropdown" role="listbox">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                className="places-dropdown-item"
                role="option"
                aria-selected={false}
                /* onMouseDown en vez de onClick para que se ejecute antes de onBlur */
                onMouseDown={() => selectPrediction(prediction)}
              >
                {/* Nombre principal del lugar */}
                <span className="places-item-name">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </span>
                {/* Dirección secundaria */}
                {prediction.structured_formatting?.secondary_text && (
                  <span className="places-item-address">
                    {prediction.structured_formatting.secondary_text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Formulario manual (editable) ─────────────────────────────────────── */}
      <form
        className="auth-form clean-auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateRestaurant(form);
          setForm(EMPTY_FORM);
        }}
      >
        <label className="auth-field">
          <span>{t(lang, "field_name")} <strong>*</strong></span>
          <input
            value={form.name}
            onChange={(e) => updateField(setForm, "name", e.target.value)}
            required
          />
        </label>

        <label className="auth-field">
          <span>{t(lang, "field_address")} <strong>*</strong></span>
          <input
            value={form.address}
            onChange={(e) => updateField(setForm, "address", e.target.value)}
            required
          />
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>{t(lang, "field_email")} <small className="optional-label">({t(lang, "cs_optional")})</small></span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField(setForm, "email", e.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>{t(lang, "field_phone")} <small className="optional-label">({t(lang, "cs_optional")})</small></span>
            <input
              value={form.phone}
              onChange={(e) => updateField(setForm, "phone", e.target.value)}
            />
          </label>
        </div>

        {/* URL de la foto del restaurante con previsualización */}
        <label className="auth-field">
          <span>{t(lang, "field_photo_rest")} <small className="optional-label">({t(lang, "cs_optional")})</small></span>
          <input
            type="url"
            placeholder="https://ejemplo.com/foto-restaurante.jpg"
            value={form.photoUrl}
            onChange={(e) => updateField(setForm, "photoUrl", e.target.value)}
          />
        </label>

        {form.photoUrl && (
          <div className="photo-preview-wrap">
            <img
              src={form.photoUrl}
              alt="Previsualización"
              className="photo-preview-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        {/* Coordenadas (se rellenan automáticamente desde Google Places) */}
        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>{t(lang, "field_lat")} <strong>*</strong></span>
            <input
              value={form.lat}
              onChange={(e) => updateField(setForm, "lat", e.target.value)}
              placeholder="41.733"
            />
          </label>
          <label className="auth-field">
            <span>{t(lang, "field_lng")} <strong>*</strong></span>
            <input
              value={form.lng}
              onChange={(e) => updateField(setForm, "lng", e.target.value)}
              placeholder="1.826"
            />
          </label>
        </div>

        <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? t(lang, "cr_submitting") : t(lang, "cr_submit")}
        </button>
      </form>
    </section>
  );
}

/* Actualiza un campo del formulario por clave */
function updateField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
