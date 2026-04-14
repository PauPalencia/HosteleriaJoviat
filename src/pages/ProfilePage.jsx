import React, { useState } from "react";

export default function ProfilePage({ profile, isAuthenticated, onGoToAuth, sessionStudent, onUpdateProfile }) {
  // Controla si se muestra el formulario de edición
  const [editOpen, setEditOpen] = useState(false);
  // Datos del formulario de edición (se inicializan al abrir)
  const [editForm, setEditForm] = useState({
    Name: "",
    Phone: "",
    Curso: "",
    LinkedIn: "",
    PhotoURL: ""
  });
  // Feedback tras guardar
  const [saved, setSaved] = useState(false);

  // Solo los alumnos con cuenta pueden editar su perfil
  const canEdit = isAuthenticated && sessionStudent;

  // Abre el formulario de edición con los datos actuales
  function handleOpenEdit() {
    setEditForm({
      Name: sessionStudent?.Name || profile.name || "",
      Phone: sessionStudent?.Phone || profile.phone || "",
      Curso: sessionStudent?.Curso || profile.curso || "",
      LinkedIn: sessionStudent?.LinkedIn || profile.linkedIn || "",
      PhotoURL: sessionStudent?.PhotoURL || ""
    });
    setSaved(false);
    setEditOpen(true);
  }

  // Guarda los cambios y cierra el formulario
  function handleSave(event) {
    event.preventDefault();
    onUpdateProfile({
      Name: editForm.Name.trim() || sessionStudent.Name,
      Phone: editForm.Phone.trim(),
      Curso: editForm.Curso.trim(),
      LinkedIn: editForm.LinkedIn.trim(),
      PhotoURL: editForm.PhotoURL.trim()
    });
    setSaved(true);
    setEditOpen(false);
  }

  // Pantalla para usuarios sin sesión
  if (!isAuthenticated) {
    return (
      <section className="panel">
        <div className="profile-logo">JOVIAT</div>
        <h2>Perfil</h2>
        <p>Necesitas iniciar sesión para ver datos personales.</p>
        <button type="button" className="primary-btn" onClick={onGoToAuth}>
          Ir a login / registro
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="profile-logo">JOVIAT</div>

      {/* Cabecera del perfil con botón de edición */}
      <div className="profile-header-row">
        <h2>Mi perfil</h2>
        {canEdit && (
          <button className="small-btn" onClick={handleOpenEdit}>
            ✏️ Editar mi ficha
          </button>
        )}
      </div>

      {/* Mensaje de confirmación tras guardar */}
      {saved && (
        <p className="info-box">Perfil actualizado correctamente.</p>
      )}

      {/* Tarjeta con los datos del perfil */}
      <div className="profile-card">
        <img src={profile.photo} alt={profile.name} />
        <div>
          <p><strong>Nombre:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Estado:</strong> {profile.role}</p>
          <p><strong>Curso:</strong> {profile.curso}</p>
          <p><strong>Teléfono:</strong> {profile.phone}</p>
          {profile.linkedIn && (
            <p><strong>LinkedIn:</strong> {profile.linkedIn}</p>
          )}
        </div>
      </div>

      {/* ── Modal de edición de perfil propio ─────────────────────────────── */}
      {editOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">Editar mi ficha</h3>
            <form className="auth-form clean-auth-form" onSubmit={handleSave}>

              <label className="auth-field">
                <span>Nombre completo</span>
                <input
                  value={editForm.Name}
                  onChange={(e) => setEditForm((f) => ({ ...f, Name: e.target.value }))}
                />
              </label>

              <div className="auth-form-grid compact-grid">
                <label className="auth-field">
                  <span>Teléfono</span>
                  <input
                    value={editForm.Phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, Phone: e.target.value }))}
                  />
                </label>
                <label className="auth-field">
                  <span>Curso</span>
                  <input
                    value={editForm.Curso}
                    onChange={(e) => setEditForm((f) => ({ ...f, Curso: e.target.value }))}
                  />
                </label>
              </div>

              <label className="auth-field">
                <span>LinkedIn</span>
                <input
                  value={editForm.LinkedIn}
                  onChange={(e) => setEditForm((f) => ({ ...f, LinkedIn: e.target.value }))}
                />
              </label>

              <label className="auth-field">
                <span>URL de foto de perfil</span>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={editForm.PhotoURL}
                  onChange={(e) => setEditForm((f) => ({ ...f, PhotoURL: e.target.value }))}
                />
              </label>

              {/* Previsualización de la nueva foto */}
              {editForm.PhotoURL && (
                <div className="photo-preview-wrap">
                  <img
                    src={editForm.PhotoURL}
                    alt="Previsualización"
                    className="photo-preview-img"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="primary-btn">Guardar cambios</button>
                <button type="button" className="small-btn" onClick={() => setEditOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
