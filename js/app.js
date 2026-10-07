/* ══════════════════════════════════════════════════════════════════════
   app.js — Deck controller: navigation, keyboard, swipe, overview grid,
   guided walkthrough, ambient sound and per-slide lifecycles.
   ══════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const deckEl      = $('#deck');
  const dotsEl      = $('#dots');
  const gridEl      = $('#overviewGrid');
  const progressEl  = $('#progressFill');
  const curNumEl    = $('#curNum');
  const totNumEl    = $('#totNum');
  const slideLabelEl= $('#slideLabel');
  const srStatus    = $('#srStatus');
  const guideEl     = $('#guide');
  const guideTagEl  = $('#guideTag');
  const guideTextEl = $('#guideText');
  const hintEl      = $('#nxHint');
  const btnPrevEl   = $('#btnPrev');
  const btnNextEl   = $('#btnNext');

  /* Users who ask for less motion get a static deck: no slide transitions,
     no looping simulations, no drifting photographs. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(hover: none)');

  let slides = [];
  let current = -1;
  let guideOn = false;
  let guideTimer = null;
  let tickTimer = null;
  let soundOn = false;
  let audioCtx = null;

  const pad2 = n => String(n).padStart(2, '0');

  /* ── build ──────────────────────────────────────────────────────── */
  slides = Slides.build();
  slides.forEach(s => deckEl.appendChild(s.node));

  /* dots + overview grid (both are ordered lists, so wrap in <li>) */
  slides.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.label = `${pad2(i + 1)} · ${s.meta.label}`;
    b.setAttribute('aria-label', `Go to slide ${i + 1} of ${slides.length}: ${s.meta.label}`);
    b.innerHTML = '<i></i>';
    b.addEventListener('click', () => go(i));
    li.appendChild(b);
    dotsEl.appendChild(li);

    const gi = document.createElement('li');
    const g = document.createElement('button');
    g.type = 'button';
    g.dataset.i = i;
    g.innerHTML = `<b>Slide ${pad2(i + 1)}</b><strong>${s.meta.label}</strong><em>${s.meta.note}</em>`;
    g.addEventListener('click', () => { closeOverlays(); go(i); });
    gi.appendChild(g);
    gridEl.appendChild(gi);
  });
  totNumEl.textContent = pad2(slides.length);

  /* initialise each slide once (constructs charts etc.) */
  slides.forEach(s => {
    try { s.lifecycle = s.init(s.node) || {}; }
    catch (err) { console.warn('slide init failed', s.meta.id, err); s.lifecycle = {}; }
  });

  /* ── navigation ─────────────────────────────────────────────────── */
  function go(i, opts = {}) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === current) return;
    const prev = current;
    current = i;

    slides.forEach((s, k) => {
      s.node.classList.toggle('is-active', k === i);
      s.node.classList.toggle('is-prev', k === i - 1 && prev !== -1);
      s.node.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });

    /* per-slide lifecycles */
    slides.forEach((s, k) => {
      const L = s.lifecycle || {};
      if (k === i) {
        /* a deck always starts at the top of a slide */
        if (s.node.scrollTop) s.node.scrollTop = 0;
        if (L.activate) L.activate();
        /* replay chart draw-in animations on every visit */
        if (L.redraw) requestAnimationFrame(() => { try { L.redraw(); } catch (e) {} });
      } else {
        if (L.deactivate) L.deactivate();
      }
    });

    /* sensor simulation interval (slide 5) */
    clearInterval(tickTimer); tickTimer = null;
    const live = slides[i].lifecycle;
    if (live && typeof live.tick === 'function') {
      tickTimer = setInterval(live.tick, live.interval || 1600);
    }

    /* chrome */
    progressEl.style.width = ((i + 1) / slides.length * 100) + '%';
    curNumEl.textContent = pad2(i + 1);
    slideLabelEl.textContent = slides[i].meta.label;
    $$('#dots button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    $$('#overviewGrid button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    btnPrevEl.disabled = i === 0;
    btnNextEl.disabled = i === slides.length - 1;
    document.title = `${pad2(i + 1)} · ${slides[i].meta.label} — Digital Assessment of Carrying Capacity`;

    srStatus.textContent = `Slide ${i + 1} of ${slides.length}: ${slides[i].meta.label}`;
    Charts.hideTip();

    if (guideOn && !opts.silentGuide) {
      showGuide(i);
      scheduleGuide();
    }

    dismissHint();

    /* keep the URL shareable without reloading or spamming history */
    const hash = `#slide-${i + 1}`;
    try {
      if (location.hash !== hash) history.replaceState(null, '', hash);
    } catch (e) {}
  }
  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  btnNextEl.addEventListener('click', next);
  btnPrevEl.addEventListener('click', prev);

  /* ── keyboard ───────────────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (!$('#help').hidden || !$('#overview').hidden) {
      if (e.key === 'Escape') closeOverlays();
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); next(); break;
      case 'ArrowLeft':  case 'PageUp':            e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End':  e.preventDefault(); go(slides.length - 1); break;
      case 'o': case 'O': openOverview(); break;
      case '?': case '/': e.preventDefault(); openHelp(); break;
      case 'g': case 'G': toggleGuide(); break;
      case 's': case 'S': toggleSound(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      default:
        if (/^[0-9]$/.test(e.key)) {
          const n = e.key === '0' ? slides.length - 1 : parseInt(e.key, 10) - 1;
          if (n < slides.length) go(n);
        }
    }
  });

  /* ── cross-slide links (e.g. simulator ⇄ decision matrix) ───────── */
  document.addEventListener('deck:goto', e => {
    const i = e.detail && e.detail.index;
    if (typeof i !== 'number') return;
    closeOverlays();
    go(i);
  });

  /* ── swipe ──────────────────────────────────────────────────────── */
  /* Only skip the gesture where a drag is meaningful to the widget under the
     finger. Everything else — including cards and rows — stays swipeable. */
  const NO_SWIPE = 'input,textarea,select,[data-no-swipe],.chartwrap,.heat__grid,.mx__scroll,.crowd__stage,.bp,.sensorlist';

  let tx = 0, ty = 0, tt = 0, swiping = false;
  deckEl.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { swiping = false; return; }
    if (e.target.closest(NO_SWIPE)) { swiping = false; return; }
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now(); swiping = true;
  }, { passive: true });

  deckEl.addEventListener('touchend', e => {
    if (!swiping) return;
    swiping = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty, dt = Date.now() - tt;
    if (dt > 700) return;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      /* non-passive so the browser suppresses the click this swipe would
         otherwise fire on whatever sits under the finger */
      if (e.cancelable) e.preventDefault();
      dx < 0 ? next() : prev();
      dismissHint();
    }
  }, { passive: false });

  /* wheel navigation with throttle — never fights an inner scroller */
  let wheelLock = 0;
  const WHEEL_SKIP = '.scontent,.sensorlist,.sim,.mx,.mx__scroll,.overlay__panel,.chartwrap';
  deckEl.addEventListener('wheel', e => {
    if (e.target.closest(WHEEL_SKIP)) return;
    if (e.ctrlKey) return;                       // pinch-zoom
    const now = Date.now();
    if (now - wheelLock < 900) return;
    if (Math.abs(e.deltaY) < 26) return;
    wheelLock = now;
    e.deltaY > 0 ? next() : prev();
    dismissHint();
  }, { passive: true });

  /* ── overlays, with focus management ────────────────────────────── */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function focusablesIn(root) {
    return $$(FOCUSABLE, root).filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function openOverlay(id, trigger) {
    closeOverlays({ restoreFocus: false });
    lastFocused = trigger || document.activeElement;
    const panel = $(id);
    panel.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const f = focusablesIn(panel.querySelector('.overlay__panel'));
    (f[0] || panel).focus?.();
    panel.addEventListener('keydown', trapTab);
  }

  function trapTab(e) {
    if (e.key !== 'Tab') return;
    const panel = e.currentTarget.querySelector('.overlay__panel');
    const f = focusablesIn(panel);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function closeOverlays(opts = {}) {
    const restore = opts.restoreFocus !== false;
    let closed = false;
    $$('.overlay').forEach(o => {
      if (!o.hidden) { o.hidden = true; o.removeEventListener('keydown', trapTab); closed = true; }
    });
    $('#btnOverview').setAttribute('aria-expanded', 'false');
    $('#btnHelp').setAttribute('aria-expanded', 'false');
    if (closed && restore && lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  function openOverview() { openOverlay('#overview', $('#btnOverview')); }
  function openHelp() { openOverlay('#help', $('#btnHelp')); }

  $$('[data-close-overlay]').forEach(b => b.addEventListener('click', () => closeOverlays()));
  $$('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeOverlays(); }));
  $('#btnOverview').addEventListener('click', openOverview);
  $('#btnHelp').addEventListener('click', openHelp);

  /* ── first-run hint ─────────────────────────────────────────────── */
  const HINT_KEY = 'evs0.deck.hintSeen';
  let hintTimer = null;

  function seenHint() {
    try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return false; }
  }
  function rememberHint() {
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
  }
  function dismissHint() {
    if (!hintEl || hintEl.hidden) return;
    clearTimeout(hintTimer);
    hintEl.classList.add('is-out');
    hintTimer = setTimeout(() => { hintEl.hidden = true; }, 500);
    rememberHint();
  }
  function maybeShowHint() {
    if (!hintEl || seenHint()) return;
    hintEl.hidden = false;
    hintTimer = setTimeout(dismissHint, coarsePointer.matches ? 6000 : 8000);
  }

  /* ── guided walkthrough ─────────────────────────────────────────── */
  function showGuide(i) {
    const key = slides[i].meta.id;
    const text = DECK.guide[key];
    if (!text) { guideEl.hidden = true; return; }
    guideEl.hidden = false;
    guideTagEl.textContent = `Insight ${pad2(i + 1)} / ${slides.length}`;
    guideTextEl.textContent = text;
    if (!reduceMotion.matches) {
      guideEl.style.animation = 'none';
      void guideEl.offsetWidth;
      guideEl.style.animation = '';
    }
  }
  function scheduleGuide() {
    clearTimeout(guideTimer);
    guideTimer = setTimeout(() => { if (guideOn) go(current + 1); }, 11000);
  }
  function toggleGuide() {
    guideOn = !guideOn;
    if (guideOn) { showGuide(current); scheduleGuide(); }
    else { guideEl.hidden = true; clearTimeout(guideTimer); }
    srStatus.textContent = guideOn
      ? 'Guided walkthrough on — advancing every 11 seconds.'
      : 'Guided walkthrough off.';
  }

  /* ── ambient sound (filtered noise only; no external assets) ─────── */
  $('#btnSound').addEventListener('click', toggleSound);
  function toggleSound() {
    soundOn = !soundOn;
    $('#btnSound').setAttribute('aria-pressed', String(soundOn));
    $('#btnSound').querySelectorAll('.wave').forEach(w => w.style.opacity = soundOn ? '1' : '0');
    if (soundOn) startAudio(); else stopAudio();
  }
  function startAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      const len = audioCtx.sampleRate * 4;
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.6;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 620; lp.Q.value = 0.6;
      const hp = audioCtx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 90;
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.045;
      lfo.connect(lfoGain).connect(gain.gain);
      src.connect(hp).connect(lp).connect(gain).connect(audioCtx.destination);
      src.start(); lfo.start();
      audioCtx._gain = gain;
    }
    audioCtx.resume();
    audioCtx._gain.gain.cancelScheduledValues(audioCtx.currentTime);
    audioCtx._gain.gain.linearRampToValueAtTime(0.14, audioCtx.currentTime + 1.6);
  }
  function stopAudio() {
    if (!audioCtx) return;
    audioCtx._gain.gain.cancelScheduledValues(audioCtx.currentTime);
    audioCtx._gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
  }

  /* ── fullscreen ─────────────────────────────────────────────────── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  /* ── pause background work when the tab is hidden ───────────────── */
  document.addEventListener('visibilitychange', () => {
    const L = slides[current] && slides[current].lifecycle;
    if (!L) return;
    if (document.hidden) {
      if (L.deactivate) L.deactivate();
      clearInterval(tickTimer); tickTimer = null;
      clearTimeout(guideTimer);
    } else {
      if (L.activate) L.activate();
      if (typeof L.tick === 'function') tickTimer = setInterval(L.tick, L.interval || 1600);
      if (guideOn) scheduleGuide();
    }
  });

  /* ── deep links ─────────────────────────────────────────────────── */
  window.addEventListener('hashchange', () => {
    const m = /^#slide-(\d+)$/.exec(location.hash);
    if (!m) return;
    const n = parseInt(m[1], 10) - 1;
    if (n >= 0 && n < slides.length && n !== current) go(n, { silentGuide: true });
  });

  /* honour a user flipping the motion preference mid-session */
  const onMotionChange = () => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion.matches);
    const L = slides[current] && slides[current].lifecycle;
    if (L && L.motionChanged) L.motionChanged();
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
  else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);
  onMotionChange();

  /* ── boot ───────────────────────────────────────────────────────── */
  const fromHash = /^#slide-(\d+)$/.exec(location.hash);
  go(fromHash ? parseInt(fromHash[1], 10) - 1 : 0);

  requestAnimationFrame(() => {
    setTimeout(() => {
      const boot = $('#boot');
      if (!boot) return;
      boot.classList.add('is-out');
      setTimeout(() => boot.remove(), 700);
      /* surface the hint once the deck is actually visible */
      maybeShowHint();
    }, 420);
  });

  /* expose a tiny surface for debugging and for the README's console notes */
  window.Deck = {
    go, next, prev,
    get index() { return current; },
    get slides() { return slides.map(s => s.meta); },
    resetModel: () => { if (window.Simulator) Simulator.reset(); }
  };
})();
