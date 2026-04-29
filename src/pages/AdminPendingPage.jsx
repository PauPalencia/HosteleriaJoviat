import React, { useState } from "react";
import { getStudentPhoto } from "../utils/ui";

// Pestañas disponibles en el panel de solicitudes
const TABS = [
  { key: "students", label: "Solicitudes de alumnos" },
  { key: "restaurants", label: "Solicitudes de restaurante" },
];

export default function AdminPendingPage({
  pendingStudents,
  restaurantRequests = [],
  onApprove,
  onRemove,
  onApproveRestaurantRequest,
  onRemoveRestaurantRequest,
  pendingActionId
}) {
  // Pestaña activa: "students" por defecto
  const [activeTab, setActiveTab] = useState("students");

  return (
    <section className="panel">
      <h2>Gestión de solicitudes</h2>

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
            Al aceptar una solicitud se activa el alumno y se crea automáticamente su usuario en Firebase Auth.
          </p>

          {pendingStudents.length === 0 ? (
            <p className="state-text">No hay solicitudes de acceso pendientes.</p>
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
                        <p><strong>Correo:</strong> {student.Email}</p>
                        <p><strong>Teléfono:</strong> {student.Phone || "-"}</p>
                        <p><strong>Curso:</strong> {student.Curso || "-"}</p>
                      </div>
                    </div>
                    <div className="admin-review-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => onApprove(student.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? "Aceptando..." : "✅ Aceptar alumno"}
                      </button>
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => onRemove(student.id)}
                        disabled={isBusy}
                      >
                        🗑️ Eliminar solicitud
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
            Peticiones enviadas por alumnos para que se añada un restaurante a la plataforma.
            Puedes aprobarlas (pasan al panel de aprobadas) o rechazarlas.
          </p>

          {restaurantRequests.length === 0 ? (
            <p className="state-text">No hay solicitudes de restaurante pendientes.</p>
          ) : (
            <div className="spaced-list">
              {restaurantRequests.map((req) => (
                <article key={req.id} className="admin-review-card restaurant-request-card">
                  {/* Icono de restaurante */}
                  <div className="restaurant-request-icon">🏪</div>

                  <div className="restaurant-request-body">
                    {/* Datos del alumno que hizo la solicitud */}
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

                    {/* Descripción libre del restaurante */}
                    <div className="restaurant-request-description">
                      <span className="req-label">📝 Descripción:</span>
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
                      ✅ Marcar como revisada
                    </button>
                    <button
                      type="button"
                      className="small-btn danger-btn"
                      onClick={() => onRemoveRestaurantRequest(req.id)}
                    >
                      🗑️ Rechazar solicitud
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
