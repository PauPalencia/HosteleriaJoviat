import React from "react";

// Opciones disponibles para el número de elementos por página
export const PAGE_SIZE_OPTIONS = [4, 8, 12, 16];

/**
 * Genera la lista de números de página a mostrar, con puntos suspensivos
 * cuando hay muchas páginas (lógica inteligente).
 *
 * Ejemplos:
 *   5 páginas            → [1, 2, 3, 4, 5]
 *   10 páginas, en pág 1 → [1, 2, 3, 4, "...", 10]
 *   10 páginas, en pág 5 → [1, "...", 4, 5, 6, "...", 10]
 *   10 páginas, en pág 9 → [1, "...", 7, 8, 9, 10]
 */
function buildPageItems(currentPage, totalPages) {
  // Con 5 páginas o menos mostramos todas sin puntos
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Construir el conjunto de páginas siempre visibles:
  // - Primera y última siempre presentes
  // - Página actual y sus vecinas inmediatas
  const visibleSet = new Set([1, totalPages]);
  const neighbors = 1; // páginas a cada lado de la actual
  for (let p = Math.max(2, currentPage - neighbors); p <= Math.min(totalPages - 1, currentPage + neighbors); p++) {
    visibleSet.add(p);
  }

  // Convertir a array ordenado e insertar "..." donde hay saltos
  const sorted = Array.from(visibleSet).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    // Si hay un hueco de más de 1 página entre dos números consecutivos, insertar "..."
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push("...");
    }
  }

  return result;
}

/**
 * Componente de paginación reutilizable.
 *
 * Props:
 *   currentPage   {number}   - Página actual (1-indexed)
 *   totalPages    {number}   - Total de páginas disponibles
 *   pageSize      {number}   - Elementos por página actualmente seleccionado
 *   onPageChange  {Function} - Callback cuando el usuario cambia de página
 *   onPageSize    {Function} - Callback cuando el usuario cambia el tamaño de página
 */
export default function Pagination({ currentPage, totalPages, pageSize, onPageChange, onPageSize }) {
  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="pagination-wrap">
      {/* Selector de elementos por página */}
      <div className="pagination-size-wrap">
        <span className="pagination-size-label">Por página:</span>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <button
            key={size}
            className={`pagination-size-btn ${pageSize === size ? "pagination-size-btn-active" : ""}`}
            onClick={() => { onPageSize(size); onPageChange(1); }}
            aria-pressed={pageSize === size}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Navegación de páginas */}
      {totalPages > 1 && (
        <nav className="pagination-nav" aria-label="Paginación">
          {/* Botón anterior */}
          <button
            className="pagination-btn pagination-arrow"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>

          {/* Números de página con puntos suspensivos */}
          {pageItems.map((item, index) =>
            item === "..." ? (
              // Puntos suspensivos (no clicables)
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">…</span>
            ) : (
              // Número de página clicable
              <button
                key={item}
                className={`pagination-btn pagination-page ${currentPage === item ? "pagination-page-active" : ""}`}
                onClick={() => onPageChange(item)}
                aria-current={currentPage === item ? "page" : undefined}
              >
                {item}
              </button>
            )
          )}

          {/* Botón siguiente */}
          <button
            className="pagination-btn pagination-arrow"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
