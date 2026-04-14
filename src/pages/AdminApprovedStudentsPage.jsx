import React from "react";
import { getStudentPhoto } from "../utils/ui";

// Página que lista todos los alumnos que han sido aprobados por un administrador
export default function AdminApprovedStudentsPage({ approvedStudents }) {
  return (
    <section className="panel">
      <h2>Solicitudes aprobadas</h2>
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
    </section>
  );
}
