import React from "react";
import SearchInput from "../components/SearchInput";
import { getStudentPhoto } from "../utils/ui";

export default function AlumnosPage({ search, onSearch, students, studentSummaryById, onOpenStudent }) {
  return (
    <section className="panel">
      <h2>Alumnos</h2>
      <SearchInput value={search} onChange={onSearch} placeholder="Buscar alumno por nombre" />
      <div className="card-grid">
        {students.map((student) => {
          const summary = studentSummaryById[student.id] || { alumniType: "Alumno", hasCurrentJob: false };
          return (
            <button key={student.id} className="student-card ref-card" onClick={() => onOpenStudent(student.id)}>
              <img src={getStudentPhoto(student)} alt={student.Name} />
              <h3>{student.Name}</h3>
              <div className="badge-row">
                <span className="badge badge-dark">{summary.alumniType}</span>
                <span className={`badge ${summary.hasCurrentJob ? "badge-green" : "badge-gray"}`}>
                  {summary.hasCurrentJob ? "Trabajando ahora" : "Sin trabajo activo"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
