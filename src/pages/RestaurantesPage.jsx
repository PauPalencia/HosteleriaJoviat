import React from "react";
import SearchInput from "../components/SearchInput";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";

export default function RestaurantesPage({
  search,
  onSearch,
  restaurants,
  onOpenRestaurant
}) {
  return (
    <section className="panel">
      <h2>Restaurantes</h2>
      <SearchInput value={search} onChange={onSearch} placeholder="Buscar restaurante por nombre" />
      <div className="restaurant-layout">
        <div className="restaurant-list-scroll">
          <ul className="restaurant-list">
            {restaurants.map((restaurant) => (
              <li key={restaurant.id}>
                <button className="ref-card list-ref-card" onClick={() => onOpenRestaurant(restaurant.id)}>
                  <strong>{restaurant.Name}</strong>
                  <span>ID: {restaurant.id}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="map-sticky-wrap">
          <LeafletRestaurantMap restaurants={restaurants} />
        </div>
      </div>
    </section>
  );
}
