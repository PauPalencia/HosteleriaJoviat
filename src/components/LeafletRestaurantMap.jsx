import React, { useEffect, useMemo, useRef } from "react";

export default function LeafletRestaurantMap({ restaurants, forceCenter = false }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  const points = useMemo(
    () =>
      restaurants
        .filter((r) => r.Location && Number.isFinite(r.Location.lat) && Number.isFinite(r.Location.lng))
        .map((r) => ({ id: r.id, name: r.Name, lat: r.Location.lat, lng: r.Location.lng })),
    [restaurants]
  );

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      const container = mapContainerRef.current;
      if (!container) return;
      const L = await loadLeaflet();
      if (cancelled || !container) return;

      if (!mapRef.current) {
        mapRef.current = L.map(container, { zoomControl: true, preferCanvas: true }).setView([41.3851, 2.1734], 8);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;
      markerLayer.clearLayers();

      if (points.length === 0) {
        map.setView([41.3851, 2.1734], 8);
        requestAnimationFrame(() => map.invalidateSize());
        return;
      }

      const bounds = [];
      points.forEach((point) => {
        L.marker([point.lat, point.lng]).addTo(markerLayer).bindPopup(`<strong>${point.name}</strong>`);
        bounds.push([point.lat, point.lng]);
      });

      if (points.length === 1 || forceCenter) {
        map.setView([points[0].lat, points[0].lng], 16);
      } else {
        map.fitBounds(bounds, { padding: [10, 10], maxZoom: 15 });
      }
      requestAnimationFrame(() => map.invalidateSize());
    }

    renderMap();
    return () => {
      cancelled = true;
    };
  }, [points, forceCenter]);

  return <div ref={mapContainerRef} className="map-box" aria-label="Mapa de restaurantes" />;
}

let leafletPromise;
async function loadLeaflet() {
  if (window.L) return window.L;
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector("link[data-leaflet]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        link.dataset.leaflet = "true";
        document.head.appendChild(link);
      }

      const existingScript = document.querySelector("script[data-leaflet]");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.L));
        existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Leaflet")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("No se pudo cargar Leaflet"));
      document.body.appendChild(script);
    });
  }
  return leafletPromise;
}
