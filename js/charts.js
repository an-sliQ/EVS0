/* ══════════════════════════════════════════════════════════════════════
   charts.js — Minimal dependency-free SVG charting for the deck.
   Every chart renders into a host element, is responsive, and exposes
   hover/tap tooltips plus click-to-pin data points.
   ══════════════════════════════════════════════════════════════════════ */

const Charts = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, attrs = {}) => {
    const e = document.createElementNS(NS, n);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    return e;
  };
  const fmt = (n, d = 1) => {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(0) + 'k';
    return Number(n).toFixed(d).replace(/\.0$/, '');
  };

  /* ── shared tooltip ─────────────────────────────────────────────── */
  let tip;
  function getTip() {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'tip';
      document.body.appendChild(tip);
    }
    return tip;
  }
  function showTip(x, y, title, body) {
    const t = getTip();
    t.innerHTML = '<b></b><span></span>';
    t.querySelector('b').textContent = title;
    t.querySelector('span').textContent = body;
    t.style.left = x + 'px';
    t.style.top = y + 'px';
    t.classList.add('on');
  }
  function hideTip() { if (tip) tip.classList.remove('on'); }

  function bindTip(node, titleFn, bodyFn) {
    const move = ev => {
      const p = ev.touches ? ev.touches[0] : ev;
      showTip(p.clientX, p.clientY, titleFn(), bodyFn());
    };
    node.addEventListener('mouseenter', move);
    node.addEventListener('mousemove', move);
    node.addEventListener('mouseleave', hideTip);
    node.addEventListener('touchstart', move, { passive: true });
    node.addEventListener('touchend', hideTip);
  }

  /* ══ 1. Multi-series line chart ══════════════════════════════════ */
  /**
   * cfg = { labels, series:[{key,name,color,values,axis:'y1'|'y2',dashed,fmt}],
   *         thresholds:[{axis,value,label,color}], y1:{min,max,label,tickFmt,d},
   *         y2:{min,max,label,d}, marker:{index,label}, animate, minHeight }
   */
  function lineChart(host, cfg) {
    host.innerHTML = '';
    /* optional vertical marker: cfg.marker = { index, label, className } */
    let marker = cfg.marker ? Object.assign({}, cfg.marker) : null;
    let placeMarker = null;
    const draw = () => {
      host.innerHTML = '';
      const W = Math.max(host.clientWidth || 640, 320);
      /* cfg.minHeight keeps a short host (e.g. a compact simulator panel) from
         being drawn into a taller viewBox and squashed by preserveAspectRatio */
      const H = Math.max(host.clientHeight || 320, cfg.minHeight || 220);
      const m = { t: 26, r: cfg.y2 ? 52 : 18, b: 40, l: 46 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const n = cfg.labels.length;

      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img' });
      svg.setAttribute('aria-label', cfg.aria || 'Line chart');
      const axisG = el('g', { class: 'axis' });   // text-only group: keeps CSS off the series
      svg.appendChild(axisG);

      const y1 = cfg.y1, y2 = cfg.y2;
      const sy = (v, ax) => {
        const a = ax === 'y2' && y2 ? y2 : y1;
        const t = (v - a.min) / (a.max - a.min);
        return m.t + ih - t * ih;
      };
      const sx = i => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);

      /* gridlines + y1 ticks */
      const ticks = 4;
      for (let i = 0; i <= ticks; i++) {
        const v = y1.min + (y1.max - y1.min) * (i / ticks);
        const y = sy(v, 'y1');
        svg.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: y, y2: y, class: 'gridline' }));
        const t = el('text', { x: m.l - 8, y: y + 3.4, 'text-anchor': 'end' });
        t.textContent = y1.tickFmt ? y1.tickFmt(v) : fmt(v, y1.d ?? 0);
        axisG.appendChild(t);
      }
      /* y2 ticks */
      if (y2) {
        for (let i = 0; i <= ticks; i++) {
          const v = y2.min + (y2.max - y2.min) * (i / ticks);
          const y = sy(v, 'y2');
          const t = el('text', { x: m.l + iw + 8, y: y + 3.4, 'text-anchor': 'start' });
          t.style.fill = y2.color || '#54638A';
          t.textContent = fmt(v, y2.d ?? 0);
          axisG.appendChild(t);
        }
      }
      /* x labels */
      cfg.labels.forEach((lb, i) => {
        const t = el('text', { x: sx(i), y: m.t + ih + 20, 'text-anchor': 'middle' });
        t.textContent = lb;
        axisG.appendChild(t);
      });

      /* thresholds */
      (cfg.thresholds || []).forEach(th => {
        const y = sy(th.value, th.axis || 'y1');
        const col = th.color || '#FF4D62';
        const ln = el('line', { x1: m.l, x2: m.l + iw, y1: y, y2: y, class: 'thresh' });
        ln.style.stroke = col;
        svg.appendChild(ln);
        const lbl = el('text', { x: m.l + iw - 2, y: y - 6, 'text-anchor': 'end', class: 'thresh-lbl' });
        lbl.style.fill = col;
        lbl.textContent = th.label;
        svg.appendChild(lbl);
      });

      /* x axis baseline */
      svg.appendChild(el('line', { x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih, stroke: 'rgba(150,180,255,.22)' }));

      /* series */
      let delay = 0;
      cfg.series.forEach(s => {
        const g = el('g');
        const pts = s.values.map((v, i) => [sx(i), sy(v, s.axis)]);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        if (s.area) {
          const area = el('path', {
            d: d + ` L ${pts[pts.length - 1][0].toFixed(1)} ${m.t + ih} L ${pts[0][0].toFixed(1)} ${m.t + ih} Z`,
            fill: s.color, class: 'series-area' + (cfg.animate === false ? '' : ' rise')
          });
          area.style.setProperty('--d', delay);
          g.appendChild(area);
        }
        const path = el('path', {
          d, class: 'series-line', stroke: s.color,
          'stroke-dasharray': s.dashed ? '6 4' : undefined
        });
        if (!s.dashed && cfg.animate !== false) {
          const L = pts.reduce((acc, p, i) => i ? acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
          path.style.setProperty('--len', Math.ceil(L) + 2);
          path.classList.add('draw');
          path.style.animationDelay = delay + 'ms';
          delay += 220;
        }
        g.appendChild(path);

        /* A 3.6px dot is not a touch target. Add an invisible hit circle sized
           to the gap between points so taps land without overlapping siblings. */
        const spacing = n > 1 ? iw / (n - 1) : iw;
        const hitR = Math.min(14, Math.max(4.5, spacing * 0.45));

        pts.forEach((p, i) => {
          const ev = s.events && s.events[i];
          const titleFn = () => `${cfg.labels[i]}${ev ? ' · ' + ev.tag : ''}`;
          const bodyFn = () => `${s.name}: ${s.fmt ? s.fmt(s.values[i], i) : fmt(s.values[i], s.d ?? 2)}${s.unit ? ' ' + s.unit : ''}`;
          const select = () => {
            svg.querySelectorAll('.dot.pinned').forEach(d2 => d2.classList.remove('pinned'));
            c.classList.add('pinned');
            c.setAttribute('r', 6.2);
            host.dispatchEvent(new CustomEvent('point', { detail: { index: i, series: s.key, value: s.values[i], event: ev } }));
          };

          const hit = el('circle', { cx: p[0], cy: p[1], r: hitR, class: 'hit' });
          bindTip(hit, titleFn, bodyFn);
          hit.addEventListener('click', select);
          g.appendChild(hit);

          const c = el('circle', { cx: p[0], cy: p[1], r: 3.6, fill: '#070B18', stroke: s.color, 'stroke-width': 2.1, class: 'dot' });
          bindTip(c, titleFn, bodyFn);
          c.addEventListener('click', select);
          g.appendChild(c);

          if (ev) {
            const halo = el('circle', { cx: p[0], cy: p[1], r: 8, fill: 'none', stroke: s.color, 'stroke-width': 1, opacity: .35, 'pointer-events': 'none' });
            halo.classList.add('vennfail');
            g.appendChild(halo);
          }
        });
        svg.appendChild(g);
      });

      /* ── operating-point marker (vertical rule + one dot per series) ── */
      let mRule = null, mLabel = null, mDots = [];
      if (marker) {
        mRule = el('line', { y1: m.t, y2: m.t + ih, class: marker.className || 'markrule', 'pointer-events': 'none' });
        mLabel = el('text', { y: m.t - 9, 'text-anchor': 'middle', class: 'marklbl', 'pointer-events': 'none' });
        svg.appendChild(mRule); svg.appendChild(mLabel);
        mDots = cfg.series.map(s => {
          const c = el('circle', { r: 5, fill: '#070B18', 'stroke-width': 2.4, class: 'markdot', 'pointer-events': 'none' });
          c.style.stroke = s.color;
          svg.appendChild(c);
          return c;
        });
      }
      /* linear read of a series at a possibly fractional index */
      const at = (vals, i) => {
        const i0 = Math.max(0, Math.min(n - 1, Math.floor(i)));
        const i1 = Math.max(0, Math.min(n - 1, i0 + 1));
        const f = Math.max(0, Math.min(1, i - i0));
        return vals[i0] + (vals[i1] - vals[i0]) * f;
      };
      /* positions the marker without redrawing (used by slider drags) */
      placeMarker = (i, label) => {
        if (!mRule) return;
        const idx = Math.max(0, Math.min(n - 1, i));
        const x = sx(idx);
        const near = 62;
        const lx = x < m.l + near ? x + 7 : x > m.l + iw - near ? x - 7 : x;
        mRule.setAttribute('x1', x); mRule.setAttribute('x2', x);
        mLabel.setAttribute('x', lx);
        mLabel.setAttribute('text-anchor', x < m.l + near ? 'start' : x > m.l + iw - near ? 'end' : 'middle');
        mLabel.textContent = (label ?? marker.label) || cfg.labels[Math.round(idx)];
        mDots.forEach((c, k) => {
          const s = cfg.series[k];
          c.setAttribute('cx', x);
          c.setAttribute('cy', sy(at(s.values, idx), s.axis));
        });
      };
      if (marker) placeMarker(marker.index, marker.label);

      host.appendChild(svg);
    };

    draw();
    observe(host, draw);
    return {
      redraw: draw,
      /* move the operating-point marker; pass label to override the tick text */
      setMarker: (index, label) => {
        if (!marker) marker = { index };
        marker.index = index;
        if (label !== undefined) marker.label = label;
        if (placeMarker) placeMarker(marker.index, marker.label);
      }
    };
  }

  /* ══ 2. Heatmap grid ═════════════════════════════════════════════ */
  function heatmap(host, cells, cfg = {}) {
    host.innerHTML = '';
    const ramp = ['#1B2745', '#1E5F6B', '#2FD6C3', '#9BD36B', '#FFC24B', '#FF8A1F', '#FF4D62'];
    const pick = v => ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
    cells.forEach(c => {
      const b = document.createElement('button');
      b.className = 'heat__cell';
      b.type = 'button';
      b.style.background = `radial-gradient(120% 120% at 30% 20%, ${pick(Math.min(.99, c.v + .18))}, ${pick(c.v)})`;
      b.innerHTML = `<span></span>`;
      b.querySelector('span').textContent = cfg.cellLabel ? cfg.cellLabel(c) : '';
      const load = cfg.loadLabel ? cfg.loadLabel(c) : `Load index ${(c.v * 100).toFixed(0)}`;
      b.setAttribute('aria-label', `${cfg.cellName ? cfg.cellName(c) : 'Sector ' + (c.i + 1)} — ${load}`);
      bindTip(b, () => (cfg.cellName ? cfg.cellName(c) : `Sector ${c.i + 1}`), () => load);
      b.addEventListener('click', () => {
        const on = b.classList.contains('is-on');
        host.querySelectorAll('.heat__cell').forEach(x => x.classList.remove('is-on'));
        if (!on) b.classList.add('is-on');
        host.dispatchEvent(new CustomEvent('cell', { detail: { cell: c, on: !on } }));
      });
      host.appendChild(b);
    });
    return { };
  }

  /* ══ 3. Radial stress gauge ══════════════════════════════════════ */
  function gauge(host, cfg) {
    host.innerHTML = '';
    const W = 260, H = 152, cx = W / 2, cy = 128, R = 96;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    svg.setAttribute('aria-label', cfg.aria || 'Stress gauge');
    const a0 = Math.PI, a1 = 0;
    const pt = (a, r) => [cx + Math.cos(a) * r, cy - Math.sin(a) * r];
    const arc = (from, to, r) => {
      const [x1, y1] = pt(from, r), [x2, y2] = pt(to, r);
      const large = Math.abs(to - from) > Math.PI ? 1 : 0;
      return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    };
    /* angles sweep from PI (left) down to 0 (right), i.e. across the top of the dial */
    svg.appendChild(el('path', { d: arc(a0, a1, R), fill: 'none', stroke: '#1B2745', 'stroke-width': 15, 'stroke-linecap': 'round' }));
    const segs = [[0, .45, '#2FD6C3'], [.45, .72, '#FFC24B'], [.72, 1, '#FF4D62']];
    segs.forEach(([f, t, col]) => {
      svg.appendChild(el('path', {
        d: arc(a0 - f * Math.PI, a0 - t * Math.PI, R), fill: 'none',
        stroke: col, 'stroke-width': 15, 'stroke-linecap': 'butt', opacity: .22
      }));
    });
    const prog = el('path', { d: arc(a0, a0, R), fill: 'none', stroke: '#FF4D62', 'stroke-width': 15, 'stroke-linecap': 'round' });
    svg.appendChild(prog);
    const needle = el('circle', { r: 5.5, fill: '#fff', cx: 0, cy: 0 });
    svg.appendChild(needle);
    const val = el('text', { x: cx, y: cy - 40, class: 'gauge__val' });
    const unit = el('text', { x: cx, y: cy - 18, class: 'gauge__lbl' });
    svg.appendChild(val); svg.appendChild(unit);
    const capL = el('text', { x: cx - R, y: cy + 16, class: 'gauge__lbl', 'text-anchor': 'start' }); capL.textContent = 'BASELINE';
    const capR = el('text', { x: cx + R, y: cy + 16, class: 'gauge__lbl', 'text-anchor': 'end' }); capR.textContent = 'FAILURE';
    svg.appendChild(capL); svg.appendChild(capR);
    svg.appendChild(el('path', { d: arc(a0, a1, R - 22), fill: 'none', stroke: 'rgba(150,180,255,.12)', 'stroke-width': 1, 'stroke-dasharray': '2 5' }));
    host.appendChild(svg);

    const set = (t, label) => {
      const f = Math.max(0, Math.min(1, t));
      prog.setAttribute('d', arc(a0, a0 - f * Math.PI, R));
      const [nx, ny] = pt(a0 - f * Math.PI, R);
      needle.setAttribute('cx', nx); needle.setAttribute('cy', ny);
      val.textContent = cfg.format ? cfg.format(t) : (f * 100).toFixed(0);
      unit.textContent = label || '';
      const col = f > .72 ? '#FF4D62' : f > .45 ? '#FFC24B' : '#2FD6C3';
      prog.style.stroke = col;
      val.style.fill = col;
    };
    set(cfg.value ?? 0, cfg.label);
    return { set };
  }

  /* ══ 4. Venn diagram ═════════════════════════════════════════════ */
  function venn(host, cfg) {
    host.innerHTML = '';
    const W = 560, H = 420;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', role: 'img' });
    svg.setAttribute('aria-label', 'Overlap of physical, ecological and socio-psychological carrying capacity');
    const R = 128, cy = 176;
    const sets = [
      { id:'phy', cx: 196, cy: cy,   color:'#45B7FF', name:'Physical TCC',  sub:'space per pilgrim' },
      { id:'eco', cx: 364, cy: cy,   color:'#2FD6C3', name:'Ecological TCC',sub:'assimilative load' },
      { id:'soc', cx: 280, cy: cy + 118, color:'#9B7BFF', name:'Social TCC', sub:'density tolerance' }
    ];
    sets.forEach(s => {
      const g = el('g', { class: 'venn', 'data-set': s.id, tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', s.name);
      const c = el('circle', { cx: s.cx, cy: s.cy, r: R, fill: s.color, 'fill-opacity': .16, stroke: s.color, 'stroke-width': 1.9 });
      g.appendChild(c);
      svg.appendChild(g);
    });
    /* labels drawn after circles so they sit above */
    const labels = [
      { x: 132, y: 116, t: 'PHYSICAL', s: 'space per pilgrim', c: '#45B7FF', anchor: 'middle' },
      { x: 428, y: 116, t: 'ECOLOGICAL', s: 'assimilative load', c: '#2FD6C3', anchor: 'middle' },
      { x: 280, y: 344, t: 'SOCIAL', s: 'density tolerance', c: '#9B7BFF', anchor: 'middle' }
    ];
    labels.forEach(l => {
      const t = el('text', { x: l.x, y: l.y, 'text-anchor': l.anchor, class: 'venn__lbl', fill: l.c });
      t.textContent = l.t; svg.appendChild(t);
      const t2 = el('text', { x: l.x, y: l.y + 15, 'text-anchor': l.anchor, class: 'venn__sub' });
      t2.textContent = l.s; svg.appendChild(t2);
    });
    /* failure core */
    const core = el('g', { class: 'vennfail' });
    core.appendChild(el('circle', { cx: 280, cy: 224, r: 34, fill: '#FF4D62', 'fill-opacity': .2, stroke: '#FF4D62', 'stroke-width': 2 }));
    const ct = el('text', { x: 280, y: 220, 'text-anchor': 'middle', class: 'venn__lbl', fill: '#FF4D62', 'font-size': 10 });
    ct.textContent = 'SYSTEM';
    const ct2 = el('text', { x: 280, y: 233, 'text-anchor': 'middle', class: 'venn__lbl', fill: '#FF4D62', 'font-size': 10 });
    ct2.textContent = 'FAILURE';
    core.appendChild(ct); core.appendChild(ct2);
    svg.appendChild(core);
    host.appendChild(svg);

    const groups = [...svg.querySelectorAll('.venn')];
    const highlight = id => {
      groups.forEach(g => g.classList.toggle('dim', id && g.dataset.set !== id));
      groups.forEach(g => g.classList.toggle('hot', id && g.dataset.set === id));
    };
    groups.forEach(g => {
      const go = () => { highlight(g.dataset.set); host.dispatchEvent(new CustomEvent('set', { detail: { id: g.dataset.set } })); };
      g.addEventListener('mouseenter', go);
      g.addEventListener('focus', go);
      g.addEventListener('click', go);
      g.addEventListener('mouseleave', () => { highlight(null); host.dispatchEvent(new CustomEvent('set', { detail: { id: null } })); });
      g.addEventListener('blur', () => highlight(null));
    });
    return { highlight };
  }

  /* ══ 5. Responsive redraw helper ════════════════════════════════ */
  const observed = new WeakSet();
  function observe(host, fn) {
    host.__redraw = fn;                 // always call the most recent renderer
    if (observed.has(host)) return;
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => { if (typeof host.__redraw === 'function') host.__redraw(); }, 130);
    });
    ro.observe(host);
    observed.add(host);
  }

  return { lineChart, heatmap, gauge, venn, showTip, hideTip, observe, fmt };
})();
