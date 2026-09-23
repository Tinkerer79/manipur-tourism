(() => {
  const { places, foods, festivals } = window.SANA_DATA;
  const KEYS = window.SANA_KEYS || {};

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const state = {
    saved: JSON.parse(localStorage.getItem('sana-saved') || '[]'),
    interests: new Set(), districts: new Set(), budget: new Set(), month: '',
    food: 'all', chat: [], chatBusy: false, chatRoute: null,
    plan: { interests: new Set(), pace: '', budget: '', arrival: 'city', arrivalTime: '' }
  };

  const byId = id => places.find(p => p.id === id);
  const saveState = () => localStorage.setItem('sana-saved', JSON.stringify(state.saved));

  /* ------------------------------ tiny ui bits --------------------------- */

  function toast(message) {
    const n = document.createElement('div');
    n.className = 'toast';
    n.innerHTML = `<span class="toast-ic">✦</span>${esc(message)}`;
    $('#toasts').append(n);
    requestAnimationFrame(() => n.classList.add('show'));
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 350); }, 2600);
  }

  /* ------------------------------ routing -------------------------------- */

  function go(view) { location.hash = `/${view}`; }

  function route() {
    const view = (location.hash.match(/^#\/(\w+)/) || [, 'home'])[1];
    $$('.view').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    $$('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.nav === view));
    $('#topNav').classList.toggle('on-hero', view === 'home');
    if (view === 'map') renderMap();
    window.scrollTo({ top: 0 });
  }

  /* ------------------------------ cards ---------------------------------- */

  function card(p) {
    const isSaved = state.saved.includes(p.id);
    return `<article class="d-card reveal">
      <button class="save-btn ${isSaved ? 'saved' : ''}" data-save="${p.id}" aria-label="Save ${esc(p.name)}">${isSaved ? '♥' : '♡'}</button>
      <button class="card-open" data-detail="${p.id}">
        <div class="d-card-img"><img src="assets/img/${p.image}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="d-card-body">
          <div class="d-card-meta"><span>${esc(p.district)}</span><span>${esc(p.type)}</span></div>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.blurb)}</p>
          <div class="tag-row">${p.tags.slice(0, 2).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        </div>
      </button>
    </article>`;
  }

  /* ------------------------------ explore -------------------------------- */

  function filtered() {
    const q = $('#exploreSearch').value.trim().toLowerCase();
    return places.filter(p =>
      (!q || `${p.name} ${p.district} ${p.type} ${p.tags.join(' ')} ${p.blurb}`.toLowerCase().includes(q)) &&
      (!state.districts.size || state.districts.has(p.district)) &&
      (!state.interests.size || p.tags.some(t => state.interests.has(t))) &&
      (!state.budget.size || state.budget.has(p.cost)) &&
      (!state.month || p.best.includes('All year') || p.best.includes(state.month)));
  }

  function renderExplore() {
    let list = filtered();
    const sort = $('#exploreSort').value;
    list.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.distance - b.distance);
    $('#exploreCount').textContent = list.length;
    $('#exploreGrid').innerHTML = list.length ? list.map(card).join('')
      : `<div class="empty-state"><strong>No exact matches yet.</strong><p>Try removing a filter or searching a broader term.</p><button class="btn ghost" id="emptyClear">Reset filters</button></div>`;
  }

  function clearFilters() {
    state.districts.clear(); state.interests.clear(); state.budget.clear(); state.month = '';
    $('#exploreSearch').value = '';
    $$('#districtFilters input').forEach(x => x.checked = false);
    $$('#interestFilters .chip-btn, #costFilters .chip-btn').forEach(x => x.classList.remove('on'));
    $('#exploreMonth').value = '';
    renderExplore();
  }

  /* ------------------------------ home ------------------------------------ */

  function renderHome() {
    $('#homeFeatured').innerHTML = [...places].sort((a, b) => a.distance - b.distance).slice(0, 3).map(card).join('');
    $('#homeExperiences').innerHTML = places.filter(p => ['Trek', 'Wildlife', 'Cave', 'Island'].includes(p.type)).slice(0, 3).map(card).join('');
    const m = new Date().toLocaleString('en-US', { month: 'short' });
    $('#seasonBanner').innerHTML = `
      <div><span class="kicker">Season note · ${m}</span><h3>Plan with the season, not against it.</h3>
      <p>Roads and trails change a lot between valley and hills. Check locally before a long drive.</p></div>
      <button class="btn ghost" data-goto="explore">See places</button>`;
  }

  function renderFilters() {
    const districts = [...new Set(places.map(p => p.district))].sort();
    const interests = [...new Set(places.flatMap(p => p.tags))].sort();
    $('#districtFilters').innerHTML = districts.map(d => `<label class="f-check"><input type="checkbox" value="${esc(d)}"> ${esc(d)}</label>`).join('');
    $('#interestFilters').innerHTML = interests.map(v => `<button class="chip-btn" data-interest="${esc(v)}">${esc(v)}</button>`).join('');
    $('#costFilters').innerHTML = ['Budget', 'Mid-range'].map(v => `<button class="chip-btn" data-cost="${v}">${v}</button>`).join('');
    $('#exploreMonth').innerHTML = `<option value="">Any month</option>${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => `<option>${m}</option>`).join('')}`;
  }

  /* ------------------------------ saved trip ------------------------------ */

  function updateSaved() {
    $$('.tripCount').forEach(n => n.textContent = state.saved.length);
    $('#tripList').innerHTML = state.saved.length ? state.saved.map(id => {
      const p = byId(id);
      return `<div class="trip-item"><img src="assets/img/${p.image}" alt=""><div><strong>${esc(p.name)}</strong><span>${esc(p.district)} · ${p.distance} km from Imphal</span></div><button data-save="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button></div>`;
    }).join('') : `<div class="drawer-empty"><span>♡</span><h4>Your trip is waiting</h4><p>Save places from Discover to build a route around them.</p></div>`;
    $('#planMustWrap').innerHTML = state.saved.length
      ? `<div class="must-list">${state.saved.map(id => { const p = byId(id); return `<span class="must-chip">${esc(p.name)} <button data-save="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button></span>`; }).join('')}</div>`
      : `<p class="sub">No places saved yet. Add some from Discover, or just answer the questions and we'll suggest a route.</p>`;
  }

  function toggleSave(id) {
    state.saved = state.saved.includes(id) ? state.saved.filter(v => v !== id) : [...state.saved, id];
    saveState(); updateSaved(); renderExplore(); renderHome();
    toast(state.saved.includes(id) ? 'Added to your trip' : 'Removed from your trip');
  }

  /* ------------------------------ detail modal ---------------------------- */

  function detail(id) {
    const p = byId(id), saved = state.saved.includes(id);
    $('#detailBody').innerHTML = `
      <button class="detail-close" data-close-detail aria-label="Close">✕</button>
      <div class="detail-hero"><img src="assets/img/${p.image}" alt="${esc(p.name)}"></div>
      <div class="detail-copy">
        <span class="kicker">${esc(p.district)} · ${esc(p.type)}</span>
        <h2>${esc(p.name)}</h2>
        <p class="lede">${esc(p.blurb)}</p>
        <div class="detail-info">
          <div><strong>Best time</strong><span>${esc(p.best.includes('All year') ? 'All year' : p.best.join(' · '))}</span></div>
          <div><strong>From Imphal</strong><span>About ${p.distance} km</span></div>
          <div><strong>Good for</strong><span>${esc(p.tags.join(' · '))}</span></div>
        </div>
        <div class="detail-tip"><strong>Helpful note</strong><p>${esc(p.tip)}</p></div>
        <button class="btn primary" data-save="${p.id}">${saved ? '♥ Saved to your trip' : '♡ Save to my trip'}</button>
      </div>`;
    $('#detailOverlay').classList.add('open');
    document.body.classList.add('locked');
  }

  function closeDetail() { $('#detailOverlay').classList.remove('open'); document.body.classList.remove('locked'); }

  /* ------------------------------ food / festivals / travel --------------- */

  function renderFood() {
    const list = state.food === 'all' ? foods : foods.filter(f => f.tag.includes(state.food));
    $('#foodGrid').innerHTML = list.map(f => `
      <article class="food-card">
        <div class="food-icon">${f.icon}</div>
        <div class="food-body">
          <div class="food-top"><h3>${esc(f.name)}</h3><span class="spice">${f.tag.includes('hot') ? '🌶️' : '✦'}</span></div>
          <p>${esc(f.desc)}</p><span class="food-where">${esc(f.where)}</span>
        </div>
      </article>`).join('');
  }

  function nearestFestival() {
    const order = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const nowIdx = new Date().getMonth();
    let best = null, bestGap = 99;
    festivals.forEach(f => {
      const idx = order.indexOf(f.month);
      if (idx < 0) return;
      const gap = (idx - nowIdx + 12) % 12;
      if (gap < bestGap) { bestGap = gap; best = f; }
    });
    return best || festivals[0];
  }

  function renderFestivals() {
    const now = nearestFestival();
    $('#festNow').innerHTML = `<div class="fest-now-inner"><span class="fest-pulse"></span><div><strong>Next up: ${esc(now.name)}</strong><p>${esc(now.desc)}</p></div></div>`;
    const current = new Date().toLocaleString('en-US', { month: 'long' });
    $('#festivalTimeline').innerHTML = festivals.map(f => `
      <article class="fest-card ${f.month === current ? 'soon' : ''}">
        <span class="fest-when">${esc(f.month)}</span>
        <h3>${esc(f.name)}</h3>
        <div class="fest-window">${esc(f.window)}</div>
        <p>${esc(f.desc)}</p>
        <span class="fest-place">⌖ ${esc(f.place)}</span>
      </article>`).join('');
  }

  function renderTravel() {
    const transport = [
      ['✈️', 'By air', 'Imphal International Airport connects the city with major Indian hubs. Confirm current schedules with your airline.'],
      ['🚕', 'By road', 'Shared and private taxis are common for local and inter-district travel. Keep daylight buffer for hill routes.'],
      ['🚌', 'Local movement', 'Use a verified local operator for longer day trips, especially for early starts and return transport.']
    ];
    $('#transportGrid').innerHTML = transport.map(x => `<article class="tr-card"><div class="tr-icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('');
    const stays = [
      ['Imphal', 'City base', 'Convenient for museums, markets and east/west day trips.'],
      ['Moirang / Loktak', 'Lakeside base', 'A calmer option for Loktak and Keibul Lamjao visits.'],
      ['Ukhrul', 'Hill base', 'Stay overnight rather than rushing a hill day trip.']
    ];
    $('#staysGrid').innerHTML = stays.map(x => `<article class="stay-card"><div class="stay-top"><h3>${x[0]}</h3><span class="stay-price">Check locally</span></div><span class="stay-where">${x[1]}</span><p>${x[2]}</p></article>`).join('');
    const essentials = [
      ['🪪', 'Permits', 'Entry rules can vary by nationality and itinerary. Check official, current guidance before booking.'],
      ['🌦️', 'Weather', 'Pack a rain layer and one warm layer; hill conditions can change through the day.'],
      ['🤝', 'Respectful travel', 'Ask before taking close portraits or entering private and sacred spaces.']
    ];
    $('#essentialsGrid').innerHTML = essentials.map(x => `<article class="ess-card"><div class="ess-icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('');
    $('#emergencyList').innerHTML = [['112', 'Emergency response'], ['100', 'Police'], ['108', 'Ambulance']].map(x => `<div class="emg"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');
  }

  /* ------------------------------ map view -------------------------------- */

  function mapMatches(query) {
    const q = query.toLowerCase();
    let base;
    if (/lake|water/.test(q)) base = places.filter(p => ['loktak', 'karang', 'keibul'].includes(p.id));
    else if (/quiet|slow/.test(q)) base = places.filter(p => p.tags.includes('Slow travel') || p.id === 'loktak');
    else if (/walk|hike|trail|hill|outdoor/.test(q)) base = places.filter(p => p.tags.some(t => ['Nature', 'Trekking', 'Adventure'].includes(t)));
    else if (/food|eat/.test(q)) base = places.filter(p => p.tags.some(t => ['Food', 'Culture'].includes(t)));
    else if (/history|fort|museum|culture|market/.test(q)) base = places.filter(p => p.tags.some(t => ['History', 'Culture'].includes(t)));
    else if (/wildlife|animal|deer/.test(q)) base = places.filter(p => p.tags.some(t => ['Wildlife', 'Nature'].includes(t)));
    else base = places;
    return base.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }

  function mapSuggestion(query) {
    const results = mapMatches(query);
    const title = query ? `Ideas for “${esc(query)}”` : 'Tell the guide what kind of day you want';
    $('#mapSuggestion').innerHTML = `<strong>${title}</strong><p>${query ? 'These places are a good starting point. Open one for details or save it for your route.' : 'Try a mood like “quiet lake day”, “food and culture”, or “easy hike”.'}</p>${results.length && query ? `<div class="map-suggestion-actions">${results.map(p => `<button data-detail="${p.id}">${esc(p.name)} <span>→</span></button>`).join('')}</div>` : ''}`;
  }

  function renderMap() {
    const list = filtered();
    $('#mapListCount').textContent = `${list.length} places`;
    $('#mapList').innerHTML = list.map(p => `<button type="button" class="map-item" data-detail="${p.id}"><i class="pin-ic" style="background:var(--teal)"></i><span><strong>${esc(p.name)}</strong><span>${esc(p.district)} · ${p.distance} km</span></span></button>`).join('');
    $('#mapCanvas').innerHTML = `
      <div class="smart-map">
        <div class="smart-map-top">
          <div><span class="kicker">Map guide</span><h3>Explore Manipur</h3></div>
          <a class="map-open-link" href="https://www.openstreetmap.org/?mlat=24.82&amp;mlon=93.94#map=8/24.82/93.94" target="_blank" rel="noopener">Open full map ↗</a>
        </div>
        <div class="map-visual" aria-label="OpenStreetMap of Manipur">
          <iframe class="osm-embed" title="OpenStreetMap of Manipur" loading="eager" referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=93.25%2C24.2%2C94.55%2C25.45&amp;layer=mapnik&amp;marker=24.82%2C93.94"></iframe>
        </div>
        <div class="map-guide">
          <div><span class="map-guide-label">Place helper</span><p>Describe the kind of day you want and get a short list of matching places.</p></div>
          <form id="mapGuideForm" class="map-guide-form">
            <input id="mapGuideInput" type="text" autocomplete="off" placeholder="e.g. quiet lake day or local food">
            <button type="submit" aria-label="Get suggestions">→</button>
          </form>
          <div class="map-prompts">
            <button type="button" data-map-prompt="quiet lake day">Quiet lake day</button>
            <button type="button" data-map-prompt="food and culture">Food &amp; culture</button>
            <button type="button" data-map-prompt="easy hill walk">Easy hill walk</button>
          </div>
          <div id="mapSuggestion" class="map-suggestion"></div>
        </div>
      </div>`;
    mapSuggestion('');
  }

  /* ------------------------------ trip studio ------------------------------ */

  function renderPlanOptions() {
    const int = ['Nature', 'Culture', 'History', 'Food', 'Trekking', 'Wildlife'];
    $('#planInterests').innerHTML = int.map(x => `<button type="button" class="chip-btn" aria-pressed="false" data-plan-interest="${x}">${x}</button>`).join('');
    $('#planPace').innerHTML = [
      ['slow', 'Relaxed', '1–2 main stops a day'],
      ['balanced', 'Balanced', '2–3 useful stops a day'],
      ['active', 'Packed', 'More places, earlier starts']
    ].map(x => `<button type="button" class="opt-card" aria-pressed="false" data-pace="${x[0]}"><strong>${x[1]}</strong><span>${x[2]}</span></button>`).join('');
    $('#planBudget').innerHTML = [
      ['budget', 'Simple', 'Budget stays & local food'],
      ['mid', 'Comfort', 'More flexibility'],
      ['open', 'Flexible', 'Choose as you go']
    ].map(x => `<button type="button" class="opt-card" aria-pressed="false" data-plan-budget="${x[0]}"><strong>${x[1]}</strong><span>${x[2]}</span></button>`).join('');
    const today = new Date().toISOString().slice(0,10);
    if ($('#planStart') && !$('#planStart').value) $('#planStart').value = today;
  }

  function validatePlan() {
    const days = Number($('#planDays').value);
    const okay = days >= 1 && days <= 10 && $('#planStart').value && state.plan.interests.size && state.plan.pace && state.plan.budget;
    $('#planGenerate').disabled = !okay;
    $('#planHints').textContent = okay ? 'Ready — we’ll keep nearby places together and avoid overloading each day.' : 'Choose days, at least one interest, a pace and a stay style.';
  }

  function routeScore(p, fav) {
    const matches = p.tags.filter(t => fav.includes(t)).length;
    const saved = state.saved.includes(p.id) ? 3 : 0;
    const distancePenalty = p.distance / 100;
    return matches * 10 + saved - distancePenalty;
  }

  function zoneOf(p) {
    if (['Imphal West','Imphal East'].includes(p.district)) return 'Imphal';
    if (['Bishnupur','Thoubal','Kakching'].includes(p.district)) return 'South & Valley';
    if (p.district === 'Ukhrul') return 'Ukhrul & Hills';
    if (['Senapati','Kangpokpi'].includes(p.district)) return 'North & Hills';
    return 'West & Hills';
  }

  function makePlan() {
    const days = Number($('#planDays').value);
    const start = new Date(`${$('#planStart').value}T12:00:00`);
    const fav = [...state.plan.interests];
    const pace = state.plan.pace || 'balanced';
    const budget = state.plan.budget || 'open';
    const arrival = $('#planArrival')?.value || 'city';
    const arrivalTime = $('#planArrivalTime')?.value || '';

    // Score places from the user's actual choices. Every place gets a score,
    // so changing interests / budget / pace changes the route instead of
    // returning the same template every time.
    const budgetRank = { budget: ['Budget'], mid: ['Budget','Mid-range'], open: ['Budget','Mid-range'] };
    const target = budgetRank[budget] || budgetRank.open;
    const score = p => {
      let n = 0;
      n += p.tags.reduce((sum, t) => sum + (fav.includes(t) ? 14 : 0), 0);
      n += target.includes(p.cost) ? 5 : -3;
      n += state.saved.includes(p.id) ? 8 : 0;
      // Prefer a mix of close and farther destinations rather than sorting only by distance.
      n += Math.max(0, 10 - Math.abs(p.distance - (pace === 'active' ? 70 : pace === 'slow' ? 20 : 45)) / 10);
      return n;
    };

    let pool = [...places].sort((a,b) => score(b) - score(a));
    if (!pool.length) return;

    // Pace controls how many meaningful stops are planned.
    const perDay = pace === 'slow' ? 1 : pace === 'active' ? 3 : 2;
    const needed = Math.min(pool.length, days * perDay);

    // Build each day as a small geographic cluster. This prevents every day
    // from looking identical and avoids sending the user back and forth.
    const remaining = pool.slice();
    const groups = Array.from({length: days}, () => []);
    const used = new Set();

    function distance(a,b) {
      return Math.abs((a.distance || 0) - (b.distance || 0));
    }

    // Start with the highest-scoring place for each day, using different areas.
    const seededZones = new Set();
    for (let d = 0; d < days && used.size < needed; d++) {
      const candidate = remaining.find(p => !used.has(p.id) && !seededZones.has(zoneOf(p))) || remaining.find(p => !used.has(p.id));
      if (!candidate) break;
      groups[d].push(candidate);
      used.add(candidate.id);
      seededZones.add(zoneOf(candidate));
    }

    // Fill each day with places near that day's first stop and matching the interests.
    for (let d = 0; d < days; d++) {
      const anchor = groups[d][0];
      if (!anchor) continue;
      while (groups[d].length < perDay && used.size < needed) {
        const candidates = remaining.filter(p => !used.has(p.id));
        if (!candidates.length) break;
        candidates.sort((a,b) => {
          const sa = score(a) - distance(a, anchor) * 0.35;
          const sb = score(b) - distance(b, anchor) * 0.35;
          return sb - sa;
        });
        const next = candidates[0];
        groups[d].push(next);
        used.add(next.id);
      }
    }

    // If the user selected more days than available distinct places, leave the
    // extra day flexible instead of silently repeating destinations.
    const arrivalText = arrival === 'flight'
      ? `Flight arrival${arrivalTime ? ` around ${arrivalTime}` : ''}: check in first, rest for at least 10 minutes, then keep Day 1 close to Imphal.`
      : arrival === 'road'
        ? 'Road arrival: allow extra travel time, so the first day stays close to Imphal.'
        : 'Starting in Imphal: the route expands outward after the city stops.';

    const totalStops = groups.reduce((n,g) => n + g.length, 0);
    $('#planTotals').innerHTML = `
      <div class="plan-totals-card">
        <div><span class="kicker">Your route</span><h2>${days}-day Manipur trip</h2>
        <p>${esc(arrivalText)}</p></div>
        <div class="totals">
          <div><strong>${days}</strong><span>days</span></div>
          <div><strong>${totalStops}</strong><span>stops</span></div>
          <div><strong>${esc(pace)}</strong><span>pace</span></div>
        </div>
      </div>`;

    const interestText = fav.length ? fav.join(', ') : 'your selected interests';
    $('#planRouteNote').innerHTML = `<strong>Built for you:</strong> ${esc(interestText)} · ${esc(pace)} pace · ${esc(budget)} stay style. Nearby stops are grouped together so each day has a different route.`;

    $('#itineraryDays').innerHTML = groups.map((g, i) => {
      const date = new Date(start); date.setDate(start.getDate() + i);
      if (!g.length) return `<article class="day-card"><div class="day-head"><div class="day-no">Day<br>${i+1}</div><div class="day-title"><h3>Free / flexible day</h3><span>No suitable unused destination left — add a saved place or change interests.</span></div></div></article>`;
      const zone = zoneOf(g[0]);
      return `<article class="day-card">
        <div class="day-head">
          <div class="day-no">Day<br>${i + 1}</div>
          <div class="day-title"><h3>${esc(zone)}</h3>
          <span>${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · ${esc(g.length === 1 ? 'One main stop' : `${g.length} stops nearby`)}</span></div>
        </div>
        <div class="day-line">${g.map((p,j) => `
          <div class="stop">
            <div class="stop-tl"><i class="stop-dot"></i></div>
            <div class="stop-body">
              <div class="stop-top"><strong class="stop-name" data-detail="${p.id}">${esc(j === 0 ? (pace === 'slow' ? 'Main stop · ' : 'Morning · ') + p.name : (j === 1 ? 'Afternoon · ' : 'Evening · ') + p.name)}</strong><span class="stop-cost">${p.distance} km</span></div>
              <p>${esc(p.blurb)}</p>
              <div class="stop-meta"><span>${esc(p.type)}</span><span>${esc(p.tags.join(' · '))}</span></div>
            </div>
          </div>`).join('')}</div>
      </article>`;
    }).join('');
    $('#planOutput').classList.add('show');
    $('#planActions').classList.add('show');
    toast('A new route was built from your choices');
  }

  function downloadICS() {
    const start = new Date(($('#planStart').value || '') + 'T12:00:00');
    const cards = $$('#itineraryDays .day-card');
    if (isNaN(start) || !cards.length) { toast('Generate a route first'); return; }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const pad = n => String(n).padStart(2, '0');
    const d8 = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sana Leibak//Trip Studio//EN'];
    cards.forEach((cardEl, i) => {
      const day = new Date(start); day.setDate(start.getDate() + i);
      const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      const title = cardEl.querySelector('.day-title h3')?.textContent || `Day ${i + 1}`;
      const stops = [...cardEl.querySelectorAll('.stop-name')].map(s => s.textContent).join(', ');
      out.push('BEGIN:VEVENT', `UID:sana-${Date.now()}-${i}@sanaleibak.local`, `DTSTAMP:${stamp}Z`,
        `DTSTART;VALUE=DATE:${d8(day)}`, `DTEND;VALUE=DATE:${d8(next)}`,
        `SUMMARY:Manipur day ${i + 1} — ${title}`, `DESCRIPTION:Stops: ${stops}`, 'END:VEVENT');
    });
    out.push('END:VCALENDAR');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([out.join('\r\n')], { type: 'text/calendar' }));
    a.download = 'manipur-trip.ics';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Calendar file downloaded');
  }

  /* ------------------------------ weather ---------------------------------- */

  const WX_CODES = {
    0: ['☀️', 'Clear sky'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'],
    51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Drizzle'],
    61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
    71: ['🌨️', 'Snow'], 73: ['🌨️', 'Snow'], 75: ['🌨️', 'Snow'],
    80: ['🌦️', 'Showers'], 81: ['🌧️', 'Showers'], 82: ['🌧️', 'Heavy showers'],
    95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm'], 99: ['⛈️', 'Thunderstorm']
  };

  async function loadWeather() {
    const chip = $('#heroWeather');
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=24.82&longitude=93.94&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata');
      if (!r.ok) throw new Error('open-meteo ' + r.status);
      const d = await r.json();
      const c = d.current;
      const [ic, label] = WX_CODES[c.weather_code] || ['🌡️', 'Changeable'];
      chip.innerHTML = `<span class="dot-live"></span> ${ic} ${Math.round(c.temperature_2m)}°C in Imphal · ${label.toLowerCase()}`;
    } catch (e) {
      // keep the gentle fallback text if the weather service can't be reached
    }
  }

  /* ------------------------------ chat (the AI helper) --------------------- */

  const SYSTEM_PROMPT =
    'You are the travel helper on Sana Leibak, a small hand-built guide to Manipur, India. ' +
    'Talk like a friendly local friend: short, specific, plain words, no marketing talk. ' +
    'Keep answers under 90 words unless asked for more. ' +
    'The guide covers 20 places: Loktak Lake, Keibul Lamjao National Park, Karang Island, Kangla Fort, Ima Keithel, Manipur State Museum, Shree Govindajee Temple, Shirui Hills, Ukhrul, Dzükou Valley, Tharon Cave, Tamenglong, Sadu Chiru Waterfall, Khonghampat Orchidarium, Andro Heritage Village, INA Memorial Moirang, Kakching Garden, Khongjom War Memorial, Bir Tikendrajit Park, Mapal Kangjeibung. ' +
    'Foods: eromba, chamthong, nga thongba, chak-hao kheer, singju, kabok. ' +
    'For permits, prices, safety, opening hours and weather, advise checking current local or official sources.';

  async function askServer(messages) {
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!r.ok) throw new Error('local server said ' + r.status);
    const d = await r.json();
    if (!d.answer) throw new Error('empty reply from local server');
    return d.answer;
  }

  async function askGeminiDirect(messages) {
    if (!KEYS.gemini) throw new Error('no gemini key in js/config.js');
    const model = KEYS.model || 'gemini-3.6-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEYS.gemini },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
        generationConfig: { temperature: 0.6, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error((d.error && d.error.message) || ('gemini error ' + r.status));
    const parts = ((d.candidates || [])[0] || {}).content?.parts || [];
    const text = parts.map(p => p.text || '').join('').trim();
    if (!text) throw new Error('gemini returned an empty answer');
    return text;
  }

  async function askOpenRouter(messages) {
    if (!KEYS.openrouter) throw new Error('no openrouter key in js/config.js');
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEYS.openrouter },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.parts[0].text }))],
        max_tokens: 500
      })
    });
    const d = await r.json();
    if (!r.ok) throw new Error((d.error && d.error.message) || ('openrouter error ' + r.status));
    const text = d.choices?.[0]?.message?.content;
    if (!text) throw new Error('openrouter returned an empty answer');
    return text.trim();
  }

  const PROVIDERS = { server: askServer, gemini: askGeminiDirect, openrouter: askOpenRouter };
  const ALL_ROUTES = ['server', 'gemini', 'openrouter'];

  async function askAI(messages) {
    const routes = state.chatRoute ? [state.chatRoute, ...ALL_ROUTES.filter(r => r !== state.chatRoute)] : ALL_ROUTES;
    let lastErr;
    for (const name of routes) {
      try {
        const answer = await PROVIDERS[name](messages);
        state.chatRoute = name;
        return answer;
      } catch (e) {
        lastErr = e;
        console.warn('[chat] ' + name + ' failed:', e.message);
      }
    }
    throw lastErr || new Error('no AI provider worked');
  }

  function openChat() {
    $('#chatPanel').classList.add('open');
    $('#chatFab').classList.add('hide');
    if (!$('#chatLog').children.length) {
      $('#chatLog').innerHTML = `<div class="chat-empty"><span>🪷</span><strong>Namaste! 👋</strong>
        <p>Ask me anything about Manipur — places, food, routes, getting around.</p>
        <p class="chat-note">Answers come from Gemini, so double-check anything important.</p></div>`;
    }
    $('#chatInput').focus();
  }

  function closeChat() { $('#chatPanel').classList.remove('open'); $('#chatFab').classList.remove('hide'); }

  function appendMessage(role, html) {
    $('.chat-empty')?.remove();
    const d = document.createElement('div');
    d.className = `msg ${role}`;
    d.innerHTML = `<div class="bubble">${html}</div>`;
    $('#chatLog').append(d);
    $('#chatLog').scrollTop = $('#chatLog').scrollHeight;
  }

  function formatAnswer(text) {
    return esc(text)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  async function reply(text) {
    if (state.chatBusy) return;
    state.chatBusy = true;
    const typing = document.createElement('div');
    typing.className = 'msg bot chat-typing';
    typing.innerHTML = '<div class="bubble"><span class="dots"><i></i><i></i><i></i></span></div>';
    $('#chatLog').append(typing);
    $('#chatLog').scrollTop = $('#chatLog').scrollHeight;
    const history = [...state.chat.slice(-8), { role: 'user', text }]
      .map(item => ({ role: item.role, parts: [{ text: item.text }] }));
    let answer = null, error = null;
    try { answer = await askAI(history); } catch (e) { error = e; }
    typing.remove();
    state.chat.push({ role: 'user', text });
    if (answer) {
      state.chat.push({ role: 'model', text: answer });
      appendMessage('bot', formatAnswer(answer));
    } else {
      appendMessage('bot', `Sorry — I couldn't reach the AI just now.<br><small>${esc(error && error.message || 'Unknown error')}.</small><br><small>Check the internet connection, or the keys in <code>js/config.js</code>.</small>`);
    }
    state.chatBusy = false;
  }

  /* ------------------------------ events ----------------------------------- */

  function bindPlanControls() {
    $$('#planInterests [data-plan-interest]').forEach(button => button.onclick = () => {
      const selected = !button.classList.contains('on');
      button.classList.toggle('on', selected);
      button.setAttribute('aria-pressed', String(selected));
      selected ? state.plan.interests.add(button.dataset.planInterest) : state.plan.interests.delete(button.dataset.planInterest);
      validatePlan();
    });
    $$('#planPace [data-pace]').forEach(button => button.onclick = () => {
      $$('#planPace .opt-card').forEach(item => { item.classList.remove('on'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('on'); button.setAttribute('aria-pressed', 'true');
      state.plan.pace = button.dataset.pace; validatePlan();
    });
    $$('#planBudget [data-plan-budget]').forEach(button => button.onclick = () => {
      $$('#planBudget .opt-card').forEach(item => { item.classList.remove('on'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('on'); button.setAttribute('aria-pressed', 'true');
      state.plan.budget = button.dataset.planBudget; validatePlan();
    });
  }

  function closeDrawer() { $('#tripDrawer').classList.remove('open'); $('#drawerScrim').classList.remove('open'); }

  function setupEvents() {
    document.addEventListener('click', e => {
      // hide the hero search dropdown when clicking anywhere else
      if (!e.target.closest('#heroSearchWrap')) $('#heroResults').innerHTML = '';

      const mood = e.target.closest('[data-home-find]');
      if (mood) { state.interests.clear(); state.interests.add(mood.dataset.homeFind); go('explore'); setTimeout(renderExplore, 0); return; }

      const mapPrompt = e.target.closest('[data-map-prompt]');
      if (mapPrompt) { const input = $('#mapGuideInput'); if (input) { input.value = mapPrompt.dataset.mapPrompt; mapSuggestion(input.value); } return; }

      const goto = e.target.closest('[data-goto]');
      if (goto) { go(goto.dataset.goto); return; }

      const save = e.target.closest('[data-save]');
      if (save) { toggleSave(save.dataset.save); return; }

      const open = e.target.closest('[data-detail]');
      if (open) { detail(open.dataset.detail); return; }

      if (e.target.closest('[data-close-detail]') || e.target === $('#detailOverlay')) closeDetail();

      if (e.target.closest('#emptyClear')) clearFilters();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDetail(); closeChat(); closeDrawer(); }
    });

    document.addEventListener('submit', e => {
      if (e.target.id === 'mapGuideForm') { e.preventDefault(); mapSuggestion($('#mapGuideInput').value.trim()); }
    });

    $('#exploreSearch').addEventListener('input', renderExplore);
    $('#exploreSort').addEventListener('change', renderExplore);
    $('#exploreMonth').addEventListener('change', e => { state.month = e.target.value; renderExplore(); });
    $('#districtFilters').addEventListener('change', e => {
      e.target.checked ? state.districts.add(e.target.value) : state.districts.delete(e.target.value);
      renderExplore();
    });
    $('#interestFilters').addEventListener('click', e => {
      const b = e.target.closest('[data-interest]');
      if (!b) return;
      b.classList.toggle('on');
      state.interests.has(b.dataset.interest) ? state.interests.delete(b.dataset.interest) : state.interests.add(b.dataset.interest);
      renderExplore();
    });
    $('#costFilters').addEventListener('click', e => {
      const b = e.target.closest('[data-cost]');
      if (!b) return;
      b.classList.toggle('on');
      state.budget.has(b.dataset.cost) ? state.budget.delete(b.dataset.cost) : state.budget.add(b.dataset.cost);
      renderExplore();
    });
    $('#clearFilters').onclick = clearFilters;

    $$('#foodFilters [data-foodf]').forEach(b => b.onclick = () => {
      $$('#foodFilters [data-foodf]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      state.food = b.dataset.foodf;
      renderFood();
    });

    $('#heroSearch').addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      const matches = q ? places.filter(p => `${p.name} ${p.district} ${p.tags.join(' ')}`.toLowerCase().includes(q)).slice(0, 5) : [];
      $('#heroResults').innerHTML = matches.map(p => `<button data-detail="${p.id}"><img src="assets/img/${p.image}" alt=""><span>${esc(p.name)}<small>${esc(p.district)}</small></span></button>`).join('');
    });

    // chat
    $('#chatFab').onclick = openChat;
    $('#chatClose').onclick = closeChat;
    $('#chatForm').onsubmit = e => {
      e.preventDefault();
      const v = $('#chatInput').value.trim();
      if (!v) return;
      appendMessage('user', esc(v));
      $('#chatInput').value = '';
      reply(v);
    };

    // trip drawer
    $('#tripFab').onclick = () => { $('#tripDrawer').classList.add('open'); $('#drawerScrim').classList.add('open'); };
    $('#navTripBtn').onclick = () => $('#tripFab').click();
    $('#tripClose').onclick = closeDrawer;
    $('#drawerScrim').onclick = closeDrawer;
    $('#tripToPlan').onclick = () => { closeDrawer(); go('plan'); };

    // credits + menu
    $('#creditsBtn').onclick = () => $('#creditsOverlay').classList.add('open');
    $('#creditsOverlay').onclick = e => { if (e.target === $('#creditsOverlay')) e.currentTarget.classList.remove('open'); };
    $('#menuBtn').onclick = () => $('#navLinks').classList.toggle('open');

    // trip studio
    bindPlanControls();
    $('#planDays').oninput = validatePlan;
    $('#planStart').oninput = validatePlan;
    $('#planArrival').onchange = () => { state.plan.arrival = $('#planArrival').value; };
    $('#planArrivalTime').oninput = () => { state.plan.arrivalTime = $('#planArrivalTime').value; };
    $('#planGenerate').onclick = makePlan;
    $('#planRemix').onclick = makePlan;
    $('#planPrint').onclick = () => window.print();
    $('#planICS').onclick = downloadICS;
    $('#planCopy').onclick = async () => {
      try { await navigator.clipboard.writeText($('#itineraryDays').innerText); toast('Route copied'); }
      catch { toast('Select and copy the route text'); }
    };
    $('#planShare').onclick = async () => {
      try { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
      catch { toast('Use your browser address to share'); }
    };
  }

  /* ------------------------------ init ------------------------------------- */

  function init() {
    $('#year').textContent = new Date().getFullYear();
    renderFilters();
    renderHome();
    renderExplore();
    renderFood();
    renderFestivals();
    renderTravel();
    renderPlanOptions();
    updateSaved();
    route();
    setupEvents();
    window.addEventListener('hashchange', route);
    setInterval(() => $('#heroClock').textContent = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()) + ' IST', 1000);
    loadWeather();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
