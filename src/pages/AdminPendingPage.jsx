import React, { useState } from "react";
import { getStudentPhoto } from "../utils/ui";
import { t } from "../utils/translations";

export default function AdminPendingPage({
  pendingStudents,
  restaurantRequests = [],
  onApprove,
  onRemove,
  onApproveRestaurantRequest,
  onRemoveRestaurantRequest,
  pendingActionId,
  lang = "es"
}) {
  // Pestaña activa: "students" por defecto
  const [activeTab, setActiveTab] = useState("students");

  // Pestañas con etiquetas traducidas
  const TABS = [
    { key: "students", label: t(lang, "admin_tab_students") },
    { key: "restaurants", label: t(lang, "admin_tab_restaurants") },
  ];

  return (
    <section className="panel">
      <h2>{t(lang, "admin_pending_title")}</h2>

      {/* ── Selector de pestañas ─────────────────────────────────────────── */}
      <div className="pending-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pending-tab-btn ${activeTab === tab.key ? "pending-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
            {/* Badge con el número de solicitudes pendientes */}
            {tab.key === "students" && pendingStudents.length > 0 && (
              <span className="pending-tab-badge">{pendingStudents.length}</span>
            )}
            {tab.key === "restaurants" && restaurantRequests.length > 0 && (
              <span className="pending-tab-badge">{restaurantRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pestaña: solicitudes de acceso de alumnos ────────────────────── */}
      {activeTab === "students" && (
        <div className="pending-tab-content">
          <p className="section-helper-text">
            {t(lang, "pend_student_helper")}
          </p>

          {pendingStudents.length === 0 ? (
            <p className="state-text">{t(lang, "admin_no_pending_students")}</p>
          ) : (
            <div className="spaced-list">
              {pendingStudents.map((student) => {
                const isBusy = pendingActionId === student.id;
                return (
                  <article key={student.id} className="admin-review-card">
                    <div className="admin-review-head">
                      <img src={getStudentPhoto(student)} alt={student.Name} />
                      <div>
                        <h3>{student.Name}</h3>
                        <p><strong>{t(lang, "detail_email")}:</strong> {student.Email}</p>
                        <p><strong>{t(lang, "detail_phone")}:</strong> {student.Phone || "-"}</p>
                        <p><strong>{t(lang, "detail_curso")}:</strong> {student.Curso || "-"}</p>
                      </div>
                    </div>
                    <div className="admin-review-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => onApprove(student.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? t(lang, "admin_accepting") : t(lang, "admin_accept")}
                      </button>
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => onRemove(student.id)}
                        disabled={isBusy}
                      >
                        {t(lang, "admin_remove")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Pestaña: solicitudes de alta de restaurante ──────────────────── */}
      {activeTab === "restaurants" && (
        <div className="pending-tab-content">
          <p className="section-helper-text">
            {t(lang, "pend_rest_helper")}
          </p>

          {restaurantRequests.length === 0 ? (
            <p className="state-text">{t(lang, "admin_no_pending_rests")}</p>
          ) : (
            <div className="spaced-list">
              {restaurantRequests.map((req) => (
                <article key={req.id} className="admin-review-card restaurant-request-card">
                  {/* Icono de restaurante */}
                  <div className="restaurant-request-icon">🏪</div>

                  <div className="restaurant-request-body">
                    {/* Datos del alumno que hizo la solicitud */}
                    <div className="restaurant-request-meta">
                      <span className="req-label">👤 {t(lang, "nav_alumnos")}:</span>
                      <span>{req.studentName || "—"}</span>
                    </div>
                    <div className="restaurant-request-meta">
                      <span className="req-label">✉️ {t(lang, "detail_email")}:</span>
                      <span>{req.studentEmail || "—"}</span>
                    </div>
                    <div className="restaurant-request-meta">
                      <span className="req-label">🕐 {t(lang, "lbl_date")}:</span>
                      <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-ES") : "—"}</span>
                    </div>

                    {/* Descripción libre del restaurante */}
                    <div className="restaurant-request-description">
                      <span className="req-label">📝 {t(lang, "lbl_desc")}:</span>
                      <p>{req.description}</p>
                    </div>
                  </div>

                  {/* Acciones del administrador */}
                  <div className="admin-review-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => onApproveRestaurantRequest(req.id)}
                    >
                      {t(lang, "admin_mark_reviewed")}
                    </button>
                    <button
                      type="button"
                      className="small-btn danger-btn"
                      onClick={() => onRemoveRestaurantRequest(req.id)}
                    >
                      {t(lang, "admin_reject")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
