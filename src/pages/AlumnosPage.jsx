import React, { useState } from "react";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import { getStudentPhoto } from "../utils/ui";
import { t } from "../utils/translations";

export default function AlumnosPage({ search, onSearch, students, studentSummaryById, onOpenStudent, lang = "es" }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visibleStudents = students.slice(start, start + pageSize);

  function handleSearch(value) {
    onSearch(value);
    setPage(1);
  }

  return (
    <section className="panel">
      <h2>{t(lang, "alumnos_title")}</h2>
      <SearchInput value={search} onChange={handleSearch} placeholder={t(lang, "alumnos_search")} />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
        lang={lang}
      />

      <div className="card-grid">
        {visibleStudents.length === 0 ? (
          <p className="empty-list-msg">{t(lang, "alumnos_empty")}</p>
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
                    {summary.hasCurrentJob ? t(lang, "alumnos_working") : t(lang, "alumnos_not_working")}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
        lang={lang}
      />
    </section>
  );
}
