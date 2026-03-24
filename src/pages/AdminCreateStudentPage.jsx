import React, { useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  curso: "",
  linkedIn: "",
  password: "",
  restaurantId: "",
  workRole: "",
  currentJob: true
};

export default function AdminCreateStudentPage({ restaurants, onCreateStudent, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const sortedRestaurants = useMemo(
    () => [...restaurants].sort((left, right) => String(left.Name || "").localeCompare(String(right.Name || ""))),
    [restaurants]
  );

  return (
    <section className="panel">
      <h2>Crear alumnos validados</h2>
      <p className="section-helper-text">
        Crea un alumno ya validado y, si quieres, asígnale desde el inicio su relación con un restaurante.
      </p>

      <form
        className="auth-form clean-auth-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await onCreateStudent({
            Name: form.name,
            Email: form.email.trim().toLowerCase(),
            Phone: form.phone,
            Curso: form.curso,
            LinkedIn: form.linkedIn,
            Password: form.password,
            restaurantId: form.restaurantId,
            workRole: form.workRole,
            currentJob: form.currentJob
          });
          setForm(EMPTY_FORM);
        }}
      >
        <label className="auth-field">
          <span>Nombre completo</span>
          <input value={form.name} onChange={(event) => updateField(setForm, "name", event.target.value)} required />
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Correo</span>
            <input type="email" value={form.email} onChange={(event) => updateField(setForm, "email", event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Teléfono</span>
            <input value={form.phone} onChange={(event) => updateField(setForm, "phone", event.target.value)} required />
          </label>
        </div>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Curso</span>
            <input value={form.curso} onChange={(event) => updateField(setForm, "curso", event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Contraseña inicial</span>
            <input type="password" value={form.password} onChange={(event) => updateField(setForm, "password", event.target.value)} required />
          </label>
        </div>

        <label className="auth-field">
          <span>LinkedIn</span>
          <input value={form.linkedIn} onChange={(event) => updateField(setForm, "linkedIn", event.target.value)} />
        </label>

        <h3 className="admin-subtitle">Asignación opcional a restaurante</h3>

        <label className="auth-field">
          <span>Restaurante</span>
          <select value={form.restaurantId} onChange={(event) => updateField(setForm, "restaurantId", event.target.value)}>
            <option value="">Sin asignar todavía</option>
            {sortedRestaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.Name}</option>
            ))}
          </select>
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Cargo</span>
            <input value={form.workRole} onChange={(event) => updateField(setForm, "workRole", event.target.value)} placeholder="Chef, sala, prácticas..." />
          </label>
          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              checked={form.currentJob}
              onChange={(event) => updateField(setForm, "currentJob", event.target.checked)}
            />
            <span>Está trabajando actualmente ahí</span>
          </label>
        </div>

        <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear alumno validado"}
        </button>
      </form>
    </section>
  );
}

function updateField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
