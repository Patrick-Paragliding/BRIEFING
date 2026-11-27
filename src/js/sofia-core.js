window.PXA_SOFIA_CORE = (() => {
  "use strict";

  function normalizeHeaderKey(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSupKey(numStr, yearStr) {
    const num = String(parseInt(numStr, 10)).padStart(3, "0");
    const yr = String(yearStr || "").length === 2 ? String(yearStr) : String(yearStr || "").slice(-2);
    return `${num}/${yr}`;
  }

  function buildSupaipOfficialUrl(numStr, yearStr) {
    const num = String(parseInt(numStr, 10)).padStart(3, "0");
    const fullYear = String(yearStr || "").length === 2 ? `20${yearStr}` : String(yearStr || "");
    return `https://www.sia.aviation-civile.gouv.fr/media/dvd/eAIP_${fullYear}/FRANCE/AIRAC/pdf/lf_sup_${fullYear}_${num}_fr.pdf`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function injectSupaipLinksHtml(rawText) {
    const escaped = escapeHtml(rawText);
    return escaped.replace(
      /\b(SUP\s*AIP(?:\s*AIRAC)?\s*(\d{1,3})\s*\/\s*(\d{2,4}))\b/gi,
      (_, fullMatch, num, yr) => {
        const url = buildSupaipOfficialUrl(num, yr);
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${fullMatch}</a>`;
      }
    );
  }

  function extractSupaipRefs(text) {
    const refs = [];
    const seen = new Set();
    for (const m of String(text || "").matchAll(/\bSUP\s*AIP(?:\s*AIRAC)?\s*(\d{1,3})\s*\/\s*(\d{2,4})\b/gi)) {
      const key = normalizeSupKey(m[1], m[2]);
      if (!seen.has(key)) {
        seen.add(key);
        refs.push({
          key,
          num: String(parseInt(m[1], 10)).padStart(3, "0"),
          year: m[2].length === 2 ? m[2] : m[2].slice(-2),
          url: buildSupaipOfficialUrl(m[1], m[2])
        });
      }
    }
    return refs;
  }

  function parseDmsCoord(degStr, minStr, secStr, hemi) {
    const deg = parseInt(degStr, 10);
    const min = parseInt(minStr, 10);
    const sec = parseFloat(secStr || "0");
    let val = deg + min / 60 + sec / 3600;
    const h = String(hemi || "").toUpperCase();
    if (h === "S" || h === "W") {
      val = -val;
    }
    return Number.isNaN(val) ? null : Number(val.toFixed(6));
  }

  function parseOpenAirBlockText(blockText) {
    const text = String(blockText || "");
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let name = "";
    let floor = "";
    let ceiling = "";
    const supKeys = new Set();
    const coords = [];

    for (const m of text.matchAll(/\bSUP\s*AIP(?:\s*AIRAC)?\s*(\d{1,3})\s*\/\s*(\d{2,4})\b/gi)) {
      supKeys.add(normalizeSupKey(m[1], m[2]));
    }

    for (const line of lines) {
      if (/^AN\s+/i.test(line)) {
        name = line.replace(/^AN\s+/i, "").trim();
      } else if (!name && /^\*\s*ZRT\b/i.test(line)) {
        name = line.replace(/^\*\s*/, "").trim();
      } else if (/^AL\s+/i.test(line)) {
        floor = line.replace(/^AL\s+/i, "").trim();
      } else if (/^AH\s+/i.test(line)) {
        ceiling = line.replace(/^AH\s+/i, "").trim();
      } else if (/^DP\s+/i.test(line)) {
        const mColon = line.match(
          /^DP\s+(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3}):(\d{2}):(\d{2}(?:\.\d+)?)\s*([EW])/i
        );
        if (mColon) {
          const lat = parseDmsCoord(mColon[1], mColon[2], mColon[3], mColon[4]);
          const lon = parseDmsCoord(mColon[5], mColon[6], mColon[7], mColon[8]);
          if (lat !== null && lon !== null) coords.push([lat, lon]);
          continue;
        }
        const mSpace = line.match(
          /^DP\s+(\d{1,2})\s+(\d{2})\s+(\d{2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3})\s+(\d{2})\s+(\d{2}(?:\.\d+)?)\s*([EW])/i
        );
        if (mSpace) {
          const lat = parseDmsCoord(mSpace[1], mSpace[2], mSpace[3], mSpace[4]);
          const lon = parseDmsCoord(mSpace[5], mSpace[6], mSpace[7], mSpace[8]);
          if (lat !== null && lon !== null) coords.push([lat, lon]);
        }
      }
    }

    return {
      name: name || "Zone OpenAir",
      floor,
      ceiling,
      supKeys: Array.from(supKeys),
      coords
    };
  }

  function isPointPair(item) {
    return (
      Array.isArray(item) &&
      item.length >= 2 &&
      typeof item[0] === "number" &&
      typeof item[1] === "number" &&
      !Number.isNaN(item[0]) &&
      !Number.isNaN(item[1])
    );
  }

  function extractCoordsDeep(val, depth = 0) {
    if (!val || depth > 6) return [];
    if (Array.isArray(val)) {
      const points = val.filter(isPointPair);
      if (points.length >= 3) {
        return points;
      }
      const collected = [];
      for (const item of val) {
        if (isPointPair(item)) {
          collected.push(item);
        } else {
          const found = extractCoordsDeep(item, depth + 1);
          if (found.length > 0) {
            for (const pt of found) collected.push(pt);
          }
        }
      }
      if (collected.length >= 3) return collected;
      return [];
    }
    if (typeof val === "object") {
      const preferredKeys = [
        "geoms",
        "geom",
        "coords",
        "latLngs",
        "latlngs",
        "polygon",
        "points",
        "coordinates",
        "ring",
        "rings",
        "geometry",
        "path"
      ];
      for (const k of preferredKeys) {
        if (val[k] !== undefined) {
          const found = extractCoordsDeep(val[k], depth + 1);
          if (found.length >= 3) return found;
        }
      }
      for (const v of Object.values(val)) {
        if (Array.isArray(v) || (v && typeof v === "object")) {
          const found = extractCoordsDeep(v, depth + 1);
          if (found.length >= 3) return found;
        }
      }
    }
    return [];
  }

  function normalizeZoneEntry(entry, fallbackName = "Zone OpenAir") {
    if (!entry) return null;
    if (typeof entry === "string") {
      if (/\bDP\s+/i.test(entry)) {
        return parseOpenAirBlockText(entry);
      }
      return null;
    }
    if (typeof entry === "object") {
      const rawTxt = entry.raw || entry.openair || entry.text || entry.content || entry.block || "";
      let coords = extractCoordsDeep(entry);
      let parsedFromRaw = null;
      if (coords.length < 3 && rawTxt) {
        parsedFromRaw = parseOpenAirBlockText(rawTxt);
        coords = parsedFromRaw.coords;
      }
      if (Array.isArray(coords) && coords.length >= 3) {
        return {
          name: entry.name || entry.title || entry.an || entry.zone || (parsedFromRaw && parsedFromRaw.name) || fallbackName,
          floor: entry.altFloor || entry.floor || entry.al || (parsedFromRaw && parsedFromRaw.floor) || "",
          ceiling: entry.altCeil || entry.ceiling || entry.ah || (parsedFromRaw && parsedFromRaw.ceiling) || "",
          coords,
          geoms: entry.geoms || null
        };
      }
    }
    return null;
  }

  function collectZonesFromValue(val, fallbackName, results, seenKeys, depth = 0) {
    if (!val || depth > 4) return;
    if (Array.isArray(val)) {
      const hasZoneObjects = val.some(
        (it) => it && typeof it === "object" && !Array.isArray(it) && (it.name || it.geoms || it.coords || it.points)
      );
      if (!hasZoneObjects) {
        const directCoords = extractCoordsDeep(val);
        if (directCoords.length >= 3) {
          const sig = `${fallbackName}|${directCoords.length}|${directCoords[0]}`;
          if (!seenKeys.has(sig)) {
            seenKeys.add(sig);
            results.push({ name: fallbackName, floor: "", ceiling: "", coords: directCoords });
          }
          return;
        }
      }
      for (const item of val) {
        collectZonesFromValue(item, fallbackName, results, seenKeys, depth + 1);
      }
      return;
    }
    if (typeof val === "string") {
      const norm = normalizeZoneEntry(val, fallbackName);
      if (norm && norm.coords.length >= 3) {
        const sig = `${norm.name}|${norm.coords.length}|${norm.coords[0]}`;
        if (!seenKeys.has(sig)) {
          seenKeys.add(sig);
          results.push(norm);
        }
      }
      return;
    }
    if (typeof val === "object") {
      const norm = normalizeZoneEntry(val, fallbackName);
      if (norm && norm.coords.length >= 3) {
        const sig = `${norm.name}|${norm.coords.length}|${norm.coords[0]}`;
        if (!seenKeys.has(sig)) {
          seenKeys.add(sig);
          results.push(norm);
        }
        return;
      }
      for (const v of Object.values(val)) {
        collectZonesFromValue(v, fallbackName, results, seenKeys, depth + 1);
      }
    }
  }

  function extractOpenAirZonesForNotam(notamId, supKeysSet) {
    const oa = window.PXA_OPENAIR;
    if (!oa || typeof oa !== "object") return [];

    const results = [];
    const seenKeys = new Set();

    if (notamId && oa.byNotam && typeof oa.byNotam === "object") {
      const upId = String(notamId).trim().toUpperCase();
      const byNotamVal = oa.byNotam[upId] || oa.byNotam[notamId];
      if (byNotamVal) {
        collectZonesFromValue(byNotamVal, upId, results, seenKeys);
      }
    }

    if (supKeysSet && supKeysSet.size > 0 && oa.bySup && typeof oa.bySup === "object") {
      for (const key of supKeysSet) {
        const variants = new Set([key]);
        const parts = key.split("/");
        if (parts.length === 2) {
          const numNoPad = String(parseInt(parts[0], 10));
          const yr2 = parts[1];
          const yr4 = yr2.length === 2 ? `20${yr2}` : yr2;
          variants.add(`${numNoPad}/${yr2}`);
          variants.add(`${parts[0]}/${yr4}`);
          variants.add(`${numNoPad}/${yr4}`);
          variants.add(`SUP AIP ${key}`);
          variants.add(`SUP AIP ${numNoPad}/${yr2}`);
        }
        for (const v of variants) {
          const val = oa.bySup[v];
          if (val) {
            collectZonesFromValue(val, `SUP AIP ${key}`, results, seenKeys);
          }
        }
      }
    }

    return results;
  }

  const KNOWN_SOFIA_HEADERS = [
    "RESTRICTIONS DE L'ESPACE AÉRIEN",
    "ORGANISATION DE L'ESPACE AÉRIEN ET SERVICES DE LA CIRCULATION AÉRIENNE",
    "ORGANISATION DE L'ESPACE AÉRIEN ET PROCÉDURES",
    "ORGANISATION DE L'ESPACE AÉRIEN"
  ];

  function isDefaultSelectedHeader(headerLabel) {
    const norm = normalizeHeaderKey(headerLabel);
    if (!norm) return false;
    if (norm === "RESTRICTIONS DE L'ESPACE AERIEN" || norm === "RESTRICTIONS DE L’ESPACE AERIEN") {
      return true;
    }
    if (norm.includes("ORGANISATION DE L'ESPACE") || norm.includes("ORGANISATION DE L’ESPACE")) {
      return true;
    }
    return false;
  }

  function getDefaultSelectedHeaders(availableHeaders) {
    const selected = new Set();
    for (const h of availableHeaders || []) {
      if (isDefaultSelectedHeader(h)) {
        selected.add(h);
      }
    }
    return selected;
  }

  async function extractPdfText(arrayBuffer) {
    if (!window.pdfjsLib) {
      throw new Error("La bibliothèque pdf.js (pdfjsLib) n'est pas chargée.");
    }
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pagesText = [];

    const labelDefs = [
      { key: "generatedAt", rx: /^Date\s+et\s+Heure\s+de\s+production/i },
      { key: "plannedDeparture", rx: /^Date\s+et\s+heure\s+de\s+d[ée]part/i },
      { key: "duration", rx: /^Dur[ée]e\b/i },
      { key: "flightRules", rx: /^R[èe]gle\s+de\s+vol/i },
      { key: "departure", rx: /^D[ée]part\b/i },
      { key: "destination", rx: /^Destination\b/i },
      { key: "floorFl", rx: /^Plancher/i },
      { key: "ceilingFl", rx: /^Plafond/i },
      { key: "radiusNm", rx: /^Rayon/i },
      { key: "halfCorridorNm", rx: /^Demi-couloir/i },
      { key: "waypoints", rx: /^Points?\s+tournants?/i }
    ];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const items = textContent.items
        .filter((it) => it.str && it.str.trim())
        .map((it) => ({
          str: it.str.trim(),
          x: it.transform[4],
          y: it.transform[5]
        }));

      const gridLines = [];
      for (const def of labelDefs) {
        const lblItem = items.find((it) => def.rx.test(it.str));
        if (!lblItem) continue;
        const candidates = items
          .filter(
            (it) =>
              it !== lblItem &&
              Math.abs(it.x - lblItem.x) <= 35 &&
              lblItem.y - it.y > 2 &&
              lblItem.y - it.y < 32
          )
          .sort((a, b) => a.x - b.x);
        if (candidates.length > 0) {
          const valStr = candidates.map((c) => c.str).join(" ").trim();
          gridLines.push(`${lblItem.str}\n${valStr}`);
        }
      }

      const linesByY = new Map();
      for (const item of items) {
        const y = Math.round(item.y / 3) * 3;
        if (!linesByY.has(y)) linesByY.set(y, []);
        linesByY.get(y).push(item);
      }

      const sortedY = Array.from(linesByY.keys()).sort((a, b) => b - a);
      const pageLines = sortedY.map((y) => {
        const chunks = linesByY.get(y).sort((a, b) => a.x - b.x);
        return chunks.map((c) => c.str).join(" ").replace(/\s+/g, " ").trim();
      });

      const prefix = gridLines.length > 0 ? gridLines.join("\n") + "\n" : "";
      pagesText.push(prefix + pageLines.join("\n"));
    }

    return pagesText.join("\n");
  }

  function parsePibParams(fullText) {
    const text = String(fullText || "");
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const knownLabelsRx = /^(?:Date\s+et\s+Heure\s+de\s+production|Date\s+et\s+heure\s+de\s+d[ée]part|R[èe]gle\s+de\s+vol|Plancher(?:\s*\(en\s+FL\))?|Demi-couloir(?:\s*\(en\s+NM\))?|D[ée]part|Destination|Plafond(?:\s*\(en\s+FL\))?|Rayon(?:\s*\(en\s+NM\))?|Points?\s+tournants?|Dur[ée]e)\b/i;

    const getNextLineValue = (labelRegex) => {
      for (let i = 0; i < lines.length; i++) {
        if (labelRegex.test(lines[i])) {
          for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
            const cand = lines[j];
            if (!knownLabelsRx.test(cand)) {
              return cand;
            }
          }
        }
      }
      return "";
    };

    const genBlock = getNextLineValue(/^Date\s+et\s+Heure\s+de\s+production/i);
    const allDt = Array.from(text.matchAll(/\b(\d{2}[-\/]\d{2}[-\/]\d{4})\s+(\d{2}:\d{2})\b/g)).map(
      (m) => `${m[1]} ${m[2]}`
    );
    const generatedAt =
      genBlock.match(/\b\d{2}[-\/]\d{2}[-\/]\d{4}\s+\d{2}:\d{2}\b/)?.[0] ||
      allDt[0] ||
      "—";

    const depDtBlock = getNextLineValue(/^Date\s+et\s+heure\s+de\s+d[ée]part/i);
    const plannedDeparture =
      depDtBlock.match(/\b\d{2}[-\/]\d{2}[-\/]\d{4}\s+\d{2}:\d{2}\b/)?.[0] ||
      (allDt.length >= 2 ? allDt[1] : "") ||
      "—";

    const rulesBlock = getNextLineValue(/^R[èe]gle\s+de\s+vol/i);
    const flightRules = (rulesBlock.match(/\b(VFR\/IFR|VFR|IFR)\b/i)?.[1] || rulesBlock || "VFR").toUpperCase();

    const depBlock = getNextLineValue(/^D[ée]part\b/i);
    const departure = (depBlock.match(/\b([A-Z]{4})\b/)?.[1] || "—").toUpperCase();

    const destBlock = getNextLineValue(/^Destination\b/i);
    const destination = (destBlock.match(/\b([A-Z]{4})\b/)?.[1] || "—").toUpperCase();

    const wpBlock = getNextLineValue(/^Points?\s+tournants?/i);
    const waypoints = [];
    for (const code of wpBlock.match(/\b[A-Z]{4}\b/g) || []) {
      const up = code.toUpperCase();
      if (up !== departure && up !== destination && !waypoints.includes(up)) {
        waypoints.push(up);
      }
    }

    const durBlock = getNextLineValue(/^Dur[ée]e\b/i);
    const duration =
      durBlock.match(/\b(\d{1,2}h\d{2})\b/i)?.[1] ||
      durBlock.match(/\b(\d{3,4})\b/)?.[1] ||
      "—";

    const floorBlock = getNextLineValue(/^Plancher/i);
    const floorFl = parseInt(floorBlock.match(/\b(\d{1,3})\b/)?.[1] || "0", 10);

    const ceilBlock = getNextLineValue(/^Plafond/i);
    const ceilingFl = parseInt(ceilBlock.match(/\b(\d{1,3})\b/)?.[1] || "60", 10);

    const radBlock = getNextLineValue(/^Rayon/i);
    const radiusNm = parseFloat((radBlock.match(/\b\d+(?:[.,]\d+)?\b/)?.[0] || "15").replace(",", "."));

    const halfBlock = getNextLineValue(/^Demi-couloir/i);
    const halfCorridorNm = parseFloat(
      (halfBlock.match(/\b\d+(?:[.,]\d+)?\b/)?.[0] || String(radiusNm || 15)).replace(",", ".")
    );

    return {
      generatedAt,
      plannedDeparture,
      duration,
      flightRules,
      departure,
      destination,
      waypoints,
      floorFl: Number.isNaN(floorFl) ? 0 : floorFl,
      ceilingFl: Number.isNaN(ceilingFl) ? 60 : ceilingFl,
      radiusNm: Number.isNaN(radiusNm) ? halfCorridorNm || 15 : radiusNm,
      halfCorridorNm: Number.isNaN(halfCorridorNm) ? 15 : halfCorridorNm
    };
  }

  function parseQLine(qRaw) {
    const clean = String(qRaw || "").replace(/\s+/g, " ").trim();
    const m = clean.match(
      /([A-Z]{4})\s*\/\s*(Q[A-Z0-9]{3,4})\s*\/[^\/]*\/[^\/]*\/[^\/]*\/\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*\/\s*(\d{4})\s*([NS])\s*(\d{5})\s*([EW])\s*(\d{1,3})/i
    );
    if (!m) return null;

    const latDeg = parseInt(m[5].slice(0, 2), 10);
    const latMin = parseInt(m[5].slice(2, 4), 10);
    let lat = latDeg + latMin / 60;
    if (m[6].toUpperCase() === "S") lat = -lat;

    const lonDeg = parseInt(m[7].slice(0, 3), 10);
    const lonMin = parseInt(m[7].slice(3, 5), 10);
    let lon = lonDeg + lonMin / 60;
    if (m[8].toUpperCase() === "W") lon = -lon;

    const radiusNm = parseInt(m[9], 10);

    return {
      fir: m[1].toUpperCase(),
      qCode: m[2].toUpperCase(),
      lowerFl: parseInt(m[3], 10),
      upperFl: parseInt(m[4], 10),
      lat,
      lon,
      radiusNm: Number.isNaN(radiusNm) ? null : radiusNm
    };
  }

  function detectHeaderLine(line) {
    const norm = normalizeHeaderKey(line);
    if (!norm || norm.length < 6) return null;

    const knownPatterns = [
      /^RESTRICTIONS DE L['’]ESPACE AERIEN$/,
      /^ORGANISATION DE L['’]ESPACE AERIEN ET SERVICES DE LA CIRCULATION AERIENNE$/,
      /^ORGANISATION DE L['’]ESPACE AERIEN ET PROCEDURES$/,
      /^ORGANISATION DE L['’]ESPACE AERIEN$/,
      /^SERVICES DE LA CIRCULATION AERIENNE ET VOLMET$/,
      /^OBSTACLES$/,
      /^INSTALLATIONS ET SERVICES$/,
      /^LFXX AD OU HEL SANS CODE OACI$/,
      /^AERODROMES?\b/,
      /^NAVIGATION AERIENNE\b/
    ];

    for (const rx of knownPatterns) {
      if (rx.test(norm)) return line.trim();
    }
    return null;
  }

  function parseSofiaNotams(fullText) {
    const lines = String(fullText || "").split(/\r?\n/);
    let currentHeader = "RESTRICTIONS DE L'ESPACE AÉRIEN";
    const headersFound = new Set();
    const notams = [];
    let current = null;

    const flushNotam = () => {
      if (!current) return;
      const eText = current.bodyLines.join("\n").trim();
      const supRefs = extractSupaipRefs(`${current.id} ${eText}`);
      const isTrigger = /\bNOTAM\s+TRIGGER\b/i.test(eText) || /\bTRIGGER\b/i.test(current.rawHeaderLine || "");

      const keysSet = new Set((supRefs || []).map((r) => r.key));
      const openAirZones = extractOpenAirZonesForNotam(current.id, keysSet);

      notams.push({
        id: current.id,
        header: current.header,
        qLine: current.qLine || "",
        qInfo: current.qInfo,
        radiusNm: current.qInfo ? current.qInfo.radiusNm : null,
        lat: current.qInfo ? current.qInfo.lat : null,
        lon: current.qInfo ? current.qInfo.lon : null,
        eText,
        eHtml: injectSupaipLinksHtml(eText),
        supRefs,
        isTrigger,
        openAirZones,
        hasOpenAir: openAirZones.length > 0
      });
      current = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const maybeHeader = detectHeaderLine(line);
      if (maybeHeader) {
        flushNotam();
        currentHeader = maybeHeader;
        headersFound.add(currentHeader);
        continue;
      }

      const idMatch = line.match(/\b([A-Z]{4}-[A-Z]\d{4}\/\d{2})\b/);
      if (idMatch && (!current || !line.startsWith("E)"))) {
        flushNotam();
        headersFound.add(currentHeader);
        current = {
          id: idMatch[1].toUpperCase(),
          header: currentHeader,
          rawHeaderLine: line,
          qLine: "",
          qInfo: null,
          bodyLines: []
        };
        continue;
      }

      if (!current) continue;

      if (/(?:^|\s)Q\)\s*/i.test(line)) {
        const parsedQ = parseQLine(line);
        if (parsedQ) {
          current.qInfo = parsedQ;
        }
        current.qLine = line;
        current.bodyLines.push(line);
      } else {
        current.bodyLines.push(line);
      }
    }
    flushNotam();

    for (const kh of KNOWN_SOFIA_HEADERS) {
      headersFound.add(kh);
    }

    return {
      headers: Array.from(headersFound),
      notams
    };
  }

  function filterBriefingItems({ notams, selectedHeaders, standaloneSupAips = [] }) {
    const activeHeaders = selectedHeaders instanceof Set ? selectedHeaders : new Set(selectedHeaders || []);

    const triggeredSupKeys = new Set();
    for (const n of notams || []) {
      if (n.isTrigger && Array.isArray(n.supRefs)) {
        for (const ref of n.supRefs) {
          triggeredSupKeys.add(ref.key);
        }
      }
    }

    const visibleNotams = (notams || []).filter((n) => {
      if (!activeHeaders.has(n.header)) return false;

      if (n.requiresTrigger && Array.isArray(n.supRefs) && n.supRefs.length > 0) {
        return n.supRefs.some((ref) => triggeredSupKeys.has(ref.key));
      }

      return true;
    });

    const visibleStandaloneSupAips = (standaloneSupAips || []).filter((sup) => {
      if (sup.hasNotamTrigger) {
        const key = normalizeSupKey(sup.num, sup.year);
        return triggeredSupKeys.has(key);
      }
      return true;
    });

    return {
      visibleNotams,
      visibleStandaloneSupAips,
      triggeredSupKeys: Array.from(triggeredSupKeys)
    };
  }

  function formatDurationLabel(hhmm) {
    const clean = String(hhmm || "").trim();
    if (/^\d{4}$/.test(clean)) {
      const h = parseInt(clean.slice(0, 2), 10);
      const m = parseInt(clean.slice(2, 4), 10);
      return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h} heures`;
    }
    return clean || "—";
  }

  function formatDateAndTimeFromSofia(dtStr) {
    const m = String(dtStr || "").match(/(\d{2})[-\/](\d{2})[-\/](\d{4})\s+(\d{2}):(\d{2})/);
    if (!m) return { date: "—", time: "—" };
    return {
      date: `${m[1]}/${m[2]}/${m[3]}`,
      time: `${m[4]}h${m[5]}`
    };
  }

  function buildPxadelSummary(params, visibleNotams, userComment = "") {
    const dep = (params.departure || "—").toUpperCase();
    const dest = (params.destination || "—").toUpperCase();
    const waypoints = (params.waypoints || [])
      .map((c) => String(c || "").trim().toUpperCase())
      .filter((c) => c && c !== "—");

    const turningPointsLabel = waypoints.length
      ? ` (points de contournement : ${waypoints.join(", ")})`
      : ` (sans point de contournement)`;

    const axisLabel =
      dep !== "—" && dest !== "—" ? `${dep} – ${dest}${turningPointsLabel}` : "Trajet SOFIA";

    const depDt = formatDateAndTimeFromSofia(params.plannedDeparture);
    const genDt = formatDateAndTimeFromSofia(params.generatedAt);
    const durationLabel = formatDurationLabel(params.duration);

    const corridorTotalNm = (Number(params.halfCorridorNm) || 15) * 2;
    const ceilingFt = (Number(params.ceilingFl) || 60) * 100;
    const ceilingMeters = Math.round(ceilingFt * 0.3048);

    const restrictionNotams = (visibleNotams || []).filter((n) =>
      normalizeHeaderKey(n.header).includes("RESTRICTIONS DE L'ESPACE AERIEN") ||
      normalizeHeaderKey(n.header).includes("RESTRICTIONS DE L’ESPACE AERIEN")
    );

    const lines = [
      "Briefing PXADEL",
      `Pour la Journée du ${depDt.date} à partir de ${depDt.time} heures pour ${durationLabel} sur l’axe ${axisLabel} avec un couloir de ${corridorTotalNm} MN et un plafond ${ceilingFt} Ft (soit ${ceilingMeters} mètres)`,
      "",
      `Nombre de NOTAM Restrictions Espaces Aériens : ${restrictionNotams.length}`,
      ""
    ];

    if (restrictionNotams.length === 0) {
      lines.push("Aucune restriction d'espace aérien active.");
    } else {
      for (const n of restrictionNotams) {
        const firstLine = (n.eText || "").split(/\r?\n/)[0] || "";
        lines.push(`- ${n.id}${firstLine ? ` : ${firstLine}` : ""}`);
      }
    }

    if (userComment && userComment.trim()) {
      lines.push("", `Commentaire : ${userComment.trim()}`);
    }

    lines.push(
      "",
      `Le fichier SOFIA Briefing a été généré à ${genDt.date} à ${genDt.time} (heure locale).`
    );

    return lines.join("\n");
  }

  return {
    normalizeHeaderKey,
    normalizeSupKey,
    buildSupaipOfficialUrl,
    injectSupaipLinksHtml,
    extractSupaipRefs,
    parseOpenAirBlockText,
    extractOpenAirZonesForNotam,
    isDefaultSelectedHeader,
    getDefaultSelectedHeaders,
    extractPdfText,
    parsePibParams,
    parseQLine,
    parseSofiaNotams,
    filterBriefingItems,
    buildPxadelSummary
  };
})();
