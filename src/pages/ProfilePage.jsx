import React, { useState } from "react";
import { getRestaurantPhoto } from "../utils/ui";

export default function ProfilePage({
  profile,
  isAuthenticated,
  isAdmin,
  sessionIsStudent,
  onGoToAuth,
  sessionStudent,
  onUpdateProfile,
  // Nuevas props para gestión de experiencias laborales (solo alumnos)
  allRestaurants = [],
  studentJobs = [],
  onAddRelation,
  onRequestRestaurant
}) {
  // ── Estado del modal de edición de perfil ────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: "",
    Phone: "",
    Curso: "",
    LinkedIn: "",
    PhotoURL: ""
  });
  const [saved, setSaved] = useState(false);

  // ── Estado del modal de añadir experiencia laboral ───────────────────────
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ restaurantId: "", role: "", currentJob: false });
  const [jobSaved, setJobSaved] = useState(false);

  // ── Estado del modal de solicitar restaurante ────────────────────────────
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestDesc, setRequestDesc] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Un alumno puede editar su perfil y gestionar sus experiencias
  const canEdit = isAuthenticated && (isAdmin || sessionStudent || sessionIsStudent);
  // Solo alumnos (no admins) pueden añadir restaurantes a su perfil
  const canManageJobs = isAuthenticated && sessionIsStudent && !isAdmin && onAddRelation;

  // ── Handlers de edición de perfil ───────────────────────────────────────

  function handleOpenEdit() {
    setEditForm({
      Name: sessionStudent?.Name || profile.name || "",
      Phone: sessionStudent?.Phone || profile.phone || "",
      Curso: sessionStudent?.Curso || profile.curso || "",
      LinkedIn: sessionStudent?.LinkedIn || profile.linkedIn || "",
      PhotoURL: sessionStudent?.PhotoURL || profile.photo || ""
    });
    setSaved(false);
    setEditOpen(true);
  }

  function handleSave(event) {
    event.preventDefault();
    onUpdateProfile({
      Name: editForm.Name.trim() || sessionStudent?.Name || profile.name,
      Phone: editForm.Phone.trim(),
      Curso: editForm.Curso.trim(),
      LinkedIn: editForm.LinkedIn.trim(),
      PhotoURL: editForm.PhotoURL.trim()
    });
    setSaved(true);
    setEditOpen(false);
  }

  // ── Handlers de experiencia laboral ─────────────────────────────────────

  // Abre el modal de añadir restaurante reiniciando el formulario
  function handleOpenAddJob() {
    setJobForm({ restaurantId: allRestaurants[0]?.id || "", role: "", currentJob: false });
    setJobSaved(false);
    setAddJobOpen(true);
  }

  // Guarda la nueva relación alumno-restaurante
  function handleSaveJob(event) {
    event.preventDefault();
    if (!jobForm.restaurantId) return;
    onAddRelation(jobForm.restaurantId, jobForm.role.trim(), jobForm.currentJob);
    setJobSaved(true);
    setAddJobOpen(false);
  }

  // ── Handlers de solicitud de restaurante ────────────────────────────────

  function handleOpenRequest() {
    setRequestDesc("");
    setRequestSent(false);
    setRequestOpen(true);
  }

  function handleSendRequest(event) {
    event.preventDefault();
    if (!requestDesc.trim()) return;
    onRequestRestaurant(requestDesc.trim());
    setRequestSent(true);
    setRequestOpen(false);
  }

  // ── Pantalla sin sesión ──────────────────────────────────────────────────
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

      {/* ── Cabecera con botón de edición ─────────────────────────────────── */}
      <div className="profile-header-row">
        <h2>Mi perfil</h2>
        {canEdit && (
          <button className="small-btn" onClick={handleOpenEdit}>
            ✏️ Editar mi perfil
          </button>
        )}
      </div>

      {/* Confirmación de guardado */}
      {saved && <p className="info-box">Perfil actualizado correctamente.</p>}
      {jobSaved && <p className="info-box">Restaurante añadido a tu perfil.</p>}
      {requestSent && <p className="info-box">Solicitud enviada al administrador.</p>}

      {/* ── Tarjeta de datos del perfil ───────────────────────────────────── */}
      <div className="profile-card">
        <img src={profile.photo} alt={profile.name} />
        <div>
          <p><strong>Nombre:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Estado:</strong> {profile.role}</p>
          {!isAdmin && (
            <>
              <p><strong>Curso:</strong> {profile.curso}</p>
              <p><strong>Teléfono:</strong> {profile.phone}</p>
            </>
          )}
          {profile.linkedIn && (
            <p><strong>LinkedIn:</strong> {profile.linkedIn}</p>
          )}
        </div>
      </div>

      {/* ── Sección de experiencias laborales (solo alumnos) ─────────────── */}
      {canManageJobs && (
        <div className="profile-jobs-section">
          <div className="profile-section-header">
            <h3>🍽️ Mis experiencias laborales</h3>
            <button className="small-btn accent-btn" onClick={handleOpenAddJob}>
              + Añadir restaurante
            </button>
          </div>

          {/* Lista de restaurantes donde trabaja/trabajó el alumno */}
          {studentJobs.length === 0 ? (
            <p className="state-text profile-jobs-empty">
              Todavía no tienes restaurantes añadidos a tu perfil.
            </p>
          ) : (
            <div className="profile-jobs-list">
              {studentJobs.map((job, index) => (
                <div key={index} className="profile-job-card">
                  <img
                    className="profile-job-thumb"
                    src={getRestaurantPhoto(job.restaurant)}
                    alt={job.restaurant?.Name || "Restaurante"}
                  />
                  <div className="profile-job-info">
                    <strong>{job.restaurant?.Name || "Restaurante no encontrado"}</strong>
                    <p className="profile-job-detail">{job.restaurant?.Address || ""}</p>
                    <div className="badge-row">
                      {job.role && (
                        <span className="badge badge-dark">Cargo: {job.role}</span>
                      )}
                      <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                        {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para solicitar que el administrador añada un restaurante */}
          <div className="profile-request-hint">
            <span>¿No encuentras tu restaurante en la lista?</span>
            <button className="link-btn" onClick={handleOpenRequest}>
              Solicita que lo añadan →
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: editar perfil ──────────────────────────────────────────── */}
      {editOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">
              {isAdmin ? "Editar perfil de administrador" : "Editar mi ficha"}
            </h3>
            <form className="auth-form clean-auth-form" onSubmit={handleSave}>

              <label className="auth-field">
                <span>Nombre completo</span>
                <input
                  value={editForm.Name}
                  onChange={(e) => setEditForm((f) => ({ ...f, Name: e.target.value }))}
                />
              </label>

              {/* Campos exclusivos de alumno */}
              {!isAdmin && (
                <>
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
                </>
              )}

              <label className="auth-field">
                <span>URL de foto de perfil <small className="optional-label">(opcional)</small></span>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={editForm.PhotoURL}
                  onChange={(e) => setEditForm((f) => ({ ...f, PhotoURL: e.target.value }))}
                />
              </label>

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
                <button type="button" className="small-btn" onClick={() => setEditOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: añadir restaurante al perfil ───────────────────────────── */}
      {addJobOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">Añadir experiencia laboral</h3>

            {allRestaurants.length === 0 ? (
              <>
                <p className="modal-text">No hay restaurantes disponibles en la base de datos.</p>
                <div className="modal-actions">
                  <button className="small-btn" onClick={() => setAddJobOpen(false)}>Cerrar</button>
                  <button className="link-btn" onClick={() => { setAddJobOpen(false); handleOpenRequest(); }}>
                    Solicitar añadir un restaurante →
                  </button>
                </div>
              </>
            ) : (
              <form className="auth-form clean-auth-form" onSubmit={handleSaveJob}>

                {/* Selector de restaurante */}
                <label className="auth-field">
                  <span>Restaurante <strong>*</strong></span>
                  <select
                    value={jobForm.restaurantId}
                    onChange={(e) => setJobForm((f) => ({ ...f, restaurantId: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona un restaurante...</option>
                    {allRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.Name}</option>
                    ))}
                  </select>
                </label>

                {/* Cargo / rol */}
                <label className="auth-field">
                  <span>Cargo / Rol <small className="optional-label">(opcional)</small></span>
                  <input
                    placeholder="ej. Cocinero, Camarero, Jefe de sala..."
                    value={jobForm.role}
                    onChange={(e) => setJobForm((f) => ({ ...f, role: e.target.value }))}
                  />
                </label>

                {/* ¿Trabajando actualmente? */}
                <label className="auth-field auth-field-checkbox">
                  <input
                    type="checkbox"
                    checked={jobForm.currentJob}
                    onChange={(e) => setJobForm((f) => ({ ...f, currentJob: e.target.checked }))}
                  />
                  <span>Estoy trabajando aquí actualmente</span>
                </label>

                <div className="modal-actions">
                  <button type="submit" className="primary-btn" disabled={!jobForm.restaurantId}>
                    Añadir experiencia
                  </button>
                  <button type="button" className="small-btn" onClick={() => setAddJobOpen(false)}>
                    Cancelar
                  </button>
                </div>

                {/* Enlace para solicitar un restaurante que no está en la lista */}
                <p className="modal-hint-text">
                  ¿No ves tu restaurante?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setAddJobOpen(false); handleOpenRequest(); }}
                  >
                    Solicita que lo añadan →
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: solicitar alta de restaurante ──────────────────────────── */}
      {requestOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">Solicitar añadir un restaurante</h3>
            <p className="modal-text">
              Describe el restaurante donde trabajas o has trabajado. Un administrador revisará tu solicitud
              y, si todo está correcto, lo añadirá a la plataforma.
            </p>
            <form className="auth-form clean-auth-form" onSubmit={handleSendRequest}>

              <label className="auth-field">
                <span>Descripción del restaurante <strong>*</strong></span>
                <textarea
                  className="request-textarea"
                  rows={5}
                  placeholder="Nombre del restaurante, dirección, teléfono, tu cargo, etc."
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={!requestDesc.trim()}>
                  Enviar solicitud
                </button>
                <button type="button" className="small-btn" onClick={() => setRequestOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
