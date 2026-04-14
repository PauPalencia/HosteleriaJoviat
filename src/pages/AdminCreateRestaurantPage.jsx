import React, { useRef, useState } from "react";
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete";

// Valores vacíos del formulario de creación de restaurante
const EMPTY_FORM = {
  name: "",
  address: "",
  email: "",
  phone: "",
  photoUrl: "",
  lat: "",
  lng: ""
};

export default function AdminCreateRestaurantPage({ onCreateRestaurant, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Ref del input de búsqueda de Google Places
  const searchInputRef = useRef(null);

  // Cuando el usuario selecciona un lugar en el autocompletado de Google Places,
  // rellenamos automáticamente los campos del formulario con la información del lugar
  usePlacesAutocomplete(searchInputRef, (placeData) => {
    setForm((current) => ({
      ...current,
      name: placeData.name || current.name,
      address: placeData.address || current.address,
      phone: placeData.phone || current.phone,
      lat: placeData.lat || current.lat,
      lng: placeData.lng || current.lng
    }));
  });

  return (
    <section className="panel">
      <h2>Crear restaurantes</h2>
      <p className="section-helper-text">
        Añade nuevos restaurantes. Usa el buscador de Google para autocompletar la información.
      </p>

      {/* ── Buscador de Google Places ───────────────────────────────────────── */}
      <div className="places-search-wrap">
        <label className="auth-field">
          <span>🔍 Buscar restaurante en Google Maps</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Escribe el nombre del restaurante para buscarlo..."
            className="places-search-input"
          />
        </label>
        <p className="section-helper-text places-search-hint">
          Al seleccionar un resultado, se rellenarán automáticamente nombre, dirección, teléfono y coordenadas.
          Puedes editar cualquier campo manualmente después.
        </p>
      </div>

      {/* ── Formulario manual (editable) ────────────────────────────────────── */}
      <form
        className="auth-form clean-auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateRestaurant(form);
          setForm(EMPTY_FORM);
        }}
      >
        <label className="auth-field">
          <span>Nombre <strong>*</strong></span>
          <input value={form.name} onChange={(event) => updateField(setForm, "name", event.target.value)} required />
        </label>

        <label className="auth-field">
          <span>Dirección <strong>*</strong></span>
          <input value={form.address} onChange={(event) => updateField(setForm, "address", event.target.value)} required />
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Email <small className="optional-label">(opcional)</small></span>
            <input type="email" value={form.email} onChange={(event) => updateField(setForm, "email", event.target.value)} />
          </label>
          <label className="auth-field">
            <span>Teléfono <small className="optional-label">(opcional)</small></span>
            <input value={form.phone} onChange={(event) => updateField(setForm, "phone", event.target.value)} />
          </label>
        </div>

        {/* Campo para la URL de la foto del restaurante */}
        <label className="auth-field">
          <span>URL de foto del restaurante <small className="optional-label">(opcional)</small></span>
          <input
            type="url"
            placeholder="https://ejemplo.com/foto-restaurante.jpg"
            value={form.photoUrl}
            onChange={(event) => updateField(setForm, "photoUrl", event.target.value)}
          />
        </label>

        {/* Previsualización de la foto si hay URL */}
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
            <span>Latitud <small className="optional-label">(autocompletado)</small></span>
            <input
              value={form.lat}
              onChange={(event) => updateField(setForm, "lat", event.target.value)}
              placeholder="41.733"
            />
          </label>
          <label className="auth-field">
            <span>Longitud <small className="optional-label">(autocompletado)</small></span>
            <input
              value={form.lng}
              onChange={(event) => updateField(setForm, "lng", event.target.value)}
              placeholder="1.826"
            />
          </label>
        </div>

        <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear restaurante"}
        </button>
      </form>
    </section>
  );
}

// Actualiza un campo del formulario por clave
function updateField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
