window.PXA_SOFIA_MAP = (() => {
  "use strict";

  const NM_TO_METERS = 1852;

  function destPoint(lat, lon, bearingDeg, distMeters) {
    const R = 6371000;
    const brng = (bearingDeg * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lon * Math.PI) / 180;
    const angDist = distMeters / R;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angDist) + Math.cos(lat1) * Math.sin(angDist) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(angDist) * Math.cos(lat1),
        Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2)
      );

    return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
  }

  function bearingDeg(p1, p2) {
    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  function buildCorridorRectangle(a, b, halfCorridorNm) {
    const halfMeters = (Number(halfCorridorNm) || 15) * NM_TO_METERS;
    const brng = bearingDeg(a, b);
    const leftBrng = (brng - 90 + 360) % 360;
    const rightBrng = (brng + 90) % 360;

    const aLeft = destPoint(a[0], a[1], leftBrng, halfMeters);
    const aRight = destPoint(a[0], a[1], rightBrng, halfMeters);
    const bRight = destPoint(b[0], b[1], rightBrng, halfMeters);
    const bLeft = destPoint(b[0], b[1], leftBrng, halfMeters);

    return [aLeft, aRight, bRight, bLeft];
  }

  function buildHalfCircle(center, outwardBearingDeg, radiusNm, steps = 24) {
    const rMeters = (Number(radiusNm) || 15) * NM_TO_METERS;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const deg = (outwardBearingDeg - 90 + frac * 180 + 360) % 360;
      pts.push(destPoint(center[0], center[1], deg, rMeters));
    }
    return pts;
  }

  function normalizePolygonCoords(rawCoords) {
    if (!Array.isArray(rawCoords)) return [];
    const out = [];
    for (const pt of rawCoords) {
      if (Array.isArray(pt) && pt.length >= 2) {
        const a = Number(pt[0]);
        const b = Number(pt[1]);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        if (Math.abs(a) <= 12 && Math.abs(b) >= 40 && Math.abs(b) <= 52) {
          out.push([b, a]);
        } else {
          out.push([a, b]);
        }
      } else if (pt && typeof pt === "object") {
        const lat = Number(pt.lat ?? pt.latitude);
        const lon = Number(pt.lon ?? pt.lng ?? pt.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          out.push([lat, lon]);
        }
      }
    }
    return out;
  }

  function createController(containerId, options = {}) {
    const map = L.map(containerId, {
      center: options.center || [48.35, -0.15],
      zoom: options.zoom || 8
    });

    const routeLayer = L.layerGroup().addTo(map);
    const notamLayer = L.layerGroup().addTo(map);

    function lookupAirport(code, catalog) {
      if (!code || !catalog) return null;
      const up = String(code).trim().toUpperCase();
      if (Array.isArray(catalog)) {
        return catalog.find((item) => String(item.icao || item.code || "").toUpperCase() === up) || null;
      }
      return catalog[up] || null;
    }

    function renderRoute(params, catalog) {
      routeLayer.clearLayers();
      const dep = (params.departure || "").trim().toUpperCase();
      const dest = (params.destination || "").trim().toUpperCase();
      const wps = (params.waypoints || []).map((c) => String(c).trim().toUpperCase()).filter(Boolean);

      if (!dep || dep === "—" || !dest || dest === "—") {
        return {
          ok: false,
          warningMessage: "Trajet incomplet (Départ et/ou Arrivée OACI manquant). Aucun tracé n'est affiché."
        };
      }

      const sequenceCodes = [dep, ...wps, dest];
      const missing = [];
      const points = [];

      for (const code of sequenceCodes) {
        const ad = lookupAirport(code, catalog);
        if (!ad || typeof ad.lat !== "number" || typeof ad.lon !== "number") {
          missing.push(code);
        } else {
          points.push({ code, lat: ad.lat, lon: ad.lon, name: ad.name || code });
        }
      }

      if (missing.length > 0) {
        return {
          ok: false,
          warningMessage: `Aérodrome(s) OACI introuvable(s) dans la base embarquée : ${missing.join(", ")}. Aucun tracé n'est affiché.`
        };
      }

      const halfCorridorNm = Number(params.halfCorridorNm) || Number(params.radiusNm) || 15;
      const endRadiusNm = Number(params.radiusNm) || halfCorridorNm;

      const latLngs = points.map((p) => [p.lat, p.lon]);
      L.polyline(latLngs, {
        color: "#1d4ed8",
        weight: 3
      }).addTo(routeLayer);

      for (let i = 0; i < points.length - 1; i++) {
        const a = [points[i].lat, points[i].lon];
        const b = [points[i + 1].lat, points[i + 1].lon];
        const polyPts = buildCorridorRectangle(a, b, halfCorridorNm);
        L.polygon(polyPts, {
          color: "#2563eb",
          weight: 1.5,
          dashArray: "5,5",
          fillColor: "#3b82f6",
          fillOpacity: 0.12
        }).addTo(routeLayer);
      }

      if (points.length >= 2) {
        const first = [points[0].lat, points[0].lon];
        const second = [points[1].lat, points[1].lon];
        const outStart = (bearingDeg(first, second) + 180) % 360;
        L.polygon(buildHalfCircle(first, outStart, endRadiusNm), {
          color: "#2563eb",
          weight: 1.5,
          fillColor: "#3b82f6",
          fillOpacity: 0.12
        }).addTo(routeLayer);

        const prevLast = [points[points.length - 2].lat, points[points.length - 2].lon];
        const last = [points[points.length - 1].lat, points[points.length - 1].lon];
        const outEnd = bearingDeg(prevLast, last);
        L.polygon(buildHalfCircle(last, outEnd, endRadiusNm), {
          color: "#2563eb",
          weight: 1.5,
          fillColor: "#3b82f6",
          fillOpacity: 0.12
        }).addTo(routeLayer);
      }

      for (const p of points) {
        L.circleMarker([p.lat, p.lon], {
          radius: 5,
          color: "#0f172a",
          weight: 2,
          fillColor: "#ffffff",
          fillOpacity: 1
        })
          .bindTooltip(`${p.code} — ${p.name}`)
          .addTo(routeLayer);
      }

      map.fitBounds(L.latLngBounds(latLngs).pad(0.2));
      return { ok: true, warningMessage: "" };
    }

    function renderNotamsAndOpenAir(notams, opts = {}) {
      notamLayer.clearLayers();
      const maxCircleRadiusNm = Math.max(2, Number(opts.maxCircleRadiusNm) || 50);
      let circlesCount = 0;
      let polygonsCount = 0;

      for (const n of notams || []) {
        const hasCoords =
          typeof n.lat === "number" &&
          typeof n.lon === "number" &&
          !Number.isNaN(n.lat) &&
          !Number.isNaN(n.lon);
        const radiusNm =
          typeof n.radiusNm === "number" && !Number.isNaN(n.radiusNm) ? n.radiusNm : null;

        if (hasCoords && radiusNm !== null && radiusNm > 0 && radiusNm <= maxCircleRadiusNm) {
          const radiusMeters = radiusNm * NM_TO_METERS;
          L.circle([n.lat, n.lon], {
            radius: radiusMeters,
            color: "#d97706",
            weight: 2.2,
            fillColor: "#f59e0b",
            fillOpacity: 0.16
          })
            .bindPopup(`<strong>${n.id}</strong> (${radiusNm} NM)`)
            .addTo(notamLayer);
          circlesCount++;
        }

        if (Array.isArray(n.openAirZones)) {
          for (const z of n.openAirZones) {
            const rawPoly = z && (z.coords || z.latLngs || z.polygon || (Array.isArray(z) ? z : []));
            const coords = normalizePolygonCoords(rawPoly);
            if (coords.length >= 3) {
              L.polygon(coords, {
                color: "#dc2626",
                weight: 2.5,
                fillColor: "#ef4444",
                fillOpacity: 0.25
              })
                .bindPopup(`<strong>${(z && (z.name || z.title)) || n.id}</strong><br/>NOTAM : ${n.id}`)
                .addTo(notamLayer);
              polygonsCount++;
            }
          }
        }
      }

      notamLayer.eachLayer((lyr) => {
        if (typeof lyr.bringToFront === "function") {
          lyr.bringToFront();
        }
      });

      return { circlesCount, polygonsCount };
    }

    return {
      map,
      renderRoute,
      renderNotamsAndOpenAir
    };
  }

  return {
    createController
  };
})();