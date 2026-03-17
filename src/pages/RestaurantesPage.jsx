import React from "react";
import SearchInput from "../components/SearchInput";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";

export default function RestaurantesPage({
  search,
  onSearch,
  restaurants,
  onOpenRestaurant,
  associatesByRestaurantId,
  isMobile
}) {
  return (
    <section className="panel">
      <h2>Restaurantes</h2>
      <SearchInput value={search} onChange={onSearch} placeholder="Buscar restaurante por nombre" />
      <div className="restaurant-layout">
        {isMobile && (
          <div className="map-sticky-wrap">
            <LeafletRestaurantMap restaurants={restaurants} />
          </div>
        )}

        <div className="restaurant-list-scroll">
          <ul className="restaurant-list">
            {restaurants.map((restaurant) => {
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
            })}
          </ul>
        </div>

        {!isMobile && (
          <div className="map-sticky-wrap">
            <LeafletRestaurantMap restaurants={restaurants} />
          </div>
        )}
      </div>
    </section>
  );
}
