import React from "react";
import { getStudentPhoto } from "../utils/ui";
import { t } from "../utils/translations";

// Página que lista los alumnos aprobados y las solicitudes de restaurante revisadas
export default function AdminApprovedStudentsPage({ approvedStudents, approvedRestaurantRequests = [], lang = "es" }) {
  return (
    <section className="panel">

      {/* ── Sección: alumnos aprobados ────────────────────────────────────── */}
      <h2>✅ {t(lang, "appr_students_title")}</h2>
      <p className="section-helper-text">{t(lang, "appr_students_helper")}</p>

      {approvedStudents.length === 0 ? (
        <p className="state-text">{t(lang, "appr_students_empty")}</p>
      ) : (
        <div className="spaced-list">
          {approvedStudents.map((student) => (
            <article key={student.id} className="admin-review-card">
              <div className="admin-review-head">
                <img src={getStudentPhoto(student)} alt={student.Name || t(lang, "lbl_student")} />
                <div>
                  <h3>{student.Name || "-"}</h3>
                  <p><strong>{t(lang, "field_email")}:</strong> {student.Email || "-"}</p>
                  <p><strong>{t(lang, "field_phone")}:</strong> {student.Phone || "-"}</p>
                  <p><strong>{t(lang, "field_curso")}:</strong> {student.Curso || "-"}</p>
                  {student.LinkedIn && (
                    <p><strong>{t(lang, "field_linkedin")}:</strong> {student.LinkedIn}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Separador ─────────────────────────────────────────────────────── */}
      <hr className="section-divider" />

      {/* ── Sección: solicitudes de restaurante revisadas ─────────────────── */}
      <h2>🏪 {t(lang, "appr_rests_title")}</h2>
      <p className="section-helper-text">{t(lang, "appr_rests_helper")}</p>

      {approvedRestaurantRequests.length === 0 ? (
        <p className="state-text">{t(lang, "appr_rests_empty")}</p>
      ) : (
        <div className="spaced-list">
          {approvedRestaurantRequests.map((req) => (
            <article key={req.id} className="admin-review-card restaurant-request-card approved-request-card">
              <div className="restaurant-request-icon">🏪</div>

              <div className="restaurant-request-body">
                <div className="restaurant-request-meta">
                  <span className="req-label">👤 {t(lang, "lbl_student")}:</span>
                  <span>{req.studentName || "—"}</span>
                </div>
                <div className="restaurant-request-meta">
                  <span className="req-label">✉️ {t(lang, "field_email")}:</span>
                  <span>{req.studentEmail || "—"}</span>
                </div>
                <div className="restaurant-request-meta">
                  <span className="req-label">🕐 {t(lang, "lbl_date")}:</span>
                  <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-ES") : "—"}</span>
                </div>
                <div className="restaurant-request-description">
                  <span className="req-label">📝 {t(lang, "lbl_desc")}:</span>
                  <p>{req.description}</p>
                </div>
              </div>

              <div className="approved-request-badge">
                <span className="badge badge-green">✅ {t(lang, "appr_reviewed_badge")}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
