import React from "react";
import { getStudentPhoto } from "../utils/ui";

export default function AdminPendingPage({ pendingStudents, onApprove, onRemove }) {
  return (
    <section className="panel">
      <h2>Aceptar alumnos</h2>
      <p className="section-helper-text">
        Desde aquí puedes revisar las solicitudes pendientes y convertirlas en alumnos activos.
      </p>

      {pendingStudents.length === 0 ? (
        <p className="state-text">Ahora mismo no hay solicitudes pendientes.</p>
      ) : (
        <div className="spaced-list">
          {pendingStudents.map((student) => (
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
                <button type="button" className="primary-btn" onClick={() => onApprove(student.id)}>
                  Aceptar alumno
                </button>
                <button type="button" className="small-btn" onClick={() => onRemove(student.id)}>
                  Eliminar solicitud
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
