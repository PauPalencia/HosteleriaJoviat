import React, { useState } from "react";

const EMPTY_FORM = {
  name: "",
  address: "",
  email: "",
  phone: "",
  lat: "",
  lng: ""
};

export default function AdminCreateRestaurantPage({ onCreateRestaurant, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  return (
    <section className="panel">
      <h2>Crear restaurantes</h2>
      <p className="section-helper-text">
        Añade nuevos restaurantes para que luego puedan asignarse a alumnos y aparecer en el mapa.
      </p>

      <form
        className="auth-form clean-auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateRestaurant(form);
          setForm(EMPTY_FORM);
        }}
      >
        <label className="auth-field">
          <span>Nombre</span>
          <input value={form.name} onChange={(event) => updateField(setForm, "name", event.target.value)} required />
        </label>

        <label className="auth-field">
          <span>Dirección</span>
          <input value={form.address} onChange={(event) => updateField(setForm, "address", event.target.value)} required />
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => updateField(setForm, "email", event.target.value)} />
          </label>
          <label className="auth-field">
            <span>Teléfono</span>
            <input value={form.phone} onChange={(event) => updateField(setForm, "phone", event.target.value)} />
          </label>
        </div>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Latitud</span>
            <input value={form.lat} onChange={(event) => updateField(setForm, "lat", event.target.value)} placeholder="41.733" />
          </label>
          <label className="auth-field">
            <span>Longitud</span>
            <input value={form.lng} onChange={(event) => updateField(setForm, "lng", event.target.value)} placeholder="1.826" />
          </label>
        </div>

        <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear restaurante"}
        </button>
      </form>
    </section>
  );
}

function updateField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
