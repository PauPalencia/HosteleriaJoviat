import React from "react";
import { getStudentPhoto } from "../utils/ui";

// Página que lista los alumnos aprobados y las solicitudes de restaurante revisadas
export default function AdminApprovedStudentsPage({ approvedStudents, approvedRestaurantRequests = [] }) {
  return (
    <section className="panel">

      {/* ── Sección: alumnos aprobados ────────────────────────────────────── */}
      <h2>✅ Solicitudes aprobadas</h2>
      <p className="section-helper-text">
        Estos alumnos han sido validados y tienen acceso a la plataforma.
      </p>

      {approvedStudents.length === 0 ? (
        <p className="state-text">No hay alumnos aprobados todavía.</p>
      ) : (
        <div className="spaced-list">
          {approvedStudents.map((student) => (
            <article key={student.id} className="admin-review-card">
              <div className="admin-review-head">
                {/* Foto del alumno aprobado */}
                <img src={getStudentPhoto(student)} alt={student.Name || "Alumno"} />
                <div>
                  <h3>{student.Name || "Sin nombre"}</h3>
                  <p><strong>Correo:</strong> {student.Email || "-"}</p>
                  <p><strong>Teléfono:</strong> {student.Phone || "-"}</p>
                  <p><strong>Curso:</strong> {student.Curso || "-"}</p>
                  {student.LinkedIn && (
                    <p><strong>LinkedIn:</strong> {student.LinkedIn}</p>
                  )}
                  <p><strong>ID:</strong> {student.id}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Separador ─────────────────────────────────────────────────────── */}
      <hr className="section-divider" />

      {/* ── Sección: solicitudes de restaurante revisadas ─────────────────── */}
      <h2>🏪 Solicitudes de restaurante revisadas</h2>
      <p className="section-helper-text">
        Peticiones de restaurante que han sido marcadas como revisadas.
        Puedes crearlos manualmente desde "Crear restaurantes".
      </p>

      {approvedRestaurantRequests.length === 0 ? (
        <p className="state-text">No hay solicitudes de restaurante revisadas todavía.</p>
      ) : (
        <div className="spaced-list">
          {approvedRestaurantRequests.map((req) => (
            <article key={req.id} className="admin-review-card restaurant-request-card approved-request-card">
              {/* Icono */}
              <div className="restaurant-request-icon">🏪</div>

              <div className="restaurant-request-body">
                {/* Datos del alumno que envió la solicitud */}
                <div className="restaurant-request-meta">
                  <span className="req-label">👤 Alumno:</span>
                  <span>{req.studentName || "—"}</span>
                </div>
                <div className="restaurant-request-meta">
                  <span className="req-label">✉️ Correo:</span>
                  <span>{req.studentEmail || "—"}</span>
                </div>
                <div className="restaurant-request-meta">
                  <span className="req-label">🕐 Fecha:</span>
                  <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-ES") : "—"}</span>
                </div>

                {/* Descripción que escribió el alumno */}
                <div className="restaurant-request-description">
                  <span className="req-label">📝 Descripción:</span>
                  <p>{req.description}</p>
                </div>
              </div>

              {/* Etiqueta de estado revisado */}
              <div className="approved-request-badge">
                <span className="badge badge-green">✅ Revisada</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
