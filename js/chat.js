/* ==========================================================================
   Concierge: local language understanding + knowledge-grounded replies.
   Understands destinations, food, festivals, weather, transport, permits,
   budgeting and packing; keeps short-term context; links answers to the
   planner and map with rich action cards.
   ========================================================================== */

'use strict';

const Concierge = (() => {

  const state = {
    lastDest: null,
    lastIntent: null,
    lastMonth: null,
    lastDays: null,
    greeted: false
  };

  /* ------------------------------ small helpers ------------------------- */

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const monthFromText = t => {
    const names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const short = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
    if (short) return names.indexOf(short[1].toLowerCase()) + 1;
    return null;
  };

  const daysFromText = t => {
    const m = t.match(/(\d+)\s*(?:day|days|night|nights)\b/i);
    if (m) return Math.min(10, Math.max(1, parseInt(m[1], 10)));
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, week: 7 };
    for (const [w, n] of Object.entries(words)) {
      if (new RegExp(`\\b${w}\\s*(day|night|week)?s?\\b`, 'i').test(t)) return n;
    }
    return null;
  };

  function findDestination(text) {
    const q = Engine.norm(text);
    if (!q) return null;
    let best = null, bestScore = 0;
    for (const d of KB.destinations) {
      const names = [d.name, ...(d.aliases || [])].map(Engine.norm);
      for (const n of names) {
        let s = 0;
        if (q === n) s = 1;
        else if (q.includes(n) && n.length >= 4) s = 0.95 - (q.length - n.length) / (q.length * 4);
        else if (n.includes(q) && q.length >= 4) s = 0.7;
        else {
          for (const w of n.split(' ')) {
            if (w.length >= 5 && q.includes(w)) { s = Math.max(s, 0.65); }
            if (w.length >= 5 && q.split(' ').some(qw => qw.length >= 4 && Engine.levenshtein(qw, w) <= 2)) {
              s = Math.max(s, 0.6);
            }
          }
        }
        if (s > bestScore) { bestScore = s; best = d; }
      }
    }
    return bestScore > 0.55 ? best : null;
  }

  function findFood(text) {
    const q = Engine.norm(text);
    let best = null, bs = 0;
    for (const f of KB.foods) {
      for (const n of [f.name, ...f.aliases].map(Engine.norm)) {
        let s = 0;
        if (q === n) s = 1; else if (q.includes(n) && n.length >= 4) s = 0.9;
        if (s > bs) { bs = s; best = f; }
      }
    }
    return bs > 0.6 ? best : null;
  }

  function findFestival(text) {
    const q = Engine.norm(text);
    let best = null, bs = 0;
    for (const f of KB.festivals) {
      for (const n of [f.name, ...f.aliases].map(Engine.norm)) {
        let s = 0;
        if (q === n) s = 1; else if (q.includes(n) && n.length >= 4) s = 0.9;
        if (s > bs) { bs = s; best = f; }
      }
    }
    return bs > 0.6 ? best : null;
  }

  /* ------------------------------ cards --------------------------------- */

  function destCard(d, extra = '') {
    return `
      <div class="chat-card">
        <div class="chat-card-title">${esc(d.name)}</div>
        <div class="chat-card-meta">${esc(d.district)} · ${esc(d.cost)} · best ${monthList(d.bestMonths)}</div>
        <p class="chat-card-body">${esc(d.blurb)}</p>
        ${extra}
        <div class="chat-actions">
          <button class="chip-btn" data-cx="trip" data-id="${d.id}">Add to my trip</button>
          <button class="chip-btn ghost" data-cx="open" data-id="${d.id}">Full details</button>
          <button class="chip-btn ghost" data-cx="weather" data-id="${d.id}">Weather there now</button>
        </div>
      </div>`;
  }

  function monthList(months) {
    if (!months || months.length === 12) return 'all year';
    const parts = [];
    let run = [];
    const sorted = [...months].sort((a, b) => a - b);
    for (const m of sorted) {
      if (run.length && m === run[run.length - 1] + 1) run.push(m);
      else { if (run.length) parts.push(run); run = [m]; }
    }
    if (run.length) parts.push(run);
    return parts.map(p => p.length > 2
      ? `${KB.climate.labels[p[0] - 1]}–${KB.climate.labels[p[p.length - 1] - 1]}`
      : p.map(m => KB.climate.labels[m - 1]).join(', ')).join(', ');
  }

  const W_ICON = { sun: '☀️', partly: '🌤️', cloud: '☁️', rain: '🌧️', storm: '⛈️', fog: '🌫️', snow: '❄️' };

  async function weatherReply(d) {
    try {
      const w = await Engine.fetchWeather(d.coords[0], d.coords[1]);
      const [label, icon] = Engine.wmo(w.current.weather_code);
      const today = Engine.todayISO();
      const wd = Engine.weatherByDate(w, today);
      return `
        <p>Right now in <strong>${esc(d.name)}</strong>: <strong>${Math.round(w.current.temperature_2m)}°C</strong>,
        ${label.toLowerCase()} ${W_ICON[icon] || ''}, humidity ${Math.round(w.current.relative_humidity_2m)}%,
        wind ${Math.round(w.current.wind_speed_10m)} km/h.</p>
        ${wd ? `<p>Today ranges <strong>${Math.round(wd.tmin)}–${Math.round(wd.tmax)}°C</strong> with a
        ${wd.pop == null ? '—' : wd.pop}% chance of rain. Sunrise ${wd.sunrise.slice(11, 16)}, sunset ${wd.sunset.slice(11, 16)}.</p>` : ''}
        ${d.bestMonths ? `<p class="chat-note">Context: ${d.name} is at its best ${monthList(d.bestMonths)}.</p>` : ''}`;
    } catch {
      return `<p>I couldn't reach the live weather service just now — but I can tell you the seasonal picture: ${esc(d.name)} sits in
        ${esc(d.district)}, where ${monthList(d.bestMonths || [10, 11, 12, 1, 2, 3])} is usually the kindest window.</p>`;
    }
  }

  /* ------------------------------ intent handlers ----------------------- */

  function greeting() {
    return `<p><strong>Sngmba!</strong> 👋 Welcome to Manipur — the jewelled land. I know every lake, fort, festival
      and food worth your time here. Try asking me:</p>
      <div class="chat-actions">
        <button class="chip-btn" data-ask="What is the weather at Loktak Lake right now?">Weather at Loktak now</button>
        <button class="chip-btn" data-ask="Plan a 4 day trip for me">Plan a 4-day trip</button>
        <button class="chip-btn" data-ask="What food should I try?">What should I eat?</button>
        <button class="chip-btn" data-ask="Which festivals are happening soon?">Festivals coming up</button>
      </div>`;
  }

  function handleItinerary(t, m) {
    const days = daysFromText(t) || state.lastDays;
    const month = monthFromText(t) || state.lastMonth;
    const d = findDestination(t);
    const interests = [];
    if (/trek|hike|valley of flowers|dzuko/.test(t)) interests.push('trekking', 'adventure');
    if (/lake|loktak|boat/.test(t)) interests.push('lakes');
    if (/food|cuisine|eat/.test(t)) interests.push('food', 'markets');
    if (/fort|history|heritage|war|kangla/.test(t)) interests.push('heritage');
    if (/festival|dance|culture/.test(t)) interests.push('culture');
    if (/wildlife|deer|sangai|bird/.test(t)) interests.push('wildlife');
    if (/cave|adventure/.test(t)) interests.push('adventure');
    if (/village|craft|loom|pottery|handloom/.test(t)) interests.push('crafts', 'villages');

    if (d && !days) {
      state.lastDest = d.id;
      return `<p>${esc(d.name)} deserves at least
        <strong>${d.durationHrs >= 20 ? Math.ceil(d.durationHrs / 20) + '–' + (Math.ceil(d.durationHrs / 20) + 1) + ' days' : 'a good half-day'}</strong>.
        Tell me how many days you have in Manipur overall and I'll weave it into a full plan — for example
        <em>"${d.durationHrs >= 20 ? 4 : 3} days including ${esc(d.name.split('&')[0].trim())}"</em>.</p>`;
    }

    if (!days) {
      state.lastIntent = 'itinerary';
      return `<p>Happy to build your route. How many days do you have, and what pulls you here —
        lakes, treks, heritage, food, festivals? Even a rough line like <em>"3 days, lakes and food"</em> works.</p>`;
    }

    state.lastDays = days;
    state.lastMonth = month;
    const plan = Engine.generateItinerary({
      days,
      pace: /relax|slow|easy/.test(t) ? 'relaxed' : /packed|all|maximum|see everything/.test(t) ? 'packed' : 'balanced',
      interests: interests.length ? interests : [],
      month: month || undefined,
      mustInclude: d ? [d.id] : []
    });
    const stopCount = plan.reduce((s, day) => s + day.stops.length, 0);
    const top = plan.map(dp => `<li><strong>Day ${dp.day} — ${esc(dp.sectorLabel)}:</strong> ${dp.stops.map(s => esc(s.name)).join(' → ')}</li>`).join('');
    return `
      <p>Here's a ${days}-day shape for you${month ? ` in ${KB.climate.labels[month - 1]}` : ''}${d ? `, anchored on ${esc(d.name)}` : ''} —
      ${stopCount} stops, routed so you double back as little as possible:</p>
      <ul class="chat-list">${top}</ul>
      <div class="chat-actions">
        <button class="chip-btn" data-cx="plan" data-days="${days}" ${month ? `data-month="${month}"` : ''}>Open the full plan with timings</button>
      </div>
      <p class="chat-note">I've kept ${/relax|slow/.test(t) ? 'a relaxed' : 'a balanced'} pace — you can retune it in the Trip Studio.</p>`;
  }

  function handleWeather(t) {
    const d = findDestination(t) || (state.lastDest ? KB.destinations.find(x => x.id === state.lastDest) : null);
    if (!d) {
      state.lastIntent = 'weather';
      return `<p>Which place — Loktak, Ukhrul, Moreh, Dzükou? Name it and I'll pull the live conditions.</p>`;
    }
    state.lastDest = d.id;
    state.lastIntent = 'weather';
    return weatherReply(d);
  }

  function handleDestination(d, t) {
    state.lastDest = d.id;
    const m = monthFromText(t);
    const best = monthList(d.bestMonths || []);
    const { km, mins } = Engine.driveMinutes(Engine.IMPHAL, d.coords, d.sector);
    const openNow = m && d.bestMonths && !d.bestMonths.includes(m);
    return `<p>${esc(d.desc ? d.desc.split('.')[0] + '.' : d.blurb)}</p>
      ${destCard(d, `<p class="chat-note">From Imphal: ≈${Math.round(km)} km · ${Engine.fmtHrs(mins)} drive · best time ${best}${openNow ? ' — worth knowing if you\'re travelling in ' + KB.climate.labels[m - 1] : ''}</p>`)}`;
  }

  function handleFood(t) {
    const f = findFood(t);
    if (f) {
      const vegBadge = f.veg === 'veg' ? 'vegetarian' : f.veg === 'nonveg' ? 'non-vegetarian' : 'vegetarian or with fish';
      return `<p><strong>${esc(f.name)}</strong> — ${esc(f.blurb)}</p>
        <p class="chat-note">${vegBadge.charAt(0).toUpperCase() + vegBadge.slice(1)} · spice: ${esc(f.spice)} · find it: ${esc(f.where)}</p>`;
    }
    if (/vegetarian|veg/.test(t)) {
      const vegs = KB.foods.filter(f => f.veg !== 'nonveg').slice(0, 5);
      return `<p>Manipur is wonderful for vegetarians — the valley's Vaishnav tradition and the hills' produce culture see to that. Start with:
        ${vegs.map(v => `<strong>${esc(v.name)}</strong>`).join(', ')}. Singju and chak-hao kheer alone are worth the flight.</p>`;
    }
    return `<p>Eat broadly — that's the best advice in Manipur. The essential seven:
      <strong>eromba</strong> (the fiery mash), <strong>nga-thongba</strong> (lake fish curry), <strong>singju</strong> (the great salad),
      <strong>chak-hao kheer</strong> (black-rice pudding), <strong>chamthong</strong> (the herby stew),
      <strong>keli chana</strong> (street-side chickpeas) and <strong>paknam</strong> steamed in banana leaf.
      The breakfast stalls at Ima Keithel are the finest classroom.</p>
      <div class="chat-actions"><button class="chip-btn" data-cx="goto" data-view="food">Open the food guide</button></div>`;
  }

  function handleFestival(t) {
    const f = findFestival(t);
    if (f) {
      state.lastMonth = f.months[0];
      return `<p><strong>${esc(f.name)}</strong> — ${esc(f.window)}.</p><p>${esc(f.desc)}</p>
        <p class="chat-note">Where: ${esc(f.place)}</p>`;
    }
    const now = Engine.monthNow();
    const near = Engine.festivalsNear(now);
    const label = KB.climate.labels[now - 1];
    return `<p>Right around now (${label}) the calendar carries: ${near.map(x => `<strong>${esc(x.name)}</strong> (${esc(x.window)})`).join(' · ')}.
      The two anchors of the year are <strong>Sangai Festival</strong> (Nov 21–30, Imphal) and <strong>Yaoshang</strong> (Feb–Mar, valley-wide).</p>
      <div class="chat-actions"><button class="chip-btn" data-cx="goto" data-view="festivals">See the festival calendar</button></div>`;
  }

  function handleReach(t) {
    const d = findDestination(t);
    if (d && d.id !== 'kangla') {
      const { km, mins } = Engine.driveMinutes(Engine.IMPHAL, d.coords, d.sector);
      return `<p><strong>${esc(d.name)}</strong> is about <strong>${Math.round(km)} km</strong> from Imphal —
        figure <strong>${Engine.fmtHrs(mins)}</strong> by road in normal conditions${['northeast', 'northwest'].includes(d.sector) ? '. Hill roads: start by 8 am and you\'ll be glad you did' : ''}.
        Day-hire cabs from the Paona Bazar stands are the standard way; shared tempos run it cheaper.</p>`;
    }
    const rows = KB.gatewayDistances.map(g => `<li><strong>${esc(g.from)} → Imphal:</strong> ${esc(g.km)}</li>`).join('');
    return `<p>Most visitors fly into <strong>Imphal (IMF)</strong> — daily connections from Delhi, Kolkata, Guwahati and Agartala.
      By road, the classic approach is NH-2 from <strong>Dimapur</strong> (215 km, 6–8 h of mountain driving).</p>
      <ul class="chat-list">${rows}</ul>
      <p class="chat-note">Remember the Inner Line Permit for Indian citizens — apply online before you fly.</p>`;
  }

  function handlePermit() {
    return `<p><strong>Inner Line Permit (ILP):</strong> Indian citizens need one to enter Manipur — apply on the
      official state ILP portal, carry the printout plus photo ID; highway checkpoints are routine.</p>
      <p><strong>Foreign nationals:</strong> complete normal immigration on arrival and check the current rules for
      restricted border areas before heading east (Moreh) or north (Mao).</p>
      <p class="chat-note">The permit is quick online — do it before your flight, not after.</p>`;
  }

  function handleSafety() {
    return `<p>A few honest notes: check the latest official advisory before travelling, as conditions in some
      districts can change; keep hill drives to daylight; use registered guides for Dzükou, Tharon and Khangkhui;
      carry your ILP and ID.</p><p>Save <strong>112</strong> — the single national emergency line for police, fire and medical.
      Imphal itself is calm and easy to walk; the hills reward preparation.</p>`;
  }

  function handleStay(t) {
    const d = findDestination(t);
    if (d) {
      const area = d.sector;
      const match = {
        south: 'stay-floating', northeast: 'stay-ukhrul', northwest: 'stay-tamenglong',
        north: 'stay-mao', east: 'stay-city', city: 'stay-city'
      }[area];
      const s = KB.stays.find(x => x.id === match) || KB.stays[1];
      return `<p>For ${esc(d.name)}, I'd look at <strong>${esc(s.name)}</strong> — ${esc(s.where)}.
        Around <strong>${esc(s.price)}</strong>. ${esc(s.blurb)}</p>`;
    }
    const list = KB.stays.map(s => `<li><strong>${esc(s.name)}</strong> · ${esc(s.where)} · ${esc(s.price)}</li>`).join('');
    return `<p>Manipur stays small and personal — homestays over hotels, especially outside Imphal:</p>
      <ul class="chat-list">${list}</ul>
      <p class="chat-note">One night on a floating homestay at Karang is the stay people talk about for years.</p>`;
  }

  function handleBudget(t) {
    const days = daysFromText(t) || state.lastDays || 4;
    const b = /cheap|lean|budget|backpack/.test(t) ? 'lean' : /luxur|premium|best/.test(t) ? 'premium' : 'comfort';
    const opt = KB.budgetOptions.find(o => o.id === b);
    const total = opt.perDay * days;
    return `<p>At a <strong>${esc(opt.label.toLowerCase())}</strong> style — ${esc(opt.hint)} — figure roughly
      <strong>₹${opt.perDay.toLocaleString('en-IN')}</strong> per person per day covering stay, food and local transport.</p>
      <p>For <strong>${days} days</strong> that's about <strong>₹${total.toLocaleString('en-IN')}</strong> per person,
      excluding flights. The Trip Studio builds a full estimate into your plan.</p>
      <div class="chat-actions"><button class="chip-btn" data-cx="goto" data-view="plan">Open the Trip Studio</button></div>`;
  }

  function handlePack(t) {
    const m = monthFromText(t) || state.lastMonth || Engine.monthNow();
    const rain = KB.climate.rain[m - 1];
    const [lo, hi] = KB.climate.valleyTemp[m - 1];
    const items = [
      'light cottons for the day',
      `a warm layer for evenings (valley nights run ${lo}°C in ${KB.climate.labels[m - 1]}, colder on the hills)`,
      rain === 'monsoon' ? 'proper rain gear — this is the monsoon, and it commits fully' : 'a light windcheater for the lake and ridges',
      'walking shoes with grip — temple steps, boat jetties and hill trails',
      'sun protection; the valley sun at 800 m is honest',
      'cash for the hills, torch for caves, and your ILP printout'
    ];
    return `<p>For ${KB.climate.labels[m - 1]} (valley typically ${lo}–${hi}°C): ${items.map(i => esc(i)).join('; ')}.</p>`;
  }

  function handleBestTime(t) {
    const d = findDestination(t);
    if (d && d.bestMonths) {
      return `<p><strong>${esc(d.name)}</strong> shines ${monthList(d.bestMonths)}.
        ${esc(d.tips || '')}</p>`;
    }
    return `<p>October to March is the classic window — clear skies, festivals stacking up (Mera Houchongba, Ningol Chakouba,
      Kut, then Sangai Festival), and Loktak at its loveliest. May belongs to the Shirui lily in Ukhrul; the monsoon
      (June–September) turns Dzükou into a valley of flowers if you don't mind real rain.</p>`;
  }

  function handlePolo() {
    return `<p>Manipur is the birthplace of polo — <em>sagol kangjei</em> was played by Meitei cavalry centuries before
      the world heard of it. The oldest living ground is <strong>Mapal Kangjeibung</strong> in Imphal; winter tournaments
      run November–February, and Sangai Festival hosts international matches.</p>
      <div class="chat-actions"><button class="chip-btn" data-cx="trip" data-id="polo-ground">Add the polo ground to my trip</button></div>`;
  }

  function fallback(t) {
    const d = findDestination(t);
    if (d) return handleDestination(d, t);
    const results = Engine.searchAll(t).filter(r => r.kind !== 'experience');
    if (results.length) {
      const r = results[0];
      if (r.kind === 'food') return handleFood(t);
      if (r.kind === 'festival') return handleFestival(t);
    }
    return `<p>I'm sharpest on Manipur itself — places to go, what's on when, food, stays, permits, the roads, the weather.
      Ask me something like <em>"Is Ukhrul worth two days?"</em>, <em>"What's on in November?"</em> or
      <em>"How do I reach Moreh?"</em></p>`;
  }

  /* ------------------------------ router -------------------------------- */

  async function respond(text) {
    const t = text.toLowerCase();
    state.greeted = true;

    const m = monthFromText(t) || undefined;

    // follow-up: user answered a question with just a month or number
    if (state.lastIntent === 'itinerary' && (daysFromText(t) || m)) {
      state.lastIntent = null;
      return handleItinerary(t, m);
    }

    if (/^(hi|hii+|hello|hey|namaste|sngmba|snnmba|good (morning|afternoon|evening))\b/.test(t)) {
      return greeting();
    }
    if (/\b(thank|thanks|shukriya|great|awesome|lovely|perfect)\b/.test(t)) {
      return `<p>With pleasure. The lake is waiting — anything else, I'm here.</p>`;
    }

    if (/(weather|temperature|forecast|raining|rain today|hot|cold right|climate now|humidity)/.test(t)) {
      return handleWeather(t);
    }
    if (/(plan|itinerary|trip|route|schedule|days?\b|night?s?\b in)/.test(t) && (daysFromText(t) || /plan|itinerar|route|schedule/.test(t))) {
      return handleItinerary(t, m);
    }
    if (/(permit|ilp|pap|inner line|document)/.test(t)) return handlePermit();
    if (/(safe|safety|advisory|danger|night travel|risk)/.test(t)) return handleSafety();
    if (/(pack|bring|wear|clothes|luggage|what to carry)/.test(t)) return handlePack(t);
    if (/(best time|when (should|to) (visit|go)|which month|season)/.test(t)) return handleBestTime(t);
    if (/(reach|get to|getting there|how to go|flight|flights|airport|train|railway|bus|road from|distance)/.test(t)) return handleReach(t);
    if (/(stay|hotel|homestay|accommodat|room|lodge|where to sleep)/.test(t)) return handleStay(t);
    if (/(cost|budget|expensive|cheap|price|money|how much)/.test(t)) return handleBudget(t);
    if (/(polo|sagol kangjei)/.test(t)) return handlePolo();
    if (/(festival|event|celebrat|yaoshang|sangai fest|kut|cheiraoba|lui|ningol|gaan|chumpha|lai haraoba|mera)/.test(t)) return handleFestival(t);
    if (/(eat|food|dish|cuisine|restaurant|hungry|meal|breakfast|lunch|dinner|try local)/.test(t)) return handleFood(t);

    const d = findDestination(t);
    if (d) return handleDestination(d, t);

    return fallback(t);
  }

  return { respond, state, W_ICON, greeting };
})();
