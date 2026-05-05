import React, { useState } from "react";
import { getRestaurantPhoto } from "../utils/ui";
import { t } from "../utils/translations";

export default function ProfilePage({
  profile,
  isAuthenticated,
  isAdmin,
  sessionIsStudent,
  onGoToAuth,
  sessionStudent,
  onUpdateProfile,
  /* Nuevas props para gestión de experiencias laborales (solo alumnos) */
  allRestaurants = [],
  studentJobs = [],
  onAddRelation,
  onRequestRestaurant,
  lang = "es"
}) {
  /* ── Estado del modal de edición de perfil ────────────────────────────────── */
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: "",
    Phone: "",
    Curso: "",
    LinkedIn: "",
    PhotoURL: ""
  });
  const [saved, setSaved] = useState(false);

  /* ── Estado del modal de añadir experiencia laboral ──────────────────────── */
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ restaurantId: "", role: "", currentJob: false });
  const [jobSaved, setJobSaved] = useState(false);

  /* ── Estado del modal de solicitar restaurante ───────────────────────────── */
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestDesc, setRequestDesc] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  /* Un alumno puede editar su perfil y gestionar sus experiencias */
  const canEdit = isAuthenticated && (isAdmin || sessionStudent || sessionIsStudent);
  /* Solo alumnos (no admins) pueden añadir restaurantes a su perfil */
  const canManageJobs = isAuthenticated && sessionIsStudent && !isAdmin && onAddRelation;

  /* ── Handlers de edición de perfil ──────────────────────────────────────── */

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

  /* ── Handlers de experiencia laboral ─────────────────────────────────────── */

  /* Abre el modal de añadir restaurante reiniciando el formulario */
  function handleOpenAddJob() {
    setJobForm({ restaurantId: allRestaurants[0]?.id || "", role: "", currentJob: false });
    setJobSaved(false);
    setAddJobOpen(true);
  }

  /* Guarda la nueva relación alumno-restaurante */
  function handleSaveJob(event) {
    event.preventDefault();
    if (!jobForm.restaurantId) return;
    onAddRelation(jobForm.restaurantId, jobForm.role.trim(), jobForm.currentJob);
    setJobSaved(true);
    setAddJobOpen(false);
  }

  /* ── Handlers de solicitud de restaurante ────────────────────────────────── */

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

  /* ── Pantalla sin sesión ─────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <section className="panel">
        <div className="profile-logo">JOVIAT</div>
        <h2>{t(lang, "prof_title")}</h2>
        <p>{t(lang, "prof_not_auth")}</p>
        <button type="button" className="primary-btn" onClick={onGoToAuth}>
          {t(lang, "prof_go_auth")}
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="profile-logo">JOVIAT</div>

      {/* ── Cabecera con botón de edición ──────────────────────────────────── */}
      <div className="profile-header-row">
        <h2>{t(lang, "prof_title")}</h2>
        {canEdit && (
          <button className="small-btn" onClick={handleOpenEdit}>
            ✏️ {t(lang, "prof_edit_btn")}
          </button>
        )}
      </div>

      {/* Confirmación de guardado */}
      {saved && <p className="info-box">{t(lang, "prof_saved")}</p>}
      {jobSaved && <p className="info-box">{t(lang, "prof_job_saved")}</p>}
      {requestSent && <p className="info-box">{t(lang, "prof_req_sent")}</p>}

      {/* ── Tarjeta de datos del perfil ───────────────────────────────────── */}
      <div className="profile-card">
        <img src={profile.photo} alt={profile.name} />
        <div>
          <p><strong>{t(lang, "prof_field_name")}:</strong> {profile.name}</p>
          <p><strong>{t(lang, "field_email")}:</strong> {profile.email}</p>
          <p><strong>{t(lang, "prof_field_status")}:</strong> {profile.role}</p>
          {!isAdmin && (
            <>
              <p><strong>{t(lang, "field_curso")}:</strong> {profile.curso}</p>
              <p><strong>{t(lang, "field_phone")}:</strong> {profile.phone}</p>
            </>
          )}
          {profile.linkedIn && (
            <p><strong>LinkedIn:</strong> {profile.linkedIn}</p>
          )}
        </div>
      </div>

      {/* ── Sección de experiencias laborales (solo alumnos) ──────────────── */}
      {canManageJobs && (
        <div className="profile-jobs-section">
          <div className="profile-section-header">
            <h3>🍽️ {t(lang, "prof_jobs_title")}</h3>
            <button className="small-btn accent-btn" onClick={handleOpenAddJob}>
              {t(lang, "prof_add_rest_btn")}
            </button>
          </div>

          {/* Lista de restaurantes donde trabaja/trabajó el alumno */}
          {studentJobs.length === 0 ? (
            <p className="state-text profile-jobs-empty">
              {t(lang, "prof_jobs_empty")}
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
                        <span className="badge badge-dark">{t(lang, "role_label")}: {job.role}</span>
                      )}
                      <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                        {job.currentJob ? t(lang, "working_now") : t(lang, "worked_before")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para solicitar que el administrador añada un restaurante */}
          <div className="profile-request-hint">
            <span>{t(lang, "prof_not_found_q")}</span>
            <button className="link-btn" onClick={handleOpenRequest}>
              {t(lang, "prof_request_link")}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: editar perfil ───────────────────────────────────────────── */}
      {editOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">
              {isAdmin ? t(lang, "prof_edit_admin_title") : t(lang, "prof_edit_my_title")}
            </h3>
            <form className="auth-form clean-auth-form" onSubmit={handleSave}>

              <label className="auth-field">
                <span>{t(lang, "edit_name")}</span>
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
                      <span>{t(lang, "field_phone")}</span>
                      <input
                        value={editForm.Phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, Phone: e.target.value }))}
                      />
                    </label>
                    <label className="auth-field">
                      <span>{t(lang, "field_curso")}</span>
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
                <span>{t(lang, "field_photo_url")} <small className="optional-label">({t(lang, "cs_optional")})</small></span>
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
                <button type="submit" className="primary-btn">{t(lang, "edit_save")}</button>
                <button type="button" className="small-btn" onClick={() => setEditOpen(false)}>
                  {t(lang, "edit_cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: añadir restaurante al perfil ────────────────────────────── */}
      {addJobOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">{t(lang, "prof_add_job_title")}</h3>

            {allRestaurants.length === 0 ? (
              <>
                <p className="modal-text">{t(lang, "prof_no_rests")}</p>
                <div className="modal-actions">
                  <button className="small-btn" onClick={() => setAddJobOpen(false)}>{t(lang, "prof_close")}</button>
                  <button className="link-btn" onClick={() => { setAddJobOpen(false); handleOpenRequest(); }}>
                    {t(lang, "prof_request_add")}
                  </button>
                </div>
              </>
            ) : (
              <form className="auth-form clean-auth-form" onSubmit={handleSaveJob}>

                {/* Selector de restaurante */}
                <label className="auth-field">
                  <span>{t(lang, "field_restaurant")} <strong>*</strong></span>
                  <select
                    value={jobForm.restaurantId}
                    onChange={(e) => setJobForm((f) => ({ ...f, restaurantId: e.target.value }))}
                    required
                  >
                    <option value="">{t(lang, "prof_select_rest")}</option>
                    {allRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.Name}</option>
                    ))}
                  </select>
                </label>

                {/* Cargo / rol */}
                <label className="auth-field">
                  <span>{t(lang, "prof_role_lbl")} <small className="optional-label">({t(lang, "cs_optional")})</small></span>
                  <input
                    placeholder={t(lang, "prof_role_placeholder")}
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
                  <span>{t(lang, "prof_working_here")}</span>
                </label>

                <div className="modal-actions">
                  <button type="submit" className="primary-btn" disabled={!jobForm.restaurantId}>
                    {t(lang, "prof_add_job_btn")}
                  </button>
                  <button type="button" className="small-btn" onClick={() => setAddJobOpen(false)}>
                    {t(lang, "edit_cancel")}
                  </button>
                </div>

                {/* Enlace para solicitar un restaurante que no está en la lista */}
                <p className="modal-hint-text">
                  {t(lang, "prof_not_see")}{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setAddJobOpen(false); handleOpenRequest(); }}
                  >
                    {t(lang, "prof_request_add")}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: solicitar alta de restaurante ───────────────────────────── */}
      {requestOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">{t(lang, "prof_request_title")}</h3>
            <p className="modal-text">{t(lang, "prof_request_body")}</p>
            <form className="auth-form clean-auth-form" onSubmit={handleSendRequest}>

              <label className="auth-field">
                <span>{t(lang, "prof_request_desc_lbl")} <strong>*</strong></span>
                <textarea
                  className="request-textarea"
                  rows={5}
                  placeholder={t(lang, "prof_request_placeholder")}
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={!requestDesc.trim()}>
                  {t(lang, "prof_send_request")}
                </button>
                <button type="button" className="small-btn" onClick={() => setRequestOpen(false)}>
                  {t(lang, "edit_cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
