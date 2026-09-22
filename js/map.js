/* ==========================================================================
   Map module — Leaflet + CARTO/OSM tiles, custom SVG pins, category layers,
   itinerary route polylines. Degrades gracefully without connectivity.
   ========================================================================== */

'use strict';

const MapMod = (() => {

  let map = null;
  let layer = null;          // L.layerGroup holding markers
  let routeLayer = null;     // itinerary polyline
  const markers = new Map(); // destId -> marker
  let ready = false;

  const PIN_COLORS = {
    lake: '#0e7490', nature: '#15803d', wildlife: '#b45309', heritage: '#7c2d12',
    museum: '#6d28d9', market: '#be185d', sacred: '#a16207', village: '#047857',
    trek: '#1d4ed8', cave: '#334155', waterfall: '#0369a1', park: '#166534',
    viewpoint: '#9333ea', border: '#b91c1c', botany: '#db2777', crafts: '#c2410c',
    stay: '#0f766e', hill: '#14532d'
  };

  function pinSVG(color) {
    return `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 1C8 1 2.5 6.6 2.5 13.6 2.5 23 15 39 15 39s12.5-16 12.5-25.4C27.5 6.6 22 1 15 1z"
        fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="15" cy="13.5" r="5.5" fill="#ffffff" fill-opacity="0.95"/>
    </svg>`;
  }

  function init() {
    const el = document.getElementById('mapCanvas');
    if (!el || typeof L === 'undefined') { showFallback(el); return false; }
    if (map) { setTimeout(() => map.invalidateSize(), 60); return true; }

    map = L.map(el, {
      center: [24.80, 93.95],
      zoom: 8,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    });
    el.addEventListener('wheel', e => { if (e.ctrlKey) return; }, { passive: true });
    el.addEventListener('dblclick', () => {});
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    layer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
    ready = true;
    renderAll();
    setTimeout(() => map.invalidateSize(), 80);
    return true;
  }

  function showFallback(el) {
    if (!el) return;
    el.innerHTML = `
      <div class="map-fallback">
        <div class="map-fallback-art">🗺️</div>
        <h3>The interactive map needs a connection</h3>
        <p>Everything else on this site works offline — the map tiles alone stream live from open map services.</p>
        <div class="map-fallback-list">
          ${KB.destinations.map(d => `<div class="map-fallback-row"><span>${d.name}</span><em>${d.district}</em></div>`).join('')}
        </div>
      </div>`;
  }

  function popupHTML(d) {
    const inTrip = App && App.trip.has(d.id);
    return `<div class="map-pop">
      <div class="map-pop-title">${d.name}</div>
      <div class="map-pop-meta">${d.district} · ${d.cost} · best ${Engine.monthList(d.bestMonths)}</div>
      <p>${d.blurb}</p>
      <div class="map-pop-actions">
        <button data-mp="open" data-id="${d.id}">Details</button>
        <button data-mp="trip" data-id="${d.id}">${inTrip ? '✓ In your trip' : 'Add to trip'}</button>
      </div>
    </div>`;
  }

  function renderAll() {
    if (!ready) return;
    layer.clearLayers();
    markers.clear();
    const visible = App ? App.visibleDestinations() : KB.destinations;
    for (const d of visible) {
      const color = PIN_COLORS[d.cat[0]] || '#0f766e';
      const icon = L.divIcon({
        className: 'pin-wrap',
        html: pinSVG(color),
        iconSize: [30, 40],
        iconAnchor: [15, 38],
        popupAnchor: [0, -34]
      });
      const m = L.marker(d.coords, { icon, title: d.name }).addTo(layer);
      m.bindPopup(popupHTML(d), { maxWidth: 280, minWidth: 240 });
      markers.set(d.id, m);
    }
  }

  function focus(d) {
    if (!ready) return;
    map.flyTo(d.coords, Math.max(10, map.getZoom()), { duration: 0.8 });
    const m = markers.get(d.id);
    if (m) setTimeout(() => m.openPopup(), 850);
  }

  function drawRoute(plan) {
    if (!ready) return;
    routeLayer.clearLayers();
    if (!plan || !plan.length) return;
    const colors = ['#0e7490', '#be185d', '#7c2d12', '#15803d', '#6d28d9', '#b45309', '#1d4ed8', '#a16207', '#9333ea', '#047857'];
    plan.forEach((day, i) => {
      const pts = [Engine.IMPHAL, ...day.stops.map(s => s.coords)];
      if (day.returnToCity) pts.push(Engine.IMPHAL);
      L.polyline(pts, { color: colors[i % colors.length], weight: 3.5, opacity: 0.85, dashArray: '6 7' }).addTo(routeLayer);
      day.stops.forEach((s, j) => {
        L.marker(s.coords, {
          icon: L.divIcon({
            className: 'day-badge-wrap',
            html: `<span class="day-badge" style="--c:${colors[i % colors.length]}">${day.day}</span>`,
            iconSize: [24, 24], iconAnchor: [12, 12]
          })
        }).addTo(routeLayer).bindTooltip(`Day ${day.day} · ${s.name}`, { direction: 'top' });
        void j;
      });
    });
    const all = plan.flatMap(dp => dp.stops.map(s => s.coords));
    if (all.length) map.fitBounds(L.latLngBounds(all).pad(0.18));
  }

  function showRoute(on) {
    if (!ready) return;
    if (on) routeLayer.addTo(map); else routeLayer.remove();
  }

  return { init, renderAll, focus, drawRoute, showRoute, get isReady() { return ready; } };
})();
