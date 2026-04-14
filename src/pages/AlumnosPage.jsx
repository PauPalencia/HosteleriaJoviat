import React, { useState } from "react";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import { getStudentPhoto } from "../utils/ui";

export default function AlumnosPage({ search, onSearch, students, studentSummaryById, onOpenStudent }) {
  // Página actual (1-indexed)
  const [page, setPage] = useState(1);
  // Elementos por página (por defecto 8)
  const [pageSize, setPageSize] = useState(8);

  // Calcular el total de páginas según los alumnos filtrados
  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  // Ajustar la página si el filtrado reduce el número de páginas disponibles
  const safePage = Math.min(page, totalPages);

  // Alumnos visibles en la página actual
  const start = (safePage - 1) * pageSize;
  const visibleStudents = students.slice(start, start + pageSize);

  // Cuando el usuario busca, resetear a la primera página
  function handleSearch(value) {
    onSearch(value);
    setPage(1);
  }

  return (
    <section className="panel">
      <h2>Alumnos</h2>
      <SearchInput value={search} onChange={handleSearch} placeholder="Buscar alumno por nombre" />

      {/* Paginación superior (selector de tamaño de página) */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
      />

      {/* Grid de tarjetas de alumnos */}
      <div className="card-grid">
        {visibleStudents.length === 0 ? (
          <p className="empty-list-msg">No se encontraron alumnos.</p>
        ) : (
          visibleStudents.map((student) => {
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
          })
        )}
      </div>

      {/* Paginación inferior para volver a navegar sin subir arriba */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
      />
    </section>
  );
}
