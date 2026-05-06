import { useState, useRef } from "react";
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

  /* Ref del input de búsqueda — el widget nativo de Google Autocomplete
   * se adjunta directamente a este elemento del DOM */
  const searchInputRef = useRef(null);

  /* Hook de autocompletado con el widget nativo de Google Places.
   * Cuando el usuario selecciona un lugar del dropdown de Google,
   * se llama al callback y rellenamos los campos del formulario. */
  const { ready, apiError } = usePlacesAutocomplete(searchInputRef, (placeData) => {
    setForm((current) => ({
      ...current,
      name:    placeData.name    || current.name,
      address: placeData.address || current.address,
      phone:   placeData.phone   || current.phone,
      lat:     placeData.lat     || current.lat,
      lng:     placeData.lng     || current.lng
    }));
  });

  return (
    <section className="panel">
      <h2>{t(lang, "cr_title")}</h2>
      <p className="section-helper-text">{t(lang, "cr_helper")}</p>

      {/* ── Buscador de Google Places (widget nativo) ────────────────────────── */}
      <div className="places-search-wrap">
        <div className="places-search-field">
          {/* Icono de búsqueda */}
          <span className="places-search-icon" aria-hidden="true">🔍</span>

          {/*
           * Input NO controlado por React: el widget de Google gestiona
           * su valor internamente y muestra su propio dropdown.
           * Cuando el usuario elige un lugar, nuestro callback
           * onPlaceSelected rellena el formulario de abajo.
           */}
          <input
            ref={searchInputRef}
            type="text"
            className="places-search-input"
            placeholder={
              apiError
                ? `⚠ ${apiError}`
                : ready
                ? t(lang, "cr_search_ready")
                : t(lang, "cr_search_loading")
            }
            disabled={!ready}
            autoComplete="off"
          />
        </div>

        {/* Texto de ayuda bajo el buscador */}
        <p className="places-search-hint">{t(lang, "cr_search_hint")}</p>
      </div>

      {/* ── Formulario manual (los campos se rellenan solos al elegir un lugar) ─ */}
      <form
        className="auth-form clean-auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateRestaurant(form);
          setForm(EMPTY_FORM);
          /* Limpiar el input del buscador al enviar */
          if (searchInputRef.current) searchInputRef.current.value = "";
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
