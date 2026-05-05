import React, { useState } from "react";
import SearchInput from "../components/SearchInput";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import Pagination from "../components/Pagination";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";
import { t } from "../utils/translations";

export default function RestaurantesPage({
  search,
  onSearch,
  restaurants,
  onOpenRestaurant,
  associatesByRestaurantId,
  jobsByRestaurantId,
  isMobile,
  lang = "es"
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const totalPages = Math.max(1, Math.ceil(restaurants.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visibleRestaurants = restaurants.slice(start, start + pageSize);

  function handleSearch(value) {
    onSearch(value);
    setPage(1);
  }

  return (
    <section className="panel">
      <h2>{t(lang, "restaurants_title")}</h2>
      <SearchInput value={search} onChange={handleSearch} placeholder={t(lang, "restaurants_search")} />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSize={(size) => { setPageSize(size); setPage(1); }}
        lang={lang}
      />

      <div className="restaurant-layout">
        {isMobile && (
          <div className="map-sticky-wrap">
            <LeafletRestaurantMap
              restaurants={restaurants}
              jobsByRestaurantId={jobsByRestaurantId}
              onOpenRestaurant={onOpenRestaurant}
              lang={lang}
            />
          </div>
        )}

        <div className="restaurant-list-scroll">
          <ul className="restaurant-list">
            {visibleRestaurants.length === 0 ? (
              <li><p className="empty-list-msg">{t(lang, "restaurants_empty")}</p></li>
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
                        </div>
                        <p className="assoc-count">{t(lang, "restaurants_associated")} {associates.length}</p>
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
            <LeafletRestaurantMap
              restaurants={restaurants}
              jobsByRestaurantId={jobsByRestaurantId}
              onOpenRestaurant={onOpenRestaurant}
              lang={lang}
            />
          </div>
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
