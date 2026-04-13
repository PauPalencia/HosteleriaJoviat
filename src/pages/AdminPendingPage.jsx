import React from "react";
import { getStudentPhoto } from "../utils/ui";

export default function AdminPendingPage({ pendingStudents, onApprove, onRemove, pendingActionId }) {
  return (
    <section className="panel">
      <h2>Aceptar alumnos</h2>
      <p className="section-helper-text">
        Al aceptar una solicitud se activa el alumno y se crea automáticamente su usuario en Firebase Auth.
      </p>

      {pendingStudents.length === 0 ? (
        <p className="state-text">Ahora mismo no hay solicitudes pendientes.</p>
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
                  <button type="button" className="primary-btn" onClick={() => onApprove(student.id)} disabled={isBusy}>
                    {isBusy ? "Aceptando..." : "Aceptar alumno"}
                  </button>
                  <button type="button" className="small-btn" onClick={() => onRemove(student.id)} disabled={isBusy}>
                    Eliminar solicitud
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
