import React, { useState } from "react";
import SearchInput from "../components/SearchInput";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import Pagination from "../components/Pagination";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";

export default function RestaurantesPage({
  search,
  onSearch,
  restaurants,
  onOpenRestaurant,
  associatesByRestaurantId,
  jobsByRestaurantId,
  isMobile
}) {
  // Página actual (1-indexed)
  const [page, setPage] = useState(1);
  // Elementos por página (por defecto 8)
  const [pageSize, setPageSize] = useState(8);

  // Total de páginas según los restaurantes filtrados
  const totalPages = Math.max(1, Math.ceil(restaurants.length / pageSize));
  // Página segura: no puede superar el total de páginas disponibles
  const safePage = Math.min(page, totalPages);

  // Restaurantes visibles en la página actual
  const start = (safePage - 1) * pageSize;
  const visibleRestaurants = restaurants.slice(start, start + pageSize);

  // Al buscar, volver siempre a la primera página
  function handleSearch(value) {
    onSearch(value);
    setPage(1);
  }

  return (
    <section className="panel">
      <h2>Restaurantes</h2>
      <SearchInput value={search} onChange={handleSearch} placeholder="Buscar restaurante por nombre" />

      {/* Paginación superior */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
      />

      <div className="restaurant-layout">
        {isMobile && (
          <div className="map-sticky-wrap">
            <LeafletRestaurantMap
              restaurants={restaurants}
              jobsByRestaurantId={jobsByRestaurantId}
              onOpenRestaurant={onOpenRestaurant}
            />
          </div>
        )}

        {/* Lista de restaurantes (página actual) */}
        <div className="restaurant-list-scroll">
          <ul className="restaurant-list">
            {visibleRestaurants.length === 0 ? (
              <li><p className="empty-list-msg">No se encontraron restaurantes.</p></li>
            ) : (
              visibleRestaurants.map((restaurant) => {
                const associates = associatesByRestaurantId[restaurant.id] || [];
                return (
                  <li key={restaurant.id}>
                    <button className="ref-card list-ref-card" onClick={() => onOpenRestaurant(restaurant.id)}>
                      <img className="restaurant-thumb" src={getRestaurantPhoto(restaurant)} alt={restaurant.Name} />
                      <div className="restaurant-main-info">
                        <div className="work-header-inline compact-header">
                          <strong>{restaurant.Name}</strong>
                          <span>ID: {restaurant.id}</span>
                        </div>
                        <p className="assoc-count">Alumnos asociados: {associates.length}</p>
                        <div className="mini-avatars">
                          {associates.slice(0, 8).map((student) => (
                            <img key={student.id} src={getStudentPhoto(student)} alt={student.Name} title={student.Name} />
                          ))}
                          {associates.length > 8 && <span className="more-count">+{associates.length - 8}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {!isMobile && (
          <div className="map-sticky-wrap">
            {/* El mapa siempre muestra todos los restaurantes, no solo los de la página */}
            <LeafletRestaurantMap
              restaurants={restaurants}
              jobsByRestaurantId={jobsByRestaurantId}
              onOpenRestaurant={onOpenRestaurant}
            />
          </div>
        )}
      </div>

      {/* Paginación inferior */}
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
