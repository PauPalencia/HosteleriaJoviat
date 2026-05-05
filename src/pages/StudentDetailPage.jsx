import React, { useState } from "react";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";
import { getRoleLabel, normalizeRole, ROLE_KEYS } from "../utils/models";
import { t } from "../utils/translations";

// Formulario vacío para edición de ficha de alumno
const buildEmptyEditForm = (student) => ({
  Name: student?.Name || "",
  Phone: student?.Phone || "",
  Curso: student?.Curso || "",
  LinkedIn: student?.LinkedIn || "",
  PhotoURL: student?.PhotoURL || ""
});

export default function StudentDetailPage({
  student,
  jobs,
  onBack,
  backLabel,
  onOpenRestaurant,
  isAdmin,
  isAuthenticated,
  sessionStudentId,
  onEditStudent,
  onDeleteStudent,
  onGoToAuth,
  lang = "es"
}) {
  // Controla si el panel de edición está visible
  const [editOpen, setEditOpen] = useState(false);
  // Datos del formulario de edición
  const [editForm, setEditForm] = useState(buildEmptyEditForm(student));
  // Controla si el popup de confirmación de borrado está abierto
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // Texto que el usuario debe escribir para confirmar el borrado ("eliminar ficha")
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Abre el formulario de edición cargando los datos actuales del alumno
  function handleOpenEdit() {
    setEditForm(buildEmptyEditForm(student));
    setEditOpen(true);
  }

  // Guarda los cambios de la edición
  function handleSaveEdit(event) {
    event.preventDefault();
    onEditStudent(student.id, {
      Name: editForm.Name.trim() || student.Name,
      Phone: editForm.Phone.trim(),
      Curso: editForm.Curso.trim(),
      LinkedIn: editForm.LinkedIn.trim(),
      PhotoURL: editForm.PhotoURL.trim()
    });
    setEditOpen(false);
  }

  // Ejecuta el borrado solo si el usuario escribió "eliminar ficha" exactamente
  function handleConfirmDelete() {
    if (deleteConfirmText.trim().toLowerCase() !== "eliminar ficha") return;
    onDeleteStudent(student.id);
    setDeleteConfirmOpen(false);
    setDeleteConfirmText("");
  }

  // Determina si se pueden mostrar los controles de edición/borrado
  // El admin puede editar cualquier ficha; el alumno solo la suya propia
  const canEdit = isAdmin || sessionStudentId === student.id;

  return (
    <section className="panel">
      {/* Botón de volver con texto dinámico según el historial de navegación */}
      <div className="detail-top-bar">
        <button className="small-btn" onClick={onBack}>{backLabel || "← Volver"}</button>

        {/* Botones de administración (editar / eliminar) */}
        {canEdit && (
          <div className="detail-admin-actions">
            <button className="small-btn" onClick={handleOpenEdit}>
              ✏️ {t(lang, "detail_edit")}
            </button>
            {isAdmin && (
              <button
                className="small-btn danger-btn"
                onClick={() => { setDeleteConfirmOpen(true); setDeleteConfirmText(""); }}
              >
                🗑️ {t(lang, "detail_delete")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cabecera con foto y datos del alumno */}
      <div className="detail-header">
        <img src={getStudentPhoto(student)} alt={student.Name} />
        <div>
          <h2>{student.Name}</h2>
          <p><strong>{t(lang, "detail_status")}:</strong> {getRoleLabel(normalizeRole(student.Status || student.status, ROLE_KEYS.STUDENT))}</p>
          <p><strong>{t(lang, "detail_curso")}:</strong> {student.Curso || "-"}</p>

          {/* Información de contacto: visible solo con sesión iniciada */}
          {isAuthenticated ? (
            <>
              <p><strong>{t(lang, "detail_email")}:</strong> {student.Email || "-"}</p>
              <p><strong>{t(lang, "detail_phone")}:</strong> {student.Phone || "-"}</p>
              <p><strong>{t(lang, "detail_linkedin")}:</strong> {student.LinkedIn || "-"}</p>
            </>
          ) : (
            <div className="contact-hidden-box">
              <span className="contact-hidden-lock">🔒</span>
              <span className="contact-hidden-text">
                {t(lang, "contact_hidden")}{" "}
                {onGoToAuth && (
                  <button className="link-btn" onClick={onGoToAuth}>
                    {t(lang, "contact_hidden_link")}
                  </button>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de restaurantes donde ha trabajado el alumno */}
      <h3>{t(lang, "detail_restaurants_title")}</h3>
      <div className="student-work-list">
        {jobs.length === 0 && (
          <p className="state-text">{t(lang, "detail_no_restaurants")}</p>
        )}
        {jobs.map((job, index) => (
          <button
            key={`${student.id}-${index}`}
            className="work-preview ref-card work-preview-card"
            onClick={() => onOpenRestaurant(job.restaurant?.id || null)}
            disabled={!job.restaurant?.id}
          >
            <div className="work-preview-card-head">
              <img
                className="work-preview-thumb"
                src={getRestaurantPhoto(job.restaurant)}
                alt={job.restaurant?.Name || "Restaurante"}
              />
              <div className="work-preview-heading">
                <div className="work-header-inline">
                  <strong>{job.restaurant?.Name || "Restaurante no encontrado"}</strong>
                  <span>ID: {job.restaurant?.id || "-"}</span>
                </div>
                <div className="work-preview-info work-preview-info-column">
                  <p><strong>{t(lang, "rest_field_address")}:</strong> {job.restaurant?.Address || "-"}</p>
                  <p><strong>{t(lang, "detail_email")}:</strong> {job.restaurant?.Email || "-"}</p>
                  <p><strong>{t(lang, "detail_phone")}:</strong> {job.restaurant?.Phone || "-"}</p>
                  <div className="badge-row">
                    <span className="badge badge-dark">{t(lang, "role_label")}: {job.role || "-"}</span>
                    <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                      {job.currentJob ? t(lang, "working_now") : t(lang, "worked_before")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="work-preview-map readonly-map square-map">
              {job.restaurant?.Location ? (
                <iframe
                  title={`Mapa de ${job.restaurant?.Name || "restaurante"}`}
                  loading="lazy"
                  src={buildEmbedMapUrl(job.restaurant.Location.lat, job.restaurant.Location.lng)}
                />
              ) : (
                <div className="map-fallback">{t(lang, "no_location")}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Modal de edición de ficha ─────────────────────────────────────── */}
      {editOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <h3 className="modal-title">{t(lang, "edit_title")} {student.Name}</h3>
            <form className="auth-form clean-auth-form" onSubmit={handleSaveEdit}>

              <label className="auth-field">
                <span>{t(lang, "edit_name")}</span>
                <input
                  value={editForm.Name}
                  onChange={(e) => setEditForm((f) => ({ ...f, Name: e.target.value }))}
                />
              </label>

              <div className="auth-form-grid compact-grid">
                <label className="auth-field">
                  <span>{t(lang, "detail_phone")}</span>
                  <input
                    value={editForm.Phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, Phone: e.target.value }))}
                  />
                </label>
                <label className="auth-field">
                  <span>{t(lang, "detail_curso")}</span>
                  <input
                    value={editForm.Curso}
                    onChange={(e) => setEditForm((f) => ({ ...f, Curso: e.target.value }))}
                  />
                </label>
              </div>

              <label className="auth-field">
                <span>{t(lang, "detail_linkedin")}</span>
                <input
                  value={editForm.LinkedIn}
                  onChange={(e) => setEditForm((f) => ({ ...f, LinkedIn: e.target.value }))}
                />
              </label>

              <label className="auth-field">
                <span>{t(lang, "edit_photo_url")}</span>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={editForm.PhotoURL}
                  onChange={(e) => setEditForm((f) => ({ ...f, PhotoURL: e.target.value }))}
                />
              </label>

              {/* Previsualización de la foto si hay URL */}
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
                <button type="button" className="small-btn" onClick={() => setEditOpen(false)}>{t(lang, "edit_cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de confirmación de borrado ──────────────────────────────── */}
      {deleteConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title">{t(lang, "delete_title")}</h3>
            <p className="modal-text">{t(lang, "delete_body")}</p>
            <p className="delete-confirm-phrase">"{t(lang, "delete_phrase")}"</p>
            <input
              className="delete-confirm-input"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t(lang, "delete_phrase")}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="primary-btn danger-btn-solid"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim().toLowerCase() !== "eliminar ficha"}
              >
                {t(lang, "delete_confirm_btn")}
              </button>
              <button
                className="small-btn"
                onClick={() => { setDeleteConfirmOpen(false); setDeleteConfirmText(""); }}
              >
                {t(lang, "edit_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Genera la URL del mapa embebido de OpenStreetMap para las coordenadas dadas
function buildEmbedMapUrl(lat, lng) {
  const delta = 0.0025;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
