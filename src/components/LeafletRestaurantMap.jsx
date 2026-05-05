import React, { useEffect, useMemo, useRef } from "react";
import { t } from "../utils/translations";

/* Radio en píxeles para agrupar marcadores cercanos en un clúster */
const CLUSTER_PIXEL_RADIUS = 65;

/* Foto por defecto si un alumno no tiene foto propia */
const DEFAULT_STUDENT_PHOTO =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60";

/* Foto por defecto si un restaurante no tiene foto propia */
const DEFAULT_RESTAURANT_PHOTO =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=60";

/* Máximo de fotos de alumnos a mostrar en el popup antes del contador "+N" */
const MAX_POPUP_PHOTOS = 5;

/**
 * Mapa de restaurantes con Leaflet.
 *
 * Funcionalidades:
 *  - Clustering: agrupa automáticamente los marcadores cercanos con un icono
 *    circular que muestra el número de restaurantes agrupados.
 *  - Popup: al hacer clic en un marcador individual muestra la foto del
 *    restaurante, dirección, teléfono, descripción y las fotos de alumnos
 *    (color = activos, b&n = anteriores). Máximo MAX_POPUP_PHOTOS fotos.
 *
 * Props:
 *   restaurants         {Array}   - Lista de restaurantes con coordenadas en Location
 *   jobsByRestaurantId  {Object}  - Mapa { restaurantId: [ { currentJob, student } ] }
 *   forceCenter         {boolean} - Si true, centra el mapa en el primer restaurante al zoom 16
 *   onOpenRestaurant    {Function}- Callback al pulsar "Ver ficha"
 *   lang                {string}  - Idioma activo (es | ca | en)
 */
export default function LeafletRestaurantMap({
  restaurants,
  jobsByRestaurantId = {},
  forceCenter = false,
  onOpenRestaurant,
  lang = "es"
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  /* Referencia a la última función drawClusters para eliminarla al actualizar */
  const drawClustersRef = useRef(null);
  /* Referencia actualizada al callback de navegación (evita closures obsoletos) */
  const onOpenRestaurantRef = useRef(onOpenRestaurant);
  useEffect(() => { onOpenRestaurantRef.current = onOpenRestaurant; }, [onOpenRestaurant]);

  /* Filtrar restaurantes con coordenadas válidas y añadir sus relaciones de alumnos,
   * foto, dirección, teléfono y descripción para el popup del mapa. */
  const points = useMemo(
    () =>
      restaurants
        .filter((r) => r.Location && Number.isFinite(r.Location.lat) && Number.isFinite(r.Location.lng))
        .map((r) => ({
          id: r.id,
          name: r.Name,
          photo: r.PhotoURL || r.Photo || "",
          address: r.Address || r.Direccion || "",
          phone: r.Phone || r.Telefono || "",
          description: r.Description || r.Descripcion || "",
          lat: r.Location.lat,
          lng: r.Location.lng,
          jobs: jobsByRestaurantId[r.id] || []
        })),
    [restaurants, jobsByRestaurantId]
  );

  /* Strings traducidos que se pasan al generador de HTML del popup.
   * Al cambiar el idioma se recrea el efecto porque `lang` es dependencia. */
  const popupStrings = useMemo(() => ({
    grouped:   t(lang, "map_grouped"),
    zoomHint:  t(lang, "map_zoom_hint"),
    noStudents: t(lang, "map_no_students"),
    active:    t(lang, "map_active"),
    former:    t(lang, "map_former"),
    viewCard:  t(lang, "map_view_card"),
  }), [lang]);

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      const container = mapContainerRef.current;
      if (!container) return;
      const L = await loadLeaflet();
      if (cancelled || !container) return;

      /* Crear el mapa solo la primera vez */
      if (!mapRef.current) {
        const map = L.map(container, { zoomControl: true }).setView([41.3851, 2.1734], 8);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        mapRef.current = map;
        markerLayerRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;

      /* Eliminar el listener de zoom anterior para evitar duplicados */
      if (drawClustersRef.current) {
        map.off("zoomend", drawClustersRef.current);
      }

      /**
       * Recalcula los clústeres según el zoom actual y dibuja los marcadores.
       * Se llama al montar y cada vez que el usuario cambia el nivel de zoom.
       */
      function drawClusters() {
        markerLayer.clearLayers();
        if (points.length === 0) return;

        const clusters = buildClusters(points, map, CLUSTER_PIXEL_RADIUS);

        clusters.forEach((cluster) => {
          if (cluster.length === 1) {
            /* ── Marcador individual: icono Joviat "J" + popup con info ─────── */
            const point = cluster[0];
            const popupHtml = buildSingleRestaurantPopup(point, popupStrings);

            /* Icono de gota personalizado con la letra J de Joviat */
            const joviatIcon = L.divIcon({
              html: `<div class="map-joviat-pin"><span class="map-joviat-pin-letter">J</span></div>`,
              className: "",
              iconSize: [36, 46],
              iconAnchor: [18, 46],
              popupAnchor: [0, -48]
            });

            const marker = L.marker([point.lat, point.lng], { icon: joviatIcon });
            const popup = L.popup({ maxWidth: 300, minWidth: 240 }).setContent(popupHtml);
            marker.bindPopup(popup);

            /* Al abrir el popup, adjuntar el handler del botón "Ver ficha" */
            marker.on("popupopen", () => {
              const btn = popup.getElement()?.querySelector("[data-open-restaurant]");
              if (btn) {
                btn.addEventListener("click", () => {
                  const id = btn.getAttribute("data-open-restaurant");
                  if (id && onOpenRestaurantRef.current) {
                    marker.closePopup();
                    onOpenRestaurantRef.current(id);
                  }
                });
              }
            });

            marker.addTo(markerLayer);
          } else {
            /* ── Clúster: icono circular con el número de restaurantes ──────── */
            const centerLat = cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length;
            const centerLng = cluster.reduce((sum, p) => sum + p.lng, 0) / cluster.length;
            const count = cluster.length;

            /* DivIcon personalizado con estilo de burbuja */
            const clusterIcon = L.divIcon({
              html: `<div class="map-cluster-icon">${count}</div>`,
              className: "",
              iconSize: [46, 46],
              iconAnchor: [23, 23]
            });

            /* Popup del clúster: lista de nombres + indicación de zoom */
            const namesHtml = cluster.map((p) => `<li>${escapeHtml(p.name)}</li>`).join("");
            const clusterPopup = `
              <div style="font-family:'Segoe UI',Arial,sans-serif">
                <strong style="font-size:0.95rem">${count} ${escapeHtml(popupStrings.grouped)}</strong>
                <ul style="margin:0.4rem 0 0;padding-left:1.1rem;font-size:0.85rem;color:#374151">${namesHtml}</ul>
                <p style="font-size:0.75rem;color:#9ca3af;margin:0.5rem 0 0">
                  ${escapeHtml(popupStrings.zoomHint)}
                </p>
              </div>
            `;

            L.marker([centerLat, centerLng], { icon: clusterIcon })
              .addTo(markerLayer)
              .bindPopup(clusterPopup, { maxWidth: 260 });
          }
        });
      }

      /* Guardar referencia y suscribir al evento de zoom */
      drawClustersRef.current = drawClusters;
      map.on("zoomend", drawClusters);

      /* Dibujar inmediatamente */
      drawClusters();

      /* Ajustar la vista al conjunto de puntos */
      if (points.length > 0) {
        if (points.length === 1 || forceCenter) {
          map.setView([points[0].lat, points[0].lng], 16);
        } else {
          map.fitBounds(
            points.map((p) => [p.lat, p.lng]),
            { padding: [10, 10], maxZoom: 15 }
          );
        }
      }

      requestAnimationFrame(() => map.invalidateSize());
    }

    renderMap();

    return () => {
      cancelled = true;
    };
  }, [points, forceCenter, popupStrings]);

  return <div ref={mapContainerRef} className="map-box" aria-label="Mapa de restaurantes" />;
}

// ─── Clustering ──────────────────────────────────────────────────────────────

/**
 * Agrupa los puntos por proximidad de píxeles en el mapa actual.
 * Algoritmo greedy: los puntos se asignan al primer clúster con el que
 * se solapan. La distancia se mide en píxeles de pantalla.
 *
 * @param {Array}  points       - Puntos con { lat, lng, ... }
 * @param {L.Map}  map          - Instancia de Leaflet
 * @param {number} pixelRadius  - Radio máximo en píxeles para agrupar
 * @returns {Array<Array>}      - Array de clústeres
 */
function buildClusters(points, map, pixelRadius) {
  const clusters = [];
  const assigned = new Set();

  for (let i = 0; i < points.length; i++) {
    if (assigned.has(i)) continue;

    const cluster = [points[i]];
    assigned.add(i);
    const pixelI = map.latLngToContainerPoint([points[i].lat, points[i].lng]);

    for (let j = i + 1; j < points.length; j++) {
      if (assigned.has(j)) continue;
      const pixelJ = map.latLngToContainerPoint([points[j].lat, points[j].lng]);
      const dist = Math.hypot(pixelI.x - pixelJ.x, pixelI.y - pixelJ.y);
      if (dist <= pixelRadius) {
        cluster.push(points[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// ─── Popup HTML ───────────────────────────────────────────────────────────────

/**
 * Genera el HTML del popup de un marcador individual.
 * Muestra la foto del restaurante (si existe), dirección, teléfono, descripción
 * y las fotos de los alumnos:
 *   - Alumnos actuales: foto a color con borde azul
 *   - Alumnos anteriores: foto en blanco y negro con borde gris
 *   - Máximo MAX_POPUP_PHOTOS fotos, luego un círculo "+N"
 *
 * @param {Object} point         - Datos del restaurante ({ name, photo, address, phone, description, id, jobs })
 * @param {Object} strings       - Strings traducidos ({ grouped, zoomHint, noStudents, active, former, viewCard })
 * @returns {string}             - HTML del popup
 */
function buildSingleRestaurantPopup(point, strings) {
  const { name: restaurantName, photo: restaurantPhoto, address, phone, description, id: restaurantId, jobs } = point;

  /* Separar alumnos actuales y pasados (deduplificados por id) */
  const seenIds = new Set();
  const currentStudents = [];
  const pastStudents = [];

  for (const job of jobs) {
    if (!job.student?.id || seenIds.has(job.student.id)) continue;
    seenIds.add(job.student.id);
    if (job.currentJob) {
      currentStudents.push(job.student);
    } else {
      pastStudents.push(job.student);
    }
  }

  /* Combinar: primero actuales (color), luego anteriores (b&n) */
  const allStudents = [...currentStudents, ...pastStudents];
  const visible = allStudents.slice(0, MAX_POPUP_PHOTOS);
  const remaining = allStudents.length - visible.length;

  /* HTML de la foto del restaurante */
  const photoSrc = restaurantPhoto || DEFAULT_RESTAURANT_PHOTO;
  const restaurantPhotoHtml = `
    <img
      src="${escapeHtml(photoSrc)}"
      alt="${escapeHtml(restaurantName)}"
      style="width:100%;height:110px;object-fit:cover;border-radius:6px;display:block;margin-bottom:0.4rem"
      onerror="this.style.display='none'"
    />
  `;

  /* HTML de las fotos de alumnos */
  let photosHtml = "";

  visible.forEach((student, idx) => {
    const isPast = idx >= currentStudents.length;
    const photoUrl = student.PhotoURL || DEFAULT_STUDENT_PHOTO;
    /* Alumnos pasados: filtro de escala de grises y borde gris */
    const imgStyle = isPast
      ? "filter:grayscale(100%);border:2px solid #9ca3af;"
      : "border:2px solid #2563eb;";

    photosHtml += `
      <img
        src="${escapeHtml(photoUrl)}"
        alt="${escapeHtml(student.Name || "Alumno")}"
        title="${escapeHtml(student.Name || "Alumno")}${isPast ? ` (${strings.former})` : ` (${strings.active})`}"
        style="width:38px;height:38px;border-radius:50%;object-fit:cover;${imgStyle}margin:2px;flex-shrink:0"
        onerror="this.src='${DEFAULT_STUDENT_PHOTO}'"
      />
    `;
  });

  /* Círculo con el número de fotos restantes */
  if (remaining > 0) {
    photosHtml += `
      <span style="
        display:inline-flex;align-items:center;justify-content:center;
        width:38px;height:38px;border-radius:50%;
        background:#e5e7eb;font-size:0.75rem;font-weight:700;
        color:#374151;margin:2px;flex-shrink:0;border:2px solid #d1d5db;
      ">+${remaining}</span>
    `;
  }

  /* Texto resumen de alumnos */
  const summaryParts = [];
  if (currentStudents.length > 0) summaryParts.push(`${currentStudents.length} ${strings.active.toLowerCase()}${currentStudents.length > 1 ? "s" : ""}`);
  if (pastStudents.length > 0) summaryParts.push(`${pastStudents.length} ${strings.former.toLowerCase()}${pastStudents.length > 1 ? "es" : ""}`);
  const summaryText = summaryParts.join(" · ");

  /* Leyenda con ejemplos de color (solo si hay ambos tipos) */
  const legendHtml = currentStudents.length > 0 && pastStudents.length > 0 ? `
    <p style="font-size:0.72rem;color:#6b7280;margin:0.3rem 0 0;line-height:1.4">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#2563eb;margin-right:3px;vertical-align:middle"></span>${strings.active}
      &nbsp;
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#9ca3af;margin-right:3px;vertical-align:middle"></span>${strings.former}
    </p>
  ` : "";

  const studentsSection = allStudents.length > 0
    ? `
      <div style="margin-top:0.5rem">
        <p style="margin:0 0 0.25rem;font-size:0.78rem;color:#6b7280">${summaryText}</p>
        <div style="display:flex;flex-wrap:wrap;align-items:center">${photosHtml}</div>
        ${legendHtml}
      </div>
    `
    : `<p style="font-size:0.8rem;color:#9ca3af;margin:0.4rem 0 0">${strings.noStudents}</p>`;

  /* Bloque de información del restaurante (dirección, teléfono, descripción) */
  const infoRows = [];
  if (address) infoRows.push(`<p style="margin:0.2rem 0;font-size:0.8rem;color:#374151">📍 ${escapeHtml(address)}</p>`);
  if (phone) infoRows.push(`<p style="margin:0.2rem 0;font-size:0.8rem;color:#374151">📞 ${escapeHtml(phone)}</p>`);
  if (description) infoRows.push(`<p style="margin:0.3rem 0;font-size:0.78rem;color:#6b7280;font-style:italic">${escapeHtml(description)}</p>`);
  const infoHtml = infoRows.length > 0 ? `<div style="margin-top:0.3rem">${infoRows.join("")}</div>` : "";

  /* Botón "Ver ficha" con data-attribute para el handler React */
  const viewBtnHtml = restaurantId ? `
    <button
      data-open-restaurant="${escapeHtml(restaurantId)}"
      style="
        margin-top:0.55rem;width:100%;padding:0.38rem 0.7rem;
        background:#111;color:#fff;border:none;border-radius:7px;
        font-size:0.82rem;font-weight:600;cursor:pointer;
        font-family:'Segoe UI',Arial,sans-serif;
      "
    >${escapeHtml(strings.viewCard)}</button>
  ` : "";

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:220px">
      ${restaurantPhotoHtml}
      <strong style="font-size:0.95rem;color:#111">${escapeHtml(restaurantName)}</strong>
      ${infoHtml}
      ${studentsSection}
      ${viewBtnHtml}
    </div>
  `;
}

/**
 * Escapa caracteres especiales HTML para evitar XSS en los strings
 * insertados dentro del popup HTML de Leaflet.
 */
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Carga dinámica de Leaflet ────────────────────────────────────────────────

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
