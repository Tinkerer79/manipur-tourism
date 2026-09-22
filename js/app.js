/* ==========================================================================
   App shell — views, trip state, explore filters, detail modal, trip studio,
   concierge UI, live weather, search, toasts.
   ========================================================================== */

'use strict';

const App = (() => {

  /* ------------------------------ state ---------------------------------- */

  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
  };

  const trip = {
    ids: store.get('sl_trip', []),
    has(id) { return this.ids.includes(id); },
    add(id) {
      if (!this.ids.includes(id)) { this.ids.push(id); store.set('sl_trip', this.ids); }
      this.sync();
    },
    remove(id) {
      this.ids = this.ids.filter(x => x !== id);
      store.set('sl_trip', this.ids);
      this.sync();
    },
    toggle(id) { this.has(id) ? this.remove(id) : this.add(id); },
    clear() { this.ids = []; store.set('sl_trip', this.ids); this.sync(); },
    sync() {
      document.querySelectorAll('.tripCount').forEach(el => { el.textContent = this.ids.length; });
      renderTripList();
      if (MapMod.isReady) MapMod.renderAll();
      const must = document.getElementById('planMustWrap');
      if (must) renderMustList();
      document.querySelectorAll('[data-tripbtn]').forEach(btn => {
        const id = btn.getAttribute('data-tripbtn');
        btn.classList.toggle('active', this.has(id));
        const icon = btn.querySelector('.trip-icon');
        const label = btn.querySelector('.trip-label');
        if (btn.classList.contains('d-save')) {
          if (icon) icon.textContent = this.has(id) ? '✓' : '+';
          btn.title = this.has(id) ? 'Remove from trip' : 'Add to trip';
          btn.setAttribute('aria-label', this.has(id) ? `Remove ${id} from trip` : `Add ${id} to trip`);
        } else if (label) {
          label.textContent = this.has(id) ? 'In your trip' : 'Add to trip';
        }
      });
    }
  };

  const explore = {
    q: '', districts: new Set(), interests: new Set(), costs: new Set(), month: null, sort: 'smart'
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CAT_ICON = {
    lake: '🌊', nature: '🌿', wildlife: '🦌', heritage: '🏛️', museum: '🏛️', market: '🧺',
    sacred: '🛕', village: '🏡', trek: '⛰️', cave: '🕯️', waterfall: '💦', park: '🌳',
    viewpoint: '🌄', border: '🚪', botany: '🌸', crafts: '🏺', stay: '🛏️', hill: '⛰️'
  };

  function placeholderFor(d) {
    const icon = CAT_ICON[d.cat[0]] || '📍';
    const c1 = ['#0b3a4a', '#0e7490'], c2 = ['#3b1d4e', '#7c2d12'], c3 = ['#123524', '#166534'];
    const pair = d.cat[0] === 'lake' || d.cat[0] === 'waterfall' ? c1
      : (d.cat[0] === 'heritage' || d.cat[0] === 'museum' || d.cat[0] === 'sacred') ? c2 : c3;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${pair[0]}"/><stop offset="1" stop-color="${pair[1]}"/></linearGradient></defs>
      <rect width="640" height="420" fill="url(#g)"/>
      <circle cx="320" cy="180" r="86" fill="#ffffff" fill-opacity="0.08"/>
      <text x="320" y="215" font-size="92" text-anchor="middle" fill="#ffffff" fill-opacity="0.9">${icon}</text>
      <text x="320" y="330" font-size="26" text-anchor="middle" fill="#ffffff" fill-opacity="0.65" font-family="Georgia, serif">${esc(d.name)}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  const IMG_MAP = window.IMG_MAP || {};
  const imgFor = d => IMG_MAP[d.id] || placeholderFor(d);

  /* ------------------------------ toasts --------------------------------- */

  function toast(msg, icon = '✓') {
    const wrap = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-ic">${icon}</span><span>${esc(msg)}</span>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, 2600);
  }

  /* ------------------------------ routing -------------------------------- */

  let currentView = 'home';
  const VIEWS = ['home', 'explore', 'map', 'plan', 'food', 'festivals', 'travel'];

  function goto(view, opts = {}) {
    if (!VIEWS.includes(view)) view = 'home';
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    document.querySelectorAll('[data-nav]').forEach(n => n.classList.toggle('active', n.dataset.nav === view));
    location.hash = '/' + view;
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    if (view === 'map') MapMod.init();
    if (view === 'plan') setTimeout(() => document.getElementById('planStart')?.focus({ preventScroll: true }), 250);
    if (opts.dest) setTimeout(() => openDetail(opts.dest), 200);
    window.dispatchEvent(new Event('scroll'));
    revealScan();
  }

  /* ------------------------------ map sidebar ----------------------------- */

  const CAT_COLOR = {
    lake: '#0e7490', nature: '#15803d', wildlife: '#b45309', heritage: '#7c2d12',
    museum: '#6d28d9', market: '#be185d', sacred: '#a16207', village: '#047857',
    trek: '#1d4ed8', cave: '#334155', waterfall: '#0369a1', park: '#166534',
    viewpoint: '#9333ea', border: '#b91c1c', botany: '#db2777', crafts: '#c2410c',
    stay: '#0f766e', hill: '#14532d'
  };
  const colorOf = d => CAT_COLOR[d.cat[0]] || '#0f766e';

  function renderMapList() {
    const list = document.getElementById('mapList');
    if (!list) return;
    const vis = visibleDestinations();
    const cnt = document.getElementById('mapListCount');
    if (cnt) cnt.textContent = vis.length + ' shown';
    list.innerHTML = vis.map(d => `
      <button class="map-item" data-mapgo="${d.id}">
        <span class="pin-ic" style="background:${colorOf(d)}"></span>
        <div><strong>${esc(d.name)}</strong><span>${esc(d.district)}</span></div>
      </button>`).join('');
  }

  /* ------------------------------ reveal on scroll ----------------------- */

  let io = null;
  function revealScan() {
    if (!io) {
      io = new IntersectionObserver(entries => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }, { threshold: 0.12 });
    }
    document.querySelectorAll('.view.active .reveal:not(.in)').forEach(el => io.observe(el));
  }

  /* ------------------------------ destination cards ---------------------- */

  function whyNow(d) {
    const m = Engine.monthNow();
    if ((d.bestMonths || []).includes(m)) return 'At its best right now';
    return null;
  }

  function destCard(d, opts = {}) {
    const inTrip = trip.has(d.id);
    const now = whyNow(d);
    const { km, mins } = Engine.driveMinutes(Engine.IMPHAL, d.coords, d.sector);
    return `
      <article class="d-card reveal" data-open="${d.id}">
        <div class="d-card-img">
          <img loading="lazy" src="${imgFor(d)}" alt="${esc(d.name)}">
          ${now ? `<span class="d-now">● ${now}</span>` : ''}
          <button class="d-save ${inTrip ? 'active' : ''}" data-tripbtn="${d.id}" title="Add to trip" aria-label="Add ${esc(d.name)} to trip">
            <span class="trip-icon">+</span>
          </button>
        </div>
        <div class="d-card-body">
          <div class="d-card-top">
            <h3>${esc(d.name)}</h3>
            <span class="d-cost">${esc(d.cost)}</span>
          </div>
          <p class="d-card-sub">${esc(d.district)} · ${esc(CAT_ICON[d.cat[0]] || '')} ${esc(d.cat[0])} · ${Engine.fmtHrs(Math.min(d.durationHrs, 8) * 60)} visit</p>
          <p class="d-card-blurb">${esc(d.blurb)}</p>
          <div class="d-card-foot">
            <span>⏱ ${Engine.fmtHrs(mins)} from Imphal</span>
            <span class="d-card-more">Explore →</span>
          </div>
        </div>
      </article>`;
  }

  function bindCardEvents(root) {
    root.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('[data-tripbtn]')) return;
        openDetail(el.getAttribute('data-open'));
      });
    });
  }

  /* ------------------------------ explore -------------------------------- */

  function visibleDestinations() {
    let list = [...KB.destinations];
    if (explore.q) {
      const hits = Engine.searchDestinations(explore.q, 40).map(h => h.id);
      list = list.filter(d => hits.includes(d.id));
    }
    if (explore.districts.size) list = list.filter(d => explore.districts.has(d.district));
    if (explore.interests.size) list = list.filter(d => (d.interests || []).some(i => explore.interests.has(i)));
    if (explore.costs.size) list = list.filter(d => explore.costs.has(d.cost));
    if (explore.month) list = list.filter(d => (d.bestMonths || []).includes(explore.month));
    return list;
  }

  function renderExplore() {
    const list = visibleDestinations();
    let sorted;
    if (explore.sort === 'name') sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (explore.sort === 'near') sorted = [...list].sort((a, b) =>
      Engine.haversineKm(Engine.IMPHAL, a.coords) - Engine.haversineKm(Engine.IMPHAL, b.coords));
    else {
      const prefs = quizPrefs();
      const p = { ...prefs, month: explore.month || prefs.month };
      sorted = list.map(d => ({ d, s: Engine.scoreDestination(d, p).score })).sort((a, b) => b.s - a.s).map(x => x.d);
    }
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = sorted.length
      ? sorted.map(d => destCard(d)).join('')
      : `<div class="empty">Nothing matches those filters yet — loosen one and the valley opens up again.</div>`;
    bindCardEvents(grid);
    document.getElementById('exploreCount').textContent = sorted.length;
    renderMapList();
    revealScan();
  }

  function buildExploreFilters() {
    const districts = [...new Set(KB.destinations.map(d => d.district))].sort();
    document.getElementById('districtFilters').innerHTML = districts.map(x =>
      `<label class="f-check"><input type="checkbox" data-f-district="${esc(x)}"><span>${esc(x)}</span></label>`).join('');

    document.getElementById('interestFilters').innerHTML = KB.interests.map(i =>
      `<button class="f-chip" data-f-interest="${i.id}"><span>${i.icon}</span> ${esc(i.label)}</button>`).join('');

    document.getElementById('costFilters').innerHTML = ['₹', '₹₹'].map(c =>
      `<button class="f-chip" data-f-cost="${c}">${c === '₹' ? 'Easy on the pocket' : 'Worth the spend'}</button>`).join('');

    document.getElementById('exploreMonth').innerHTML =
      `<option value="">Any month</option>` +
      KB.climate.labels.map((l, i) => `<option value="${i + 1}">${l}</option>`).join('');

    const grid = document.getElementById('exploreGrid');
    grid.addEventListener('change', e => {
      const t = e.target;
      if (t.matches('[data-f-district]')) {
        t.checked ? explore.districts.add(t.value) : explore.districts.delete(t.value);
        renderExplore();
      }
    });
    grid.closest('.view').addEventListener('click', e => {
      const ic = e.target.closest('[data-f-interest]');
      if (ic) { ic.classList.toggle('on'); const v = ic.dataset.fInterest; explore.interests.has(v) ? explore.interests.delete(v) : explore.interests.add(v); renderExplore(); }
      const cc = e.target.closest('[data-f-cost]');
      if (cc) { cc.classList.toggle('on'); const v = cc.dataset.fCost; explore.costs.has(v) ? explore.costs.delete(v) : explore.costs.add(v); renderExplore(); }
      const clr = e.target.closest('#clearFilters');
      if (clr) {
        explore.districts.clear(); explore.interests.clear(); explore.costs.clear(); explore.month = null; explore.q = '';
        document.getElementById('exploreSearch').value = '';
        document.getElementById('exploreMonth').value = '';
        document.querySelectorAll('#explore .f-chip.on').forEach(c => c.classList.remove('on'));
        document.querySelectorAll('#explore input[type=checkbox]').forEach(c => c.checked = false);
        renderExplore();
      }
    });
    document.getElementById('exploreSearch').addEventListener('input', e => {
      explore.q = e.target.value; renderExplore();
    });
    document.getElementById('exploreMonth').addEventListener('change', e => {
      explore.month = e.target.value ? parseInt(e.target.value, 10) : null; renderExplore();
    });
    document.getElementById('exploreSort').addEventListener('change', e => {
      explore.sort = e.target.value; renderExplore();
    });
  }

  /* ------------------------------ detail modal --------------------------- */

  const weatherCache = new Map();

  async function weatherBlock(d) {
    if (weatherCache.has(d.id)) return weatherCache.get(d.id);
    try {
      const w = await Engine.fetchWeather(d.coords[0], d.coords[1]);
      const [label, icon] = Engine.wmo(w.current.weather_code);
      const html = `
        <div class="wx-now">
          <span class="wx-ic">${Concierge.W_ICON[icon] || '🌤️'}</span>
          <div><strong>${Math.round(w.current.temperature_2m)}°C</strong> · ${esc(label)}</div>
          <div class="wx-sub">Humidity ${Math.round(w.current.relative_humidity_2m)}% · Wind ${Math.round(w.current.wind_speed_10m)} km/h</div>
        </div>
        <div class="wx-days">${w.daily.time.slice(0, 5).map((t, i) => {
          const [lb, ic] = Engine.wmo(w.daily.weather_code[i]);
          return `<div class="wx-day"><span class="wx-d">${i === 0 ? 'Today' : new Date(t + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            <span class="wx-i">${Concierge.W_ICON[ic]}</span><span class="wx-t">${Math.round(w.daily.temperature_2m_max[i])}°</span>
            <span class="wx-pop">${w.daily.precipitation_probability_max[i] == null ? '' : w.daily.precipitation_probability_max[i] + '%'}</span></div>`;
        }).join('')}</div>`;
      weatherCache.set(d.id, html);
      return html;
    } catch {
      return `<div class="wx-now"><span class="wx-ic">📡</span><div>Live weather needs a connection — the seasonal picture stands in: best ${Engine.monthList(d.bestMonths || [])}.</div></div>`;
    }
  }

  async function openDetail(id) {
    const d = KB.destinations.find(x => x.id === id);
    if (!d) return;
    const overlay = document.getElementById('detailOverlay');
    const km = Math.round(Engine.haversineKm(Engine.IMPHAL, d.coords) * KB.roadFactor);
    const mins = Engine.driveMinutes(Engine.IMPHAL, d.coords, d.sector).mins;
    const nearby = KB.destinations
      .filter(x => x.id !== d.id && Engine.haversineKm(d.coords, x.coords) < 42)
      .sort((a, b) => Engine.haversineKm(d.coords, a.coords) - Engine.haversineKm(d.coords, b.coords)).slice(0, 4);
    const dots = KB.climate.labels.map((l, i) => {
      const on = (d.bestMonths || []).includes(i + 1);
      return `<span class="dot ${on ? 'on' : ''}" title="${l}${on ? ' — best' : ''}"></span>`;
    }).join('');

    document.getElementById('detailBody').innerHTML = `
      <div class="detail-hero">
        <img src="${imgFor(d)}" alt="${esc(d.name)}">
        <div class="detail-hero-grad"></div>
        <button class="detail-close" id="detailClose" aria-label="Close">✕</button>
        <div class="detail-hero-text">
          <span class="detail-district">${esc(d.district)} · Manipur</span>
          <h2>${esc(d.name)}</h2>
          <p>${esc(d.blurb)}</p>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-cols">
          <div class="detail-main">
            <h4>The story</h4>
            <p>${esc(d.desc)}</p>
            <h4>Don't miss</h4>
            <ul class="hl-list">${d.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
            <h4>Season strip</h4>
            <div class="dots">${dots}<span class="dots-note">${Engine.monthList(d.bestMonths || [])}</span></div>
            <h4>Good to know</h4>
            <p class="tip-note">${esc(d.tips || 'No particular cautions — go and enjoy.')}</p>
            ${nearby.length ? `<h4>Pairs well with</h4><div class="near-row">${nearby.map(n =>
              `<button class="near-chip" data-open="${n.id}">${esc(n.name)}<small>${Math.round(Engine.haversineKm(d.coords, n.coords))} km</small></button>`).join('')}</div>` : ''}
          </div>
          <aside class="detail-side">
            <div class="side-card">
              <div class="side-row"><span>Drive from Imphal</span><strong>≈${km} km · ${Engine.fmtHrs(mins)}</strong></div>
              <div class="side-row"><span>Time needed</span><strong>${d.durationHrs >= 20 ? (Math.ceil(d.durationHrs / 20)) + '–' + (Math.ceil(d.durationHrs / 20) + 1) + ' days' : '≈ ' + Engine.fmtHrs(d.durationHrs * 60)}</strong></div>
              <div class="side-row"><span>Cost flavour</span><strong>${esc(d.cost)}</strong></div>
              <div class="side-row"><span>Effort</span><strong class="cap">${esc(d.difficulty)}</strong></div>
              <div class="side-row"><span>Entry</span><strong class="cap">${esc(d.entry)}</strong></div>
            </div>
            <div class="side-card wx-card">
              <h5>Live weather there</h5>
              <div id="detailWx"><div class="wx-loading">Reading the sky…</div></div>
            </div>
            <button class="btn primary wide" data-tripbtn="${d.id}"><span class="trip-icon">+</span> <span class="trip-label">Add to trip</span></button>
            <button class="btn ghost wide" data-mapfocus="${d.id}">Show on the map</button>
          </aside>
        </div>
      </div>`;
    overlay.classList.add('open');
    document.body.classList.add('locked');
    bindCardEvents(document.getElementById('detailBody'));
    document.getElementById('detailWx').innerHTML = await weatherBlock(d);
    document.getElementById('detailClose').addEventListener('click', closeDetail);
    overlay.onclick = e => { if (e.target === overlay) closeDetail(); };
  }

  function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.body.classList.remove('locked');
  }

  /* ------------------------------ trip drawer ---------------------------- */

  function renderTripList() {
    const el = document.getElementById('tripList');
    if (!el) return;
    const items = trip.ids.map(id => KB.destinations.find(d => d.id === id)).filter(Boolean);
    el.innerHTML = items.length
      ? items.map(d => `
        <div class="trip-item">
          <div class="trip-item-info">
            <strong>${esc(d.name)}</strong>
            <span>${esc(d.district)} · ${Engine.fmtHrs(Math.min(d.durationHrs, 8) * 60)}</span>
          </div>
          <button class="trip-x" data-tripx="${d.id}" aria-label="Remove">✕</button>
        </div>`).join('')
      : `<div class="trip-empty">Nothing saved yet.<br>Tap the heart on any place you like.</div>`;
    const send = document.getElementById('tripToPlan');
    send.disabled = !items.length;
  }

  /* ------------------------------ trip studio ---------------------------- */

  const quiz = {
    interests: [], pace: null, budget: null, days: null, start: null, month: null,
    fromTrip: false
  };

  function quizState() { return quiz; }

  function quizPrefs() {
    return {
      interests: quiz.interests,
      month: quiz.month || (quiz.start ? new Date(quiz.start + 'T12:00:00').getMonth() + 1 : undefined),
      pace: quiz.pace,
      cost: quiz.budget ? { lean: '₹', comfort: '₹', premium: '₹₹' }[quiz.budget] : undefined,
      difficulty: quiz.pace === 'relaxed' ? 'easy' : undefined,
      mustInclude: trip.ids.length && quiz.fromTrip ? [...trip.ids] : []
    };
  }

  let currentPlan = null;

  function renderPlannerChips() {
    document.getElementById('planInterests').innerHTML = KB.interests.map(i =>
      `<button class="f-chip ${quiz.interests.includes(i.id) ? 'on' : ''}" data-q-interest="${i.id}"><span>${i.icon}</span> ${esc(i.label)}</button>`).join('');
    document.getElementById('planPace').innerHTML = KB.paceOptions.map(p =>
      `<button class="opt-card ${quiz.pace === p.id ? 'on' : ''}" data-q-pace="${p.id}"><strong>${esc(p.label)}</strong><span>${esc(p.hint)}</span></button>`).join('');
    document.getElementById('planBudget').innerHTML = KB.budgetOptions.map(b =>
      `<button class="opt-card ${quiz.budget === b.id ? 'on' : ''}" data-q-budget="${b.id}"><strong>${esc(b.label)}</strong><span>${esc(b.hint)}</span></button>`).join('');
  }

  function renderMustList() {
    const wrap = document.getElementById('planMustWrap');
    const items = trip.ids.map(id => KB.destinations.find(d => d.id === id)).filter(Boolean);
    wrap.innerHTML = items.length
      ? `<div class="must-list">${items.map(d =>
        `<span class="must-chip">${esc(d.name)}<button data-mustx="${d.id}" aria-label="Remove">✕</button></span>`).join('')}</div>`
      : `<p class="hint-line">Nothing pinned yet — tap the heart on any destination and it lands here.</p>`;
  }

  function validatePlanner() {
    const hints = [];
    if (!quiz.days) hints.push('How many days are we shaping?');
    if (!quiz.pace) hints.push('Pick a travelling pace.');
    if (!quiz.budget) hints.push('Choose a comfort level for the estimate.');
    document.getElementById('planHints').innerHTML = hints.map(h => `<span>· ${esc(h)}</span>`).join('');
    document.getElementById('planGenerate').disabled = hints.length > 0;
    return !hints.length;
  }

  function mealHint(slot, sector) {
    const valleyFood = ['eromba & singju at a bazar kitchen', 'nga-thongba with steamed rice', 'chak-hao kheer to finish'];
    const hillFood = ['hawaijar stew with local rice', 'smoked pork & millet tea', 'hill honey with lemon'];
    const pool = ['northeast', 'north', 'northwest'].includes(sector) ? hillFood : valleyFood;
    return pool[slot % pool.length];
  }

  async function renderItinerary(plan, startDate) {
    currentPlan = plan;
    const prefs = quizPrefs();
    const daysEl = document.getElementById('itineraryDays');
    daysEl.innerHTML = plan.map(dp => {
      const date = startDate ? Engine.addDays(startDate, dp.day - 1) : null;
      return `
      <section class="day-card reveal in" data-day="${dp.day}">
        <header class="day-head">
          <div class="day-no">Day ${dp.day}</div>
          <div class="day-title">
            <h3>${esc(dp.sectorLabel)}</h3>
            <span>${date ? new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'flexible day'}
              · ≈${dp.totalKm} km ${dp.returnToCity ? '· back to Imphal by night' : '· city day'}</span>
          </div>
          <div class="day-wx" data-wx-day="${dp.day}">${date ? '<span class="wx-loading">…</span>' : ''}</div>
        </header>
        <div class="day-line">
          ${dp.legs.map((leg, i) => `
            ${i === 0 ? `<div class="leg leg-from"><span>🌅</span><em>Leave Imphal</em></div>` : ''}
            <div class="leg leg-drive"><span>🚙</span><em>${Math.round(leg.km)} km · ${Engine.fmtHrs(leg.mins)}</em></div>
            <div class="stop">
              <div class="stop-tl"><span class="stop-dot"></span></div>
              <div class="stop-body">
                <div class="stop-top">
                  <h4 data-open="${leg.to.id}" class="stop-name">${esc(leg.to.name)}</h4>
                  <span class="stop-cost">${esc(leg.to.cost)}</span>
                </div>
                <p>${esc(leg.to.blurb)}</p>
                <div class="stop-meta">
                  <span>⏳ ≈${Engine.fmtHrs(Math.min(leg.to.durationHrs, 8) * 60)}</span>
                  <span>🎟 ${esc(leg.to.entry)}</span>
                </div>
                <div class="stop-why">${(Engine.scoreDestination(leg.to, prefs).reasons || []).slice(0, 2).map(r => `<em>${esc(r)}</em>`).join('')}</div>
                ${i === dp.stops.length - 1 && dp.stops.length > 1 ? `<div class="meal">🍽 Around here: ${esc(mealHint(dp.day + i, dp.sector))}</div>` : ''}
                ${dp.stops.length === 1 ? `<div class="meal">🍽 Around here: ${esc(mealHint(dp.day, dp.sector))}</div>` : ''}
              </div>
            </div>`).join('')}
          ${dp.returnToCity ? `<div class="leg leg-drive"><span>🚙</span><em>Return to Imphal · rest of the evening free</em></div>
            <div class="leg leg-to"><span>🌙</span><em>${esc(mealHint(dp.day + 2, 'city'))} in the city</em></div>` : ''}
        </div>
      </section>`;
    }).join('');

    // totals + budget
    const totalKm = plan.reduce((s, d) => s + d.totalKm, 0);
    const perDay = (KB.budgetOptions.find(b => b.id === quiz.budget) || KB.budgetOptions[1]).perDay;
    const total = perDay * quiz.days;
    document.getElementById('planTotals').innerHTML = `
      <div class="totals">
        <div><strong>${quiz.days}</strong><span>days</span></div>
        <div><strong>${plan.reduce((s, d) => s + d.stops.length, 0)}</strong><span>stops</span></div>
        <div><strong>≈${totalKm} km</strong><span>on the road</span></div>
        <div><strong>₹${total.toLocaleString('en-IN')}</strong><span>per person, ${esc(quiz.budget)} style</span></div>
      </div>
      <div class="budget-bars">
        ${[['Stay', 45], ['Food', 25], ['Transport', 20], ['Entries & extras', 10]].map(([l, p]) =>
      `<div class="bar-row"><span>${l}</span><div class="bar"><i style="width:${p}%"></i></div><em>~₹${Math.round(total * p / 100).toLocaleString('en-IN')}</em></div>`).join('')}
      </div>`;

    // actions
    document.getElementById('planActions').classList.add('show');

    // weather per day (async fill)
    if (startDate) {
      plan.forEach(async dp => {
        const date = Engine.addDays(startDate, dp.day - 1);
        const stop = dp.stops[0];
        try {
          const w = await Engine.fetchWeather(stop.coords[0], stop.coords[1]);
          const wd = Engine.weatherByDate(w, date);
          const el = document.querySelector(`[data-wx-day="${dp.day}"]`);
          if (!el) return;
          if (!wd) { el.innerHTML = '<span class="wx-out">Beyond the 7-day window — check back closer</span>'; return; }
          const [lb, ic] = Engine.wmo(wd.code);
          el.innerHTML = `<span title="${esc(lb)}">${Concierge.W_ICON[ic]}</span>
            <strong>${Math.round(wd.tmin)}–${Math.round(wd.tmax)}°C</strong><span class="wx-pop">${wd.pop == null ? '' : wd.pop + '% rain'}</span>`;
        } catch {
          const el = document.querySelector(`[data-wx-day="${dp.day}"]`);
          if (el) el.innerHTML = '';
        }
      });
    }
    bindCardEvents(daysEl);
    if (MapMod.isReady && currentView === 'map') MapMod.drawRoute(plan);
  }

  function generatePlan() {
    if (!validatePlanner()) return;
    const plan = Engine.generateItinerary({
      days: quiz.days,
      pace: quiz.pace,
      interests: quiz.interests,
      month: quiz.month || (quiz.start ? new Date(quiz.start + 'T12:00:00').getMonth() + 1 : undefined),
      mustInclude: quiz.fromTrip ? [...trip.ids] : []
    });
    renderItinerary(plan, quiz.start || null);
    document.getElementById('planOutput').classList.add('show');
    setTimeout(() => document.getElementById('planOutput').scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    toast('Your route is ready', '🗺️');
  }

  function prefillPlanner(opts = {}) {
    goto('plan');
    if (opts.days) { quiz.days = opts.days; document.getElementById('planDays').value = opts.days; }
    if (opts.interests) quiz.interests = [...opts.interests];
    if (opts.fromTrip) quiz.fromTrip = true;
    if (opts.mustInclude && opts.mustInclude.length) { for (const id of opts.mustInclude) trip.add(id); quiz.fromTrip = true; }
    renderPlannerChips(); renderMustList(); validatePlanner();
    if (opts.autogenerate && validatePlanner()) generatePlan();
  }

  function planSummaryText() {
    if (!currentPlan) return '';
    const lines = ['MANIPUR — YOUR ROUTE', ''];
    currentPlan.forEach(dp => {
      lines.push(`Day ${dp.day} — ${dp.sectorLabel}`);
      dp.stops.forEach(s => lines.push(`  • ${s.name} (${s.district}) — ${s.blurb}`));
      lines.push(`  ≈${dp.totalKm} km driving${dp.returnToCity ? ', return to Imphal' : ''}`);
      lines.push('');
    });
    lines.push('Planned with Sana Leibak — Discover Manipur.');
    return lines.join('\n');
  }

  function downloadICS() {
    if (!currentPlan) return;
    const base = quiz.start || Engine.todayISO();
    const ics = Engine.toICS(currentPlan, base);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manipur-itinerary.ics';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Calendar file downloaded', '📅');
  }

  function sharePlan() {
    if (!currentPlan) return;
    const payload = {
      d: quiz.days, p: quiz.pace, b: quiz.budget, s: quiz.start,
      i: quiz.interests, t: currentPlan.map(dp => dp.stops.map(x => x.id))
    };
    const url = location.origin + location.pathname + '#trip=' + Engine.encodeTrip(payload);
    if (navigator.share) {
      navigator.share({ title: 'My Manipur route', url }).catch(() => { });
    } else {
      navigator.clipboard?.writeText(url);
      toast('Share link copied', '🔗');
    }
  }

  function restoreFromHash() {
    const m = location.hash.match(/#trip=([A-Za-z0-9\-_]+)/);
    if (!m) return false;
    const data = Engine.decodeTrip(m[1]);
    if (!data || !data.t) return false;
    quiz.days = data.d || data.t.length;
    quiz.pace = data.p || 'balanced';
    quiz.budget = data.b || 'comfort';
    quiz.start = data.s || null;
    quiz.interests = data.i || [];
    quiz.fromTrip = true;
    for (const dayIds of data.t) for (const id of dayIds) trip.add(id);
    document.getElementById('planDays').value = quiz.days;
    if (quiz.start) document.getElementById('planStart').value = quiz.start;
    renderPlannerChips(); renderMustList(); validatePlanner();
    const plan = Engine.generateItinerary({
      days: quiz.days, pace: quiz.pace, interests: quiz.interests,
      month: quiz.start ? new Date(quiz.start + 'T12:00:00').getMonth() + 1 : undefined,
      mustInclude: [...trip.ids]
    });
    // reorder to shared day grouping
    const rebuilt = data.t.map((ids, i) => {
      const stops = ids.map(id => KB.destinations.find(d => d.id === id)).filter(Boolean);
      if (!stops.length) return null;
      const sec = stops[0].sector;
      const legs = [];
      let cur = Engine.IMPHAL, km = 0, mins = 0;
      for (const s of stops) {
        const l = Engine.driveMinutes(cur, s.coords, s.sector);
        legs.push({ to: s, km: l.km, mins: l.mins }); km += l.km; mins += l.mins; cur = s.coords;
      }
      return { day: i + 1, sector: sec, sectorLabel: (KB.sectors[sec] || {}).label || sec, stops, legs, totalKm: Math.round(km), totalMins: Math.round(mins), returnToCity: sec !== 'city' };
    }).filter(Boolean);
    goto('plan');
    renderItinerary(rebuilt, quiz.start || null);
    document.getElementById('planOutput').classList.add('show');
    document.getElementById('planActions').classList.add('show');
    toast('Shared route loaded', '🔗');
    return true;
  }

  /* ------------------------------ home ----------------------------------- */

  function renderHome() {
    const m = Engine.monthNow();
    const season = Engine.seasonNow(m);
    const fests = Engine.festivalsNear(m).slice(0, 3);
    document.getElementById('seasonBanner').innerHTML = `
      <div class="season-chip">${season.label}</div>
      <p>${fests.length
      ? `On the calendar around now: ${fests.map(f => `<strong>${esc(f.name)}</strong>`).join(' · ')}`
      : 'A quiet stretch — perfect for the lake and the hills without the crowds.'}</p>
      <button class="chip-btn" data-cx="goto" data-view="festivals">Full festival calendar</button>`;

    const picks = Engine.recommend({ month: m, interests: [] }, 6);
    const featured = document.getElementById('homeFeatured');
    featured.innerHTML = picks.map(r => destCard(r.d)).join('');
    bindCardEvents(featured);

    const exp = document.getElementById('homeExperiences');
    exp.innerHTML = KB.experiences.slice(0, 6).map(x => {
      const d = KB.destinations.find(dd => dd.id === x.destId);
      return `<article class="x-card reveal" ${d ? `data-open="${d.id}"` : ''}>
        <span class="x-icon">${['🛶', '🌺', '🐎', '🥁', '🧗', '🕯️'][KB.experiences.indexOf(x) % 6]}</span>
        <h3>${esc(x.name)}</h3>
        <p>${esc(x.blurb)}</p>
        ${d ? `<span class="x-where">${esc(d.name)}</span>` : ''}
      </article>`;
    }).join('');
  }

  /* ------------------------------ hero search ---------------------------- */

  function bindHeroSearch() {
    const input = document.getElementById('heroSearch');
    const box = document.getElementById('heroResults');
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) { box.classList.remove('open'); return; }
      const hits = Engine.searchAll(q);
      box.innerHTML = hits.length ? hits.map(h => {
        const icon = h.kind === 'destination' ? (CAT_ICON[h.item.cat[0]] || '📍') : h.kind === 'food' ? '🍲' : h.kind === 'festival' ? '🎆' : '✨';
        return `<button class="sr-row" data-sr="${h.kind}" data-id="${h.item.id}">
          <span>${icon}</span><div><strong>${esc(h.item.name)}</strong>
          <em>${h.kind === 'destination' ? esc(h.item.district) : h.kind === 'food' ? 'Food of Manipur' : h.kind === 'festival' ? 'Festival' : 'Experience'}</em></div>
        </button>`;
      }).join('') : `<div class="sr-none">Nothing for “${esc(q)}” — try “Loktak”, “polo” or “eromba”.</div>`;
      box.classList.add('open');
    });
    box.addEventListener('click', e => {
      const row = e.target.closest('[data-sr]');
      if (!row) return;
      box.classList.remove('open');
      input.value = '';
      const { sr, id } = row.dataset;
      if (sr === 'destination') openDetail(id);
      else if (sr === 'food') { goto('food'); }
      else if (sr === 'festival') goto('festivals');
      else goto('explore');
    });
    document.addEventListener('click', e => { if (!e.target.closest('#heroSearchWrap')) box.classList.remove('open'); });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault(); goto('home'); setTimeout(() => input.focus(), 100);
      }
    });
  }

  /* ------------------------------ hero weather --------------------------- */

  async function heroWeather() {
    const chip = document.getElementById('heroWeather');
    const strip = document.getElementById('liveStrip');
    try {
      const w = await Engine.fetchWeather(24.817, 93.937);
      const [label, icon] = Engine.wmo(w.current.weather_code);
      const sun = w.daily.sunrise[0].slice(11, 16), set = w.daily.sunset[0].slice(11, 16);
      chip.innerHTML = `<span>${Concierge.W_ICON[icon] || '🌤️'}</span><strong>${Math.round(w.current.temperature_2m)}°C</strong> ${esc(label)} · Imphal now`;
      strip.innerHTML = `
        <div><span>Sunrise</span><strong>${sun}</strong></div>
        <div><span>Sunset</span><strong>${set}</strong></div>
        <div><span>Humidity</span><strong>${Math.round(w.current.relative_humidity_2m)}%</strong></div>
        <div><span>Wind</span><strong>${Math.round(w.current.wind_speed_10m)} km/h</strong></div>`;
      chip.classList.add('on');
    } catch {
      chip.innerHTML = `<span>🌤️</span><strong>Imphal</strong> · the floating lake city`;
      strip.innerHTML = '';
    }
  }

  function heroClock() {
    const el = document.getElementById('heroClock');
    const tick = () => {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      el.textContent = now + ' IST';
    };
    tick(); setInterval(tick, 30000);
  }

  /* ------------------------------ food / festivals / travel -------------- */

  function renderFood(filter = 'all') {
    const foods = KB.foods.filter(f => filter === 'all' ? true
      : filter === 'veg' ? f.veg !== 'nonveg'
        : filter === 'nonveg' ? f.veg !== 'veg'
          : filter === 'hot' ? f.spice === 'hot'
            : filter === 'sweet' ? /kheer|honey|orange|lemon/i.test(f.name) : true);
    document.getElementById('foodGrid').innerHTML = foods.map(f => `
      <article class="food-card reveal">
        <div class="food-icon">${{ veg: '🥬', 'veg-opt': '🥘', nonveg: '🐟' }[f.veg]}</div>
        <div class="food-body">
          <div class="food-top"><h3>${esc(f.name)}</h3>
            <span class="spice s-${f.spice}">${f.spice === 'hot' ? '🌶️🌶️' : f.spice === 'medium' ? '🌶️' : '🌿'}</span></div>
          <p>${esc(f.blurb)}</p>
          <span class="food-where">${esc(f.where)}</span>
        </div>
      </article>`).join('');
    revealScan();
  }

  function renderFestivals() {
    const now = Engine.monthNow();
    const year = new Date().getFullYear();
    document.getElementById('festNow').innerHTML = `
      <div class="fest-now-inner">
        <span class="fest-pulse"></span>
        <div><strong>Happening around now — ${KB.climate.labels[now - 1]} ${year}</strong>
          <p>${Engine.festivalsNear(now).map(f => esc(f.name)).join(' · ') || 'A quieter stretch of the calendar — the hills and lake hold the stage.'}</p></div>
      </div>`;
    document.getElementById('festivalTimeline').innerHTML = KB.festivals.map(f => {
      const soon = f.months.includes(now);
      return `
      <article class="fest-card reveal ${soon ? 'soon' : ''}">
        <div class="fest-when">${f.months.map(m => KB.climate.labels[m - 1]).join(' – ')}</div>
        <h3>${esc(f.name)}</h3>
        <div class="fest-window">${esc(f.window)}</div>
        <p>${esc(f.desc)}</p>
        <span class="fest-place">📍 ${esc(f.place)}</span>
        ${soon ? '<span class="fest-soon">Around the corner</span>' : ''}
      </article>`;
    }).join('');
    revealScan();
  }

  function renderTravel() {
    document.getElementById('essentialsGrid').innerHTML = KB.essentials.map(e => `
      <article class="ess-card reveal">
        <span class="ess-icon">${e.icon}</span>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.body)}</p>
      </article>`).join('');
    document.getElementById('emergencyList').innerHTML = KB.emergency.map(x =>
      `<div class="emg"><strong>${x.num}</strong><span>${esc(x.label)}</span></div>`).join('');
    const tr = KB.transport;
    document.getElementById('transportGrid').innerHTML = [tr.air, tr.rail, tr.road, tr.local].map((t, i) => `
      <article class="tr-card reveal">
        <span class="tr-icon">${['✈️', '🚆', '🛣️', '🛺'][i]}</span>
        <h3>${esc(t.title)}</h3><p>${esc(t.body)}</p>
      </article>`).join('');
    document.getElementById('staysGrid').innerHTML = KB.stays.map(s => `
      <article class="stay-card reveal">
        <div class="stay-top"><h3>${esc(s.name)}</h3><span class="stay-price">${esc(s.price)}</span></div>
        <span class="stay-where">📍 ${esc(s.where)}</span>
        <p>${esc(s.blurb)}</p>
      </article>`).join('');
    revealScan();
  }

  /* ------------------------------ concierge UI --------------------------- */

  const chat = { open: false, busy: false };

  function chatPush(html, who = 'bot') {
    const log = document.getElementById('chatLog');
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.innerHTML = `<div class="bubble">${html}</div>`;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  async function chatSend(text) {
    if (chat.busy || !text.trim()) return;
    chat.busy = true;
    chatPush(esc(text), 'user');
    const typing = chatPush('<span class="dots"><i></i><i></i><i></i></span>', 'bot typing');
    try {
      const reply = await Concierge.respond(text);
      await new Promise(r => setTimeout(r, 350 + Math.min(700, reply.length)));
      typing.remove();
      chatPush(reply, 'bot');
    } catch (err) {
      typing.remove();
      chatPush('Something snagged on my end — try that once more?', 'bot');
    }
    chat.busy = false;
  }

  function bindChat() {
    const panel = document.getElementById('chatPanel');
    const fab = document.getElementById('chatFab');
    const openChat = () => {
      chat.open = true;
      panel.classList.add('open');
      fab.classList.add('hide');
      setTimeout(() => document.getElementById('chatInput').focus(), 150);
      if (!Concierge.state.greeted) {
        Concierge.state.greeted = true;
        setTimeout(() => chatPush(Concierge.greeting(), 'bot'), 250);
      }
    };
    const closeChat = () => { chat.open = false; panel.classList.remove('open'); fab.classList.remove('hide'); };
    fab.addEventListener('click', openChat);
    document.getElementById('chatClose').addEventListener('click', closeChat);

    document.getElementById('chatForm').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('chatInput');
      const v = input.value.trim();
      input.value = '';
      chatSend(v);
    });

    document.addEventListener('click', e => {
      const ask = e.target.closest('[data-ask]');
      if (ask) { chatSend(ask.dataset.ask); return; }
      const cx = e.target.closest('[data-cx]');
      if (cx) {
        const kind = cx.dataset.cx, id = cx.dataset.id;
        if (kind === 'trip') { trip.add(id); toast('Added to your trip', '♡'); }
        else if (kind === 'open') openDetail(id);
        else if (kind === 'weather') {
          const d = KB.destinations.find(x => x.id === id);
          if (d) chatSend(`weather at ${d.name}`);
        }
        else if (kind === 'plan') prefillPlanner({ days: parseInt(cx.dataset.days || '4', 10), month: cx.dataset.month ? parseInt(cx.dataset.month, 10) : undefined, autogenerate: true });
        else if (kind === 'goto') { goto(cx.dataset.view); closeChat(); }
      }
    });
  }

  /* ------------------------------ global binds --------------------------- */

  function bindGlobal() {
    document.querySelectorAll('[data-nav]').forEach(n =>
      n.addEventListener('click', e => { e.preventDefault(); goto(n.dataset.nav || 'home'); }));
    document.querySelectorAll('[data-goto]').forEach(n =>
      n.addEventListener('click', e => { e.preventDefault(); goto(n.dataset.goto, n.dataset.dest ? { dest: n.dataset.dest } : {}); }));

    document.getElementById('navTripBtn').addEventListener('click', () => {
      document.getElementById('tripDrawer').classList.add('open');
      document.getElementById('drawerScrim').classList.add('show');
    });

    const navEl = document.getElementById('topNav');
    const onScroll = () => {
      navEl.classList.toggle('scrolled', window.scrollY > 40);
      navEl.classList.toggle('on-hero', currentView === 'home' && window.scrollY < 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onScroll);

    document.addEventListener('click', e => {
      const go = e.target.closest('[data-mapgo]');
      if (go) { MapMod.focus(KB.destinations.find(d => d.id === go.dataset.mapgo)); return; }
      const tb = e.target.closest('[data-tripbtn]');
      if (tb) {
        e.stopPropagation();
        const id = tb.dataset.tripbtn;
        trip.toggle(id);
        toast(trip.has(id) ? 'Saved to your trip' : 'Removed from your trip', trip.has(id) ? '♡' : '✓');
        return;
      }
      const tx = e.target.closest('[data-tripx]');
      if (tx) { trip.remove(tx.dataset.tripx); return; }
      const mx = e.target.closest('[data-mustx]');
      if (mx) { trip.remove(mx.dataset.mustx); renderMustList(); return; }
      const mf = e.target.closest('[data-mapfocus]');
      if (mf) { closeDetail(); goto('map'); setTimeout(() => MapMod.focus(KB.destinations.find(d => d.id === mf.dataset.mapfocus)), 350); return; }
    });

    document.getElementById('tripFab').addEventListener('click', () => {
      document.getElementById('tripDrawer').classList.add('open');
      document.getElementById('drawerScrim').classList.add('show');
    });
    document.getElementById('tripClose').addEventListener('click', closeDrawer);
    document.getElementById('drawerScrim').addEventListener('click', closeDrawer);
    document.getElementById('tripToPlan').addEventListener('click', () => {
      closeDrawer();
      prefillPlanner({ fromTrip: true });
      document.getElementById('planMustWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    function closeDrawer() {
      document.getElementById('tripDrawer').classList.remove('open');
      document.getElementById('drawerScrim').classList.remove('show');
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeDetail(); } });

    document.getElementById('menuBtn').addEventListener('click', () =>
      document.querySelector('.nav-links').classList.toggle('open'));
  }

  function bindPlanner() {
    renderPlannerChips();
    renderMustList();

    document.getElementById('planDays').addEventListener('input', e => {
      const v = parseInt(e.target.value, 10);
      quiz.days = v && v >= 1 && v <= 10 ? v : null;
      validatePlanner();
    });
    document.getElementById('planStart').addEventListener('change', e => {
      quiz.start = e.target.value || null;
      quiz.month = quiz.start ? new Date(quiz.start + 'T12:00:00').getMonth() + 1 : null;
      validatePlanner();
    });
    document.getElementById('planInterests').addEventListener('click', e => {
      const b = e.target.closest('[data-q-interest]'); if (!b) return;
      const id = b.dataset.qInterest;
      quiz.interests.includes(id) ? quiz.interests.splice(quiz.interests.indexOf(id), 1) : quiz.interests.push(id);
      b.classList.toggle('on');
    });
    document.getElementById('planPace').addEventListener('click', e => {
      const b = e.target.closest('[data-q-pace]'); if (!b) return;
      quiz.pace = quiz.pace === b.dataset.qPace ? null : b.dataset.qPace;
      renderPlannerChips(); validatePlanner();
    });
    document.getElementById('planBudget').addEventListener('click', e => {
      const b = e.target.closest('[data-q-budget]'); if (!b) return;
      quiz.budget = quiz.budget === b.dataset.qBudget ? null : b.dataset.qBudget;
      renderPlannerChips(); validatePlanner();
    });
    document.getElementById('planGenerate').addEventListener('click', generatePlan);
    document.getElementById('planRemix').addEventListener('click', () => generatePlan());
    document.getElementById('planPrint').addEventListener('click', () => window.print());
    document.getElementById('planCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(planSummaryText()); toast('Itinerary copied to clipboard', '📋'); }
      catch { toast('Copy is blocked by the browser here', '!'); }
    });
    document.getElementById('planICS').addEventListener('click', downloadICS);
    document.getElementById('planShare').addEventListener('click', sharePlan);

    document.getElementById('planStart').min = Engine.todayISO();
    validatePlanner();
  }

  function bindFood() {
    document.getElementById('foodFilters').addEventListener('click', e => {
      const b = e.target.closest('[data-foodf]'); if (!b) return;
      document.querySelectorAll('#foodFilters [data-foodf]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      renderFood(b.dataset.foodf);
    });
    renderFood('all');
  }

  /* ------------------------------ boot ----------------------------------- */

  function boot() {
    heroClock();
    renderHome();
    buildExploreFilters();
    renderExplore();
    renderFestivals();
    renderTravel();
    bindFood();
    bindHeroSearch();
    bindPlanner();
    bindGlobal();
    bindChat();
    trip.sync();
    heroWeather();
    renderMapList();
    document.getElementById('year').textContent = new Date().getFullYear();
    revealScan();

    const restored = restoreFromHash();
    if (!restored) {
      const hashView = (location.hash.match(/^#\/(\w+)/) || [])[1];
      goto(VIEWS.includes(hashView) ? hashView : 'home');
    }
    window.addEventListener('hashchange', () => {
      const v = (location.hash.match(/^#\/(\w+)/) || [])[1];
      if (v && VIEWS.includes(v) && v !== currentView && !location.hash.startsWith('#trip=')) goto(v);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    trip, goto, openDetail, closeDetail, visibleDestinations,
    prefillPlanner, quizPrefs, quizState
  };
})();
