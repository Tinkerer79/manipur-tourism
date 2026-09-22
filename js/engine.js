/* ==========================================================================
   Engine: scoring, fuzzy search, geo math, live weather, exports, sharing
   ========================================================================== */

'use strict';

const Engine = (() => {

  /* ------------------------------ utilities ----------------------------- */

  const norm = s => (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m || !n) return m + n;
    let prev = new Array(n + 1), cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const monthNow = () => new Date().getMonth() + 1;

  function fmtHrs(mins) {
    const m = Math.round(mins);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} m` : `${h} h`;
  }

  /* ------------------------------ fuzzy search -------------------------- */

  function fieldScore(q, text) {
    if (!q || !text) return 0;
    const t = norm(text);
    if (!t) return 0;
    if (t === q) return 1.0;
    if (t.startsWith(q)) return 0.9;
    if (t.includes(q)) return 0.75;
    const words = t.split(' ');
    for (const w of words) {
      if (w.startsWith(q)) return 0.7;
      if (q.length >= 5 && levenshtein(q, w) <= 2) return 0.55;
      if (q.length >= 3 && w.length >= 3 && w.startsWith(q.slice(0, 3))) return 0.35;
    }
    return 0;
  }

  function searchDestinations(q, limit = 8) {
    const nq = norm(q);
    if (!nq) return [];
    const scored = KB.destinations.map(d => {
      let s = 0;
      s = Math.max(s, fieldScore(nq, d.name) * 1.0);
      for (const a of (d.aliases || [])) s = Math.max(s, fieldScore(nq, a) * 0.95);
      s = Math.max(s, fieldScore(nq, d.district) * 0.5);
      for (const tag of (d.interests || [])) s = Math.max(s, fieldScore(nq, tag.replace(/-/g, ' ')) * 0.35);
      s = Math.max(s, fieldScore(nq, d.blurb) * 0.3);
      return { d, s };
    }).filter(x => x.s > 0.3);
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, limit).map(x => ({ ...x.d, score: x.s }));
  }

  function searchAll(q) {
    const nq = norm(q);
    if (!nq) return [];
    const results = [];
    for (const d of KB.destinations) {
      let s = fieldScore(nq, d.name);
      for (const a of (d.aliases || [])) s = Math.max(s, fieldScore(nq, a) * 0.95);
      s = Math.max(s, fieldScore(nq, d.district) * 0.5);
      if (s > 0.3) results.push({ kind: 'destination', item: d, score: s });
    }
    for (const f of KB.foods) {
      let s = fieldScore(nq, f.name);
      for (const a of f.aliases) s = Math.max(s, fieldScore(nq, a) * 0.9);
      if (s > 0.3) results.push({ kind: 'food', item: f, score: s });
    }
    for (const f of KB.festivals) {
      let s = fieldScore(nq, f.name);
      for (const a of f.aliases) s = Math.max(s, fieldScore(nq, a) * 0.9);
      if (s > 0.3) results.push({ kind: 'festival', item: f, score: s });
    }
    for (const e of KB.experiences) {
      let s = fieldScore(nq, e.name);
      for (const a of e.aliases) s = Math.max(s, fieldScore(nq, a) * 0.9);
      if (s > 0.3) results.push({ kind: 'experience', item: e, score: s });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  /* ------------------------------ scoring ------------------------------- */

  function scoreDestination(d, prefs) {
    if (!prefs) return { score: 0.5, reasons: [] };
    let score = 0;
    const reasons = [];
    const interests = prefs.interests || [];
    if (interests.length) {
      const hits = (d.interests || []).filter(i => interests.includes(i));
      const hitFrac = hits.length / interests.length;
      score += 0.55 * Math.min(1, hits.length / Math.min(3, interests.length)) + 0.1 * hitFrac;
      if (hits.length) reasons.push(`matches your interest in ${hits.slice(0, 2).map(hintLabel).join(' & ')}`);
    } else {
      score += 0.25;
    }
    if (prefs.month && (d.bestMonths || []).includes(prefs.month)) {
      score += 0.2;
      reasons.push(`at its best in ${KB.climate.labels[prefs.month - 1]}`);
    }
    if (prefs.difficulty && d.difficulty === prefs.difficulty) score += 0.08;
    if (prefs.cost && d.cost === prefs.cost) score += 0.05;
    if (prefs.mustInclude && prefs.mustInclude.includes(d.id)) {
      score = 1.01;
      reasons.unshift('picked by you');
    }
    // gentle nudge toward variety across sectors
    score += Math.random() * 0.04;
    return { score, reasons };
  }

  function hintLabel(id) {
    const i = KB.interests.find(x => x.id === id);
    return i ? i.label.replace(/s$/, '').toLowerCase() : id;
  }

  function recommend(prefs, limit = 6, excludeIds = []) {
    const ranked = KB.destinations
      .filter(d => !excludeIds.includes(d.id))
      .map(d => ({ ...scoreDestination(d, prefs), d }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return ranked;
  }

  function personaFor(interests) {
    const n = (interests || []).length;
    let p = KB.personas[0];
    for (const cand of KB.personas) if (n >= cand.min) p = cand;
    return p;
  }

  /* ------------------------------ geo & routing ------------------------- */

  function haversineKm(a, b) {
    const R = 6371, toR = x => x * Math.PI / 180;
    const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  const IMPHAL = KB.destinations.find(d => d.id === 'kangla').coords;

  function driveMinutes(from, to, sector) {
    const km = haversineKm(from, to) * KB.roadFactor;
    const speed = (KB.sectors[sector] || {}).speed || 38;
    return { km, mins: (km / speed) * 60 };
  }

  function nearestNeighbourOrder(start, stops, coordOf) {
    const order = [];
    const pool = [...stops];
    let cur = start;
    while (pool.length) {
      let bi = 0, bd = Infinity;
      pool.forEach((s, i) => {
        const dd = haversineKm(cur, coordOf(s));
        if (dd < bd) { bd = dd; bi = i; }
      });
      cur = coordOf(pool[bi]);
      order.push(pool.splice(bi, 1)[0]);
    }
    return order;
  }

  /* ------------------------------ itinerary ----------------------------- */

  function generateItinerary(opts) {
    const days = opts.days;
    const pace = opts.pace || 'balanced';
    const stopsPerDay = pace === 'relaxed' ? 2 : pace === 'packed' ? 4 : 3;
    const prefs = {
      interests: opts.interests || [],
      month: opts.month,
      mustInclude: opts.mustInclude || []
    };

    // Score the whole pool once.
    const scored = KB.destinations.map(d => ({ ...scoreDestination(d, prefs), d }))
      .sort((a, b) => b.score - a.score);

    // Bucket destinations by sector, keeping score order within each bucket.
    const bySector = {};
    for (const c of scored) {
      (bySector[c.d.sector] = bySector[c.d.sector] || []).push(c.d);
    }
    // A sector is viable for this trip length if its best stop fits.
    const overnightSectors = new Set(['northeast', 'northwest']);
    const viable = Object.keys(bySector).filter(sec => {
      const best = bySector[sec][0];
      if (!best) return false;
      if (overnightSectors.has(sec) && best.durationHrs >= 20 && days <= 1) return false;
      if (sec === 'northwest' && days <= 2) return false; // too far for short trips
      return true;
    });

    // Weight each sector by its destinations' scores to decide how many days it gets.
    const weight = {};
    for (const sec of viable) {
      weight[sec] = bySector[sec].slice(0, stopsPerDay).reduce((s, d) => s + d.score, 0);
      if (overnightSectors.has(sec)) weight[sec] *= 1.35; // signature overnight experiences
    }
    viable.sort((a, b) => weight[b] - weight[a]);

    // Assign sectors to days: each viable sector ≥1 day, leftovers round-robin
    // by weight. Short trips (≤2 days) blend Imphal city with the lake belt —
    // they sit 45 minutes apart and belong together.
    const scoreOf = {};
    for (const c of scored) scoreOf[c.d.id] = c.score;

    const daySectors = [];
    if (days <= 2) {
      const blendStops = [...(bySector.city || []), ...(bySector.south || [])]
        .sort((a, b) => (scoreOf[b.id] || 0) - (scoreOf[a.id] || 0));
      if (blendStops.length) {
        bySector.valley = blendStops;
        for (let i = 0; i < days; i++) daySectors.push('valley');
      } else {
        for (let i = 0; i < days; i++) daySectors.push(viable[0] || 'city');
      }
    } else {
      const picks = [...viable];
      while (picks.length < days) {
        picks.push(viable.length ? picks[picks.length % viable.length] : 'city');
      }
      const assigned = picks.slice(0, days);
      // arrival day belongs to the city when the city is on the list
      const cityIdx = assigned.indexOf('city');
      if (cityIdx > 0) { assigned.splice(cityIdx, 1); assigned.unshift('city'); }
      daySectors.push(...assigned);
    }

    const dayPlan = [];
    let dayNo = 0;
    for (const sec of daySectors) {
      const take = (bySector[sec] || []).splice(0, stopsPerDay);
      if (!take.length) {
        // sector exhausted — fall back to whichever sector still has stops
        for (const s of Object.keys(bySector)) {
          if (bySector[s].length) { take.push(bySector[s].shift()); break; }
        }
      }
      if (!take.length) break;
      dayNo++;

      const ordered = nearestNeighbourOrder(IMPHAL, take, d => d.coords);
      const legs = [];
      let cur = IMPHAL, totalKm = 0, totalMins = 0;
      for (const stop of ordered) {
        const leg = driveMinutes(cur, stop.coords, stop.sector);
        legs.push({ to: stop, km: leg.km, mins: leg.mins });
        totalKm += leg.km; totalMins += leg.mins;
        cur = stop.coords;
      }
      const needsReturn = sec !== 'city' && sec !== 'valley';
      const returnHome = needsReturn ? driveMinutes(cur, IMPHAL, sec === 'valley' ? 'south' : sec) : null;
      if (returnHome) { totalKm += returnHome.km; totalMins += returnHome.mins; }

      const label = sec === 'valley' ? 'Imphal & the lake belt'
        : (KB.sectors[sec] || {}).label || sec;

      dayPlan.push({
        day: dayNo,
        sector: sec,
        sectorLabel: label,
        stops: ordered,
        legs,
        totalKm: Math.round(totalKm),
        totalMins: Math.round(totalMins),
        returnToCity: !!returnHome
      });
    }
    return dayPlan;
  }

  /* ------------------------------ weather ------------------------------- */

  const WMO = {
    0: ['Clear sky', 'sun'], 1: ['Mainly clear', 'sun'], 2: ['Partly cloudy', 'partly'], 3: ['Overcast', 'cloud'],
    45: ['Fog', 'fog'], 48: ['Rime fog', 'fog'],
    51: ['Light drizzle', 'rain'], 53: ['Drizzle', 'rain'], 55: ['Dense drizzle', 'rain'],
    56: ['Freezing drizzle', 'rain'], 57: ['Freezing drizzle', 'rain'],
    61: ['Light rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy rain', 'rain'],
    66: ['Freezing rain', 'rain'], 67: ['Freezing rain', 'rain'],
    71: ['Light snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy snow', 'snow'], 77: ['Snow grains', 'snow'],
    80: ['Light showers', 'rain'], 81: ['Showers', 'rain'], 82: ['Violent showers', 'rain'],
    85: ['Snow showers', 'snow'], 86: ['Snow showers', 'snow'],
    95: ['Thunderstorm', 'storm'], 96: ['Storm with hail', 'storm'], 99: ['Storm with hail', 'storm']
  };

  function wmo(code) {
    return WMO[code] || ['—', 'cloud'];
  }

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
      `&timezone=Asia%2FKolkata&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather unavailable');
    const data = await res.json();
    return data;
  }

  async function fetchAir(lat, lon) {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.current || null;
    } catch { return null; }
  }

  function weatherByDate(data, isoDate) {
    if (!data || !data.daily || !data.daily.time) return null;
    const i = data.daily.time.indexOf(isoDate);
    if (i < 0) return null;
    return {
      date: isoDate,
      code: data.daily.weather_code[i],
      tmax: data.daily.temperature_2m_max[i],
      tmin: data.daily.temperature_2m_min[i],
      pop: data.daily.precipitation_probability_max[i],
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i]
    };
  }

  /* ------------------------------ exports ------------------------------- */

  function toICS(plan, baseDate) {
    const dt = d => d.replace(/-/g, '');
    const slotStarts = ['070000', '100000', '140000', '163000'];
    const slotEnds   = ['100000', '130000', '163000', '180000'];
    let out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sana Leibak//Manipur Itineraries//EN'];
    plan.forEach(day => {
      day.stops.forEach((stop, i) => {
        const date = dt(addDays(baseDate, day.day - 1));
        const si = Math.min(i, slotStarts.length - 1);
        out.push('BEGIN:VEVENT');
        out.push(`UID:${Date.now()}-${day.day}-${i}@sanaleibak`);
        out.push(`DTSTART;TZID=Asia/Kolkata:${date}T${slotStarts[si]}`);
        out.push(`DTEND;TZID=Asia/Kolkata:${date}T${slotEnds[si]}`);
        out.push(`SUMMARY:Visit ${stop.name}`);
        out.push(`LOCATION:${stop.name}\\, ${stop.district}\\, Manipur`);
        out.push(`DESCRIPTION:${(stop.blurb || '').replace(/[,;]/g, ' ')}`);
        out.push('END:VEVENT');
      });
    });
    out.push('END:VCALENDAR');
    return out.join('\r\n');
  }

  function addDays(iso, n) {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function encodeTrip(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeTrip(str) {
    try {
      const b = str.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(b))));
    } catch { return null; }
  }

  /* ------------------------------ season helpers ------------------------ */

  function seasonNow(month = monthNow()) {
    const rain = KB.climate.rain[month - 1];
    if (rain === 'monsoon') return { key: 'monsoon', label: 'Monsoon — green and dramatic' };
    if ([11, 12, 1].includes(month)) return { key: 'winter', label: 'Winter — clear skies, festival season' };
    if ([2, 3].includes(month)) return { key: 'spring', label: 'Spring — orchids and Yaoshang colour' };
    if ([4, 5].includes(month)) return { key: 'summer', label: 'Early summer — lily season in the hills' };
    return { key: 'autumn', label: 'Post-monsoon — the finest light of the year' };
  }

  function festivalsNear(month = monthNow()) {
    return KB.festivals.filter(f => f.months.includes(month) || f.months.includes((month % 12) + 1));
  }

  return {
    norm, levenshtein, todayISO, monthNow, fmtHrs,
    searchDestinations, searchAll,
    scoreDestination, recommend, personaFor, hintLabel,
    haversineKm, driveMinutes, IMPHAL, nearestNeighbourOrder,
    generateItinerary,
    WMO, wmo, fetchWeather, fetchAir, weatherByDate,
    toICS, addDays, encodeTrip, decodeTrip,
    seasonNow, festivalsNear
  };
})();
