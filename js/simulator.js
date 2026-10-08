/* ══════════════════════════════════════════════════════════════════════
   simulator.js — Capacity simulator + decision matrix.

   One shared model, two views:
     · slide 10  capacity simulator — crowd / river / waste pressure against
                 their limits, with the binding constraint named live
     · slide 11  decision matrix — intervention packages scored against
                 weighted criteria; applying a package changes the model

   The engine is calibrated so that the default state reproduces the
   documented peak day of Maha Kumbh 2025 (see js/data.js sources and the
   model note on slide 11). Coefficients are illustrative; the relationships
   are the ones the monitoring record actually showed.
   ══════════════════════════════════════════════════════════════════════ */

const Simulator = (() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  /* ══ 1. Calibration ═══════════════════════════════════════════════
     Reference points taken from the reported record:
       480 MLD of sewage generated on a peak day (NGT projection band 450–519)
       650 MT/day of waste reaching the Baswar processing plant
       2,500 MPN/100 mL coliform criterion and the 3 mg/L BOD bathing limit
       10,000+ persons per hectare at peak on the Mela ground               */
  const CAL = {
    refInflow: 60,        // M pilgrims/day — reference peak bathing day
    refSewage: 480,       // MLD generated at the reference inflow
    refWaste: 650,        // MT/day reaching the plant at the reference inflow
    peakHourShare: 0.075, // share of the day's bathing traffic in the busiest hour
    corridorResidence: .15, // hours spent inside the bathing corridor
    corridorDepth: 30,    // metres of corridor depth at the water's edge
    approachDepth: 60,    // metres of apron where unmet arrivals queue
    bathingWindow: 18,    // hours of usable bathing in the day
    controlDensity: 2.5,  // persons/m² operational control band
    crushDensity: 6,      // persons/m² physical ceiling — crowds cannot stack denser
    bgBod: 1.6,           // upstream BOD, mg/L
    bgFc: 200,            // upstream faecal coliform, MPN/100 mL
    bgDo: 8.2,            // upstream dissolved oxygen, mg/L
    rawBod: 250,          // raw sewage BOD, mg/L
    rawFc: 1e7,           // raw sewage faecal coliform, MPN/100 mL
    fcSurvival: .08,      // share of coliform surviving transit to the reach
    mixShare: .15,        // share of reach flow available for near-field mixing
    bodLimit: 3,          // mg/L bathing criterion
    fcLimit: 2500,        // MPN/100 mL maximum permissible limit
    doFloor: 5,           // mg/L minimum dissolved oxygen
    watchAt: .7           // pressure ratio at which an axis turns amber
  };

  /* ══ 2. Levers ════════════════════════════════════════════════════ */
  const LEVERS = [
    { key:'inflow',    label:'Peak-day pilgrims',  unit:'M/day',      min:10,  max:100,  step:1,   value:60,  d:0 },
    { key:'frontage',  label:'Bathing frontage',   unit:'km',         min:2,   max:20,   step:.5,  value:12,  d:1 },
    { key:'ghatRate',  label:'Ghat turnaround',    unit:'bathers/m·h',min:250, max:700,  step:10,  value:450, d:0 },
    { key:'treatment', label:'Treatment online',   unit:'MLD',        min:100, max:900,  step:10,  value:400, d:0 },
    { key:'flow',      label:'Reach flow',         unit:'m³/s',       min:200, max:3000, step:50,  value:900, d:0 },
    { key:'wastecap',  label:'Waste processing',   unit:'MT/day',     min:100, max:1200, step:25,  value:650, d:0 }
  ];
  const base = {};
  LEVERS.forEach(l => { base[l.key] = l.value; });

  /* ══ 3. Shared state: applied packages + criterion weights ═════════ */
  const PKG = {};
  (DECK.simPackages || []).forEach(p => { PKG[p.id] = p; });
  const activePkg = new Set();
  const weights = {};
  (DECK.simCriteria || []).forEach(c => { weights[c.key] = c.weight; });
  const criteria = DECK.simCriteria || [];

  let selectedPkg = (DECK.simPackages[0] || {}).id || null;

  /* subscribers redraw at most once per frame */
  const subs = new Set();
  let pending = false;
  function notify() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      subs.forEach(fn => { try { fn(); } catch (e) { console.warn('sim render', e); } });
    });
  }
  function subscribe(fn) { subs.add(fn); fn(); }

  /* ══ 4. The engine ════════════════════════════════════════════════ */
  const num = (v, d = 0) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

  function effectsOf(ids) {
    const e = { frontageAdd:0, treatmentAdd:0, wasteAdd:0, flowMul:1, spreadMul:1 };
    ids.forEach(id => {
      const fx = (PKG[id] || {}).effect;
      if (!fx) return;
      e.frontageAdd  += fx.frontageAdd  || 0;
      e.treatmentAdd += fx.treatmentAdd || 0;
      e.wasteAdd     += fx.wasteAdd     || 0;
      e.flowMul      *= fx.flowMul      || 1;
      e.spreadMul    *= fx.spreadMul    || 1;
    });
    return e;
  }

  /**
   * compute(state, ids) → every quantity the two views display.
   * Pressure is always expressed as a multiple of the axis limit, so the
   * three axes are directly comparable and the binding one is simply the
   * maximum.
   */
  function compute(state = base, ids = activePkg) {
    const e = effectsOf(ids);
    const L = {
      inflow:    state.inflow,
      frontage:  state.frontage  + e.frontageAdd,
      ghatRate:  state.ghatRate,
      treatment: state.treatment + e.treatmentAdd,
      flow:      state.flow      * e.flowMul,
      wastecap:  state.wastecap  + e.wasteAdd,
      peakShare: CAL.peakHourShare * e.spreadMul
    };
    const inflow  = L.inflow * 1e6;                       // pilgrims / day
    const scale   = L.inflow / CAL.refInflow;

    /* ── crowd: throughput through the bathing corridor ── */
    const arrivalsHr   = inflow * L.peakShare;            // bathers arriving in the peak hour
    const capacityHr   = L.frontage * 1000 * L.ghatRate;  // bathers the frontage can pass per hour
    const passedHr     = Math.min(arrivalsHr, capacityHr);
    const stranded     = Math.max(0, arrivalsHr - capacityHr);
    const corridorM2   = L.frontage * 1000 * CAL.corridorDepth;
    const apronM2      = L.frontage * 1000 * CAL.approachDepth;
    const density      = passedHr * CAL.corridorResidence / corridorM2;      // persons / m²
    const queueRaw     = stranded / apronM2;              // would exceed the physical ceiling at extremes
    const queueDensity = Math.min(CAL.crushDensity, queueRaw);
    const crowdPressure = Math.max(density, queueDensity) / CAL.controlDensity;
    const governing    = queueDensity > density ? queueDensity : density;
    const dailyLoad    = inflow / (L.frontage * 1000 * L.ghatRate * CAL.bathingWindow);

    /* ── river: untreated discharge against dilution ── */
    const sewage    = CAL.refSewage * scale;              // MLD generated
    const treated   = Math.min(sewage, L.treatment);
    const untreated = Math.max(0, sewage - treated);
    const reachVol  = 86400 * L.flow * CAL.mixShare;      // m³/day of mixing volume
    const bodAdded  = CAL.rawBod * (untreated * 1000) / reachVol;
    const bod       = CAL.bgBod + bodAdded;
    const fc        = CAL.bgFc + CAL.rawFc * ((untreated * 1000) / reachVol) * CAL.fcSurvival;
    const dox       = Math.max(.3, CAL.bgDo * Math.exp(-.085 * bodAdded));
    const riverPressure = Math.max(bod / CAL.bodLimit, fc / CAL.fcLimit, CAL.doFloor / dox);

    /* ── waste: arrival against processing capacity ── */
    const waste = CAL.refWaste * scale;                   // MT/day generated
    const wastePressure = waste / L.wastecap;

    const band = p => p > 1 ? 'breach' : p >= CAL.watchAt ? 'watch' : 'safe';

    const axes = [
      {
        key:'crowd', label:'Crowd & physical', short:'Crowd', pressure: crowdPressure, band: band(crowdPressure),
        readout: queueDensity > density ? `${num(stranded / 1e6, 1)} M held back` : `${num(passedHr / 1e6, 2)} M bathers/h`,
        detail: `${density.toFixed(1)} p/m² in the corridor · ${num((arrivalsHr / capacityHr) * 100, 0)}% of hourly capacity` +
          (stranded > 0 ? ` · ${num(stranded / 1e6, 1)} M queued at ${queueDensity.toFixed(1)} p/m²` : ''),
        verdict: `Peak-hour arrivals reach ${num(arrivalsHr / 1e6, 2)} M against a ghat throughput of ${num(capacityHr / 1e6, 2)} M bathers/h, so ${num((arrivalsHr / capacityHr) * 100, 0)}% of the corridor&rsquo;s hourly capacity is in use. Corridor density lands at ${density.toFixed(1)} persons/m² against a ${CAL.controlDensity} persons/m² control band` +
          (stranded > 0 ? `, with ${num(stranded / 1e6, 1)} M people held on the approaches at ${queueDensity.toFixed(1)} persons/m²${queueRaw >= CAL.crushDensity ? ' — the physical ceiling, which means the queue spills beyond the apron and the model stops being meaningful' : ''}` : '') + `.`
      },
      {
        key:'river', label:'River & ecological', short:'River', pressure: riverPressure, band: band(riverPressure),
        readout: `${num(fc, 0)} MPN/100 mL`,
        detail: `BOD ${bod.toFixed(2)} mg/L · DO ${dox.toFixed(1)} mg/L · ${num(untreated, 0)} MLD untreated`,
        verdict: `${num(untreated, 0)} MLD of the ${num(sewage, 0)} MLD generated reaches the reach untreated. Near-field coliform settles at ${num(fc, 0)} MPN/100 mL — ${(fc / CAL.fcLimit).toFixed(2)}× the ${num(CAL.fcLimit, 0)} criterion — with BOD at ${bod.toFixed(2)} mg/L against a ${CAL.bodLimit} mg/L bathing limit.`
      },
      {
        key:'waste', label:'Waste & land', short:'Waste', pressure: wastePressure, band: band(wastePressure),
        readout: `${num(waste, 0)} MT/day`,
        detail: `${num(L.wastecap, 0)} MT/day processing capacity`,
        verdict: `${num(waste, 0)} MT/day of solid waste arrives against ${num(L.wastecap, 0)} MT/day of processing capacity, and the surplus is what ends up banked along the ghats.`
      }
    ];

    const peak = axes.reduce((a, b) => (b.pressure > a.pressure ? b : a), axes[0]);
    return {
      L, levers: L, effective: e, axes, pressure: { crowd: crowdPressure, river: riverPressure, waste: wastePressure },
      crowd: { arrivalsHr, capacityHr, passedHr, stranded, density, queueDensity, dailyLoad },
      river: { sewage, treated, untreated, bod, bodAdded, fc, dox },
      waste: { load: waste, capacity: L.wastecap },
      binding: peak.pressure >= 1 ? peak : (peak.pressure >= CAL.watchAt ? peak : null),
      peak
    };
  }

  /* state-aware helpers used by both views */
  const current = () => compute(base, activePkg);

  /* ══ 5. Small markup helpers (mirrors slides.js conventions) ══════ */
  const head = ({ num: n, kicker, title, tag }) => `
    <header class="shead">
      <div class="shead__num">${n}</div>
      <div class="shead__meta">
        <p class="kicker">${kicker}</p>
        <h2>${title}</h2>
      </div>
      ${tag ? `<div class="shead__tag">${tag}</div>` : ''}
    </header>`;
  const brief = (items, tone = '') => `
    <ol class="brief ${tone ? 'brief--' + tone : ''}">${
      items.map((t, i) => `<li data-n="${String(i + 1).padStart(2, '0')}" style="--i:${i}"><span>${t}</span></li>`).join('')
    }</ol>`;
  const cite = t => `<p class="datacite"><b>Sources &middot;</b> ${t}</p>`;

  /* cross-slide jump buttons (handled by app.js) */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-goto]');
    if (!b) return;
    document.dispatchEvent(new CustomEvent('deck:goto', { detail: { index: parseInt(b.dataset.goto, 10) - 1, overlay: b.dataset.overlay } }));
  });

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 10 · Capacity simulator
     ══════════════════════════════════════════════════════════════════ */
  function slideSimulator() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 'sSimulator';
    node.innerHTML = `
      ${head({ num:'10', kicker:'Decision support I', title:'Where the Limit Binds — <em>Crowd vs. Ecology</em>', tag:'Live simulator' })}
      <div class="sbody">
        <div class="svisual">
          <div class="sim" id="simWrap">
            <div class="panel__t panel__t--flush panel__t--wrap">
              <span>Pressure envelope — each axis as a multiple of its limit (log&#8322; scale)</span>
              <span class="panelside">
                <span class="livechip" id="simChip">Live model</span>
                <button class="linkbtn" type="button" id="simReset">Reset to 2025 baseline</button>
              </span>
            </div>
            <div class="sim__limits" id="simLimits"></div>
            <div class="sim__envelope">
              <div class="chartwrap" id="simChart"></div>
              <div class="legend">
                <span><i style="background:#45B7FF"></i>Crowd</span>
                <span><i style="background:#2FD6C3"></i>River</span>
                <span><i style="background:#FFC24B"></i>Waste</span>
                <span><i style="background:#FF4D62"></i>Limit 1.0&times;</span>
                <span><i style="background:#8A9EC2"></i>Operating point</span>
              </div>
            </div>
            <div class="sim__levers" id="simLevers"></div>
            <div class="bind" id="simBind"></div>
          </div>
        </div>
        <div class="scontent">
          ${brief([
            '<b>Crowd limit:</b> ghat throughput per hour',
            '<b>Ecological limit:</b> untreated load versus flow',
            '<b>Binding constraint moves</b> as levers change',
            'Move sliders: watch the envelope re-cross',
            'Click the curve to set inflow',
            '<b>80 MLD untreated</b> reopens coliform breach'
          ], 'cyan')}
          <div class="panel">
            <p class="panel__t"><span>Model note</span><span class="panelhint">Calibrated to the 2025 peak</span></p>
            <p class="panel__body">
              The engine is built on flow and dilution rather than on a single capacity number. Its default state
              reproduces the documented peak day &mdash; about 480 MLD of sewage generated against 400 MLD treated,
              650 MT/day of waste reaching the Baswar plant, and a near-field coliform load above the
              2,500 MPN/100 mL criterion &mdash; so the levers start where the 2025 record starts.
              Coefficients are illustrative; the relationships are the ones the monitoring data showed.
            </p>
          </div>
          <p class="datacite datacite--flush">
            <b>Active packages &middot;</b> <span id="simPkgNote">none</span>
          </p>
          <button class="linkbtn" data-goto="11">Open the decision matrix &rarr;</button>
          ${cite('CPCB and UPPCB monitoring placed before the NGT, Jan&ndash;Feb 2025; NGT sewage-load projection; IPE Global demand assessment; Mela Authority sanitation records.')}
        </div>
      </div>`;

    const limitsEl  = $('#simLimits', node);
    const chartHost = $('#simChart', node);
    const leversEl  = $('#simLevers', node);
    const bindEl    = $('#simBind', node);
    const pkgNote   = $('#simPkgNote', node);
    const chip      = $('#simChip', node);

    /* ── levers ── */
    leversEl.innerHTML = LEVERS.map(l => `
      <div class="lever" data-k="${l.key}">
        <label for="lv-${l.key}">${l.label}</label>
        <output id="out-${l.key}">${num(base[l.key], l.d)}<small> ${l.unit}</small></output>
        <input type="range" id="lv-${l.key}" min="${l.min}" max="${l.max}" step="${l.step}" value="${base[l.key]}"
               aria-label="${l.label} in ${l.unit}" />
      </div>`).join('');

    leversEl.addEventListener('input', e => {
      const input = e.target.closest('input[type=range]');
      if (!input) return;
      const key = input.closest('.lever').dataset.k;
      base[key] = parseFloat(input.value);
      notify();
    });
    $('#simReset', node).addEventListener('click', reset);

    /* ── pressure envelope ── */
    const SWEEP = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const LOG = v => Math.log2(Math.max(.03, Math.min(16, v)));

    let params = null;
    let chart = null;

    function sweep() {
      return SWEEP.map(v => compute(Object.assign({}, base, { inflow: v }), activePkg));
    }
    function chartCfg(pts) {
      const mk = (key, name, color) => ({
        key, name, color, axis:'y1',
        values: pts.map(p => LOG(p.pressure[key])),
        unit:'× limit', d:2,
        fmt: (v, i) => `${pts[i].pressure[key].toFixed(2)}× the limit`
      });
      return {
        animate: false,
        minHeight: 150,
        aria: 'Crowd, river and waste pressure against the peak-day inflow',
        labels: SWEEP.map(v => `${v} M`),
        y1: {
          min: -4, max: 4, d: 1,
          tickFmt: v => {
            if (v >= 4) return '16+';
            const x = Math.pow(2, v);
            return x < 1 ? x.toFixed(2) : x.toFixed(0);
          }
        },
        series: [mk('crowd', 'Crowd pressure', '#45B7FF'), mk('river', 'River pressure', '#2FD6C3'), mk('waste', 'Waste pressure', '#FFC24B')],
        thresholds: [{ axis:'y1', value: 0, label:'operating limit · 1.0×', color:'#FF4D62' }],
        marker: {
          index: (base.inflow - SWEEP[0]) / (SWEEP[1] - SWEEP[0]),
          label: `${num(base.inflow, 0)} M/day`,
          className: 'markrule'
        }
      };
    }
    function drawChart(pts) {
      if (!chart) {
        params = chartCfg(pts);
        chart = Charts.lineChart(chartHost, params);
        chartHost.addEventListener('point', e => {
          /* clicking a point on the envelope moves the operating inflow */
          const v = SWEEP[e.detail.index];
          if (v === undefined) return;
          base.inflow = v;
          notify();
        });
      } else {
        /* refresh the series values in place, then redraw (no re-animation) */
        const fresh = chartCfg(pts);
        fresh.series.forEach((s, i) => {
          params.series[i].values = s.values;
          params.series[i].fmt = s.fmt;
        });
        chart.redraw();
      }
    }

    /* ── axis cards ── */
    function renderLimits(res) {
      limitsEl.innerHTML = res.axes.map(a => {
        const pct = Math.max(4, Math.min(100, (a.pressure / 2) * 100));
        const isBind = res.binding && res.binding.key === a.key;
        const tag = a.pressure > 1 ? 'over limit' : a.pressure >= CAL.watchAt ? 'watch' : 'inside band';
        return `<div class="limit limit--${a.band}${isBind ? ' limit--bind' : ''}" data-k="${a.key}">
          <div class="limit__top">
            <span class="limit__n">${a.label}</span>
            <span class="limit__x">${a.pressure.toFixed(2)}<small>&times;</small></span>
          </div>
          <div class="limit__bar"><i style="width:${pct}%"></i></div>
          <div class="limit__d">${a.readout}</div>
          <div class="limit__d">${a.detail}</div>
          <div class="limit__st">${tag}</div>
        </div>`;
      }).join('');
    }

    /* ── verdict ── */
    function renderBind(res) {
      const b = res.binding;
      if (!b) {
        bindEl.className = 'bind bind--safe';
        bindEl.innerHTML = `<span class="bind__l">Binding constraint</span>
          <b>No axis is over its limit</b>
          <p>All three pressures sit inside their control bands at this lever setting. The next binding limit is
          ${res.peak.label.toLowerCase()} at ${res.peak.pressure.toFixed(2)}&times; — the axis that would break first if the peak grew.</p>`;
        return;
      }
      bindEl.className = `bind bind--${b.pressure > 1 ? 'breach' : 'watch'}`;
      bindEl.innerHTML = `<span class="bind__l">Binding constraint &mdash; ${b.label} at ${b.pressure.toFixed(2)}&times;</span>
        <b>${b.pressure > 1 ? 'The ' + b.short.toLowerCase() + ' limit is already breached' : 'The ' + b.short.toLowerCase() + ' limit is the closest to breaking'}</b>
        <p>${b.verdict}</p>`;
    }

    /* ── full render ── */
    function render() {
      /* the sliders are driven by the model state, not the other way round,
         so a reset or a state change elsewhere is reflected here too */
      LEVERS.forEach(l => {
        const input = $(`#lv-${l.key}`, node);
        if (input && parseFloat(input.value) !== base[l.key]) input.value = base[l.key];
        const out = $(`#out-${l.key}`, node);
        if (out) out.innerHTML = `${num(base[l.key], l.d)}<small> ${l.unit}</small>`;
      });

      const res = current();
      const pts = sweep();
      drawChart(pts);
      renderLimits(res);
      renderBind(res);

      /* move the operating-point marker without re-drawing the series */
      const idx = Math.max(0, Math.min(SWEEP.length - 1, (base.inflow - SWEEP[0]) / (SWEEP[1] - SWEEP[0])));
      chart.setMarker(idx, `${num(base.inflow, 0)} M/day`);

      const on = [...activePkg].map(id => (PKG[id] || {}).name).filter(Boolean);
      pkgNote.textContent = on.length ? `${on.join(' · ')}` : 'none — every effect below is the base lever setting';
      const breaching = res.binding && res.binding.pressure > 1;
      chip.textContent = breaching ? 'Breach active' : res.binding ? 'Watch' : 'Inside bands';
      chip.className = 'livechip' + (breaching ? ' livechip--crimson' : res.binding ? ' livechip--amber' : '');
    }

    const init = () => {
      subscribe(render);   /* subscribe paints once immediately */
      return {};
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 11 · Decision matrix
     ══════════════════════════════════════════════════════════════════ */
  function slideMatrix() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 'sMatrix';
    const headCols = criteria.map(c => `
      <th data-k="${c.key}" title="${c.hint}">
        <span>${c.label}</span>
        <span class="wstep">
          <button type="button" data-w="-1" aria-label="Reduce weight of ${c.full}">−</button>
          <b data-v>${weights[c.key]}</b>
          <button type="button" data-w="1" aria-label="Increase weight of ${c.full}">+</button>
        </span>
      </th>`).join('');
    node.innerHTML = `
      ${head({ num:'11', kicker:'Decision support II', title:'Choosing Levers by <em>Weighted Trade-off</em>', tag:'Decision matrix' })}
      <div class="sbody sbody--flip">
        <div class="svisual">
          <div class="mx" id="mxWrap">
            <div class="mx__top">
              <div class="mx__summary" id="mxSummary"></div>
              <button class="linkbtn" data-goto="10">&larr; Capacity simulator</button>
            </div>
            <div class="mx__scroll">
              <table class="mx__table">
                <thead>
                  <tr>
                    <th class="mx__rank">#</th>
                    <th class="mx__pkg">Package</th>
                    ${headCols}
                    <th>Score</th>
                    <th>Apply</th>
                  </tr>
                </thead>
                <tbody id="mxBody"></tbody>
              </table>
            </div>
            <div class="mx__detail" id="mxDetail"></div>
            <p class="mx__hint">Weights (0–4) are your policy priorities and re-rank the table. Scores are modelled judgements of each
            package on a 0–10 scale, not measurements. Applying a package wires its effect into the shared model &mdash;
            the capacity simulator, the axis cards and the summary above all move with it.</p>
          </div>
        </div>
        <div class="scontent">
          ${brief([
            'Six packages, <b>five weighted criteria</b>',
            'Change a weight, the <b>ranking reorders</b>',
            'Apply packages to the <b>capacity simulator</b>',
            'Impact and delivery criteria weigh differently',
            '<b>Binding constraint moves</b> with each apply',
            'Scores are modelled judgements, not measurements'
          ], 'violet')}
          <div class="panel">
            <p class="panel__t"><span>Reading the matrix</span></p>
            <p class="panel__body">
              A weighted matrix will not choose for you. What it does is make the argument explicit: raise the weight on
              river health and the cheap crowd-control package loses its lead to treatment capacity, which is slower and
              dearer but the only lever that subtracts directly from the untreated load.
            </p>
          </div>
          ${cite('Package effects are applied to the calibrated model on slide 11; feasibility and speed scores reflect reported delivery experience of the 2025 arrangements (ICCC, PIB and Mela Authority briefings).')}
        </div>
      </div>`;

    const body    = $('#mxBody', node);
    const summary = $('#mxSummary', node);
    const detail  = $('#mxDetail', node);

    /* ── weights ── */
    $('thead', node).addEventListener('click', e => {
      const b = e.target.closest('button[data-w]');
      if (!b) return;
      const k = b.closest('th').dataset.k;
      weights[k] = Math.max(0, Math.min(4, weights[k] + parseInt(b.dataset.w, 10)));
      render();
    });

    /* ── totals and ranking ── */
    const totalOf = p => {
      let got = 0, max = 0;
      criteria.forEach(c => {
        const w = weights[c.key] || 0;
        got += w * (p.scores[c.key] || 0);
        max += w * 10;
      });
      return max ? (got / max) * 100 : 0;
    };
    const ranked = () => DECK.simPackages
      .map(p => ({ p, score: totalOf(p) }))
      .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id));

    /* what does this package do to the limit that binds right now? */
    function preview(p) {
      const now = current();
      const after = compute(base, new Set([...activePkg, p.id]));
      const key = (now.binding || now.peak).key;
      const a = now.pressure[key], b = after.pressure[key];
      return { key, before: a, after: b, delta: b - a, fixes: a > 1 && b <= 1 };
    }

    function render() {
      const rows = ranked();
      const now = current();
      const bind = now.binding || now.peak;

      /* header weight readouts (the table is rebuilt below, its head is not) */
      node.querySelectorAll('thead th[data-k]').forEach(th => {
        const b = th.querySelector('.wstep b');
        if (b) b.textContent = weights[th.dataset.k];
      });

      body.innerHTML = rows.map((r, i) => {
        const p = r.p;
        const on = activePkg.has(p.id);
        const pv = preview(p);
        const cls = pv.fixes ? 'fix' : pv.delta < -0.01 ? 'ease' : '';
        const tag = pv.fixes ? 'clears the binding limit' : pv.delta < -0.01
          ? `${pv.key} ${pv.before.toFixed(2)}× → ${pv.after.toFixed(2)}×`
          : `no relief on the binding limit`;
        const cells = criteria.map(c => {
          const s = p.scores[c.key] || 0;
          const band = s >= 8 ? 'hi' : s >= 6 ? 'mid' : s <= 3 ? 'low' : '';
          return `<td><span class="sc ${band ? 'sc--' + band : ''}"><b>${s}</b><i style="--w:${s * 10}%"></i></span></td>`;
        }).join('');
        const tot = r.score;
        return `<tr data-id="${p.id}" data-rank="${i + 1}" class="${on ? 'is-on' : ''}${selectedPkg === p.id ? ' is-sel' : ''}">
          <td><span class="rank">${i + 1}</span></td>
          <td class="mx__pkg">
            <b>${p.name}</b>
            <i>${p.sub}</i>
            <em class="${cls}">${tag}</em>
          </td>
          ${cells}
          <td><span class="tot"><b>${tot.toFixed(0)}</b><i style="--w:${tot}%"></i></span></td>
          <td><button class="mx__apply" type="button" aria-pressed="${on}" data-id="${p.id}">${on ? 'Applied' : 'Apply'}</button></td>
        </tr>`;
      }).join('');

      const on = [...activePkg].map(id => (PKG[id] || {}).name).filter(Boolean);
      const lead = rows[0];
      summary.innerHTML =
        `<b>${lead.p.name}</b> leads at <b>${lead.score.toFixed(0)}</b>/100 under the current weights ·
         binding limit: <span class="${bind.pressure > 1 ? 'hot' : bind.pressure >= CAL.watchAt ? '' : 'ok'}">${bind.short}
         ${bind.pressure.toFixed(2)}×</span> ·
         ${on.length ? `${on.length} package${on.length > 1 ? 's' : ''} applied` : 'no packages applied'}`;

      const sel = PKG[selectedPkg] || rows[0].p;
      const pv = preview(sel);
      detail.innerHTML = `<b>${sel.name}</b> &mdash; ${sel.note}
        <span class="fx">${pv.fixes ? `applying it clears the binding ${pv.key} limit (${pv.before.toFixed(2)}× → ${pv.after.toFixed(2)}×)`
          : pv.delta < -0.01 ? `applying it moves the binding ${pv.key} limit ${pv.before.toFixed(2)}× → ${pv.after.toFixed(2)}×`
          : `applying it leaves the binding ${pv.key} limit at ${pv.before.toFixed(2)}×`}</span>`;
    }

    body.addEventListener('click', e => {
      const btn = e.target.closest('.mx__apply');
      if (btn) {
        const id = btn.dataset.id;
        activePkg.has(id) ? activePkg.delete(id) : activePkg.add(id);
        selectedPkg = id;
        notify();
        return;
      }
      const tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      selectedPkg = tr.dataset.id;
      notify();
    });

    const init = () => { subscribe(render); return {}; };
    return { node, init };
  }

  /* reset helper (used by the help sheet / tests) */
  function reset() {
    LEVERS.forEach(l => { base[l.key] = l.value; });
    activePkg.clear();
    criteria.forEach(c => { weights[c.key] = c.weight; });
    selectedPkg = (DECK.simPackages[0] || {}).id || null;
    notify();
  }

  return { slideSimulator, slideMatrix, compute, reset, subscribe, LEVERS, base, activePkg, weights, CAL };
})();
