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

  let slides = [];
  let current = -1;
  let guideOn = false;
  let guideTimer = null;
  let tickTimer = null;
  let soundOn = false;
  let audioCtx = null;

  /* ── build ──────────────────────────────────────────────────────── */
  slides = Slides.build();
  slides.forEach(s => deckEl.appendChild(s.node));

  /* dots + overview grid */
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-label', `${String(i + 1).padStart(2, '0')} · ${s.meta.label}`);
    b.setAttribute('aria-label', `Go to slide ${i + 1}: ${s.meta.label}`);
    b.innerHTML = '<i></i>';
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b);

    const g = document.createElement('button');
    g.type = 'button';
    g.dataset.i = i;
    g.innerHTML = `<b>Slide ${String(i + 1).padStart(2, '0')}</b><strong>${s.meta.label}</strong><em>${s.meta.note}</em>`;
    g.addEventListener('click', () => { closeOverlays(); go(i); });
    gridEl.appendChild(g);
  });
  totNumEl.textContent = String(slides.length).padStart(2, '0');

  /* initialise each slide once (constructs charts etc.) */
  slides.forEach(s => { try { s.lifecycle = s.init(s.node) || {}; } catch (err) { console.warn('slide init failed', s.meta.id, err); } });

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
      if (k === i) { if (L.activate) L.activate(); }
      else { if (L.deactivate) L.deactivate(); }
    });

    /* sensor simulation interval (slide 5) */
    clearInterval(tickTimer); tickTimer = null;
    const live = slides[i].lifecycle;
    if (live && typeof live.tick === 'function') {
      tickTimer = setInterval(live.tick, live.interval || 1600);
    }

    /* chrome */
    progressEl.style.width = ((i + 1) / slides.length * 100) + '%';
    curNumEl.textContent = String(i + 1).padStart(2, '0');
    slideLabelEl.textContent = slides[i].meta.label;
    $$('#dots button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    $$('#overviewGrid button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    document.title = `${String(i + 1).padStart(2, '0')} · ${slides[i].meta.label} — Digital Assessment of Carrying Capacity`;

    srStatus.textContent = `Slide ${i + 1} of ${slides.length}: ${slides[i].meta.label}`;
    Charts.hideTip();

    if (guideOn && !opts.silentGuide) {
      showGuide(i);
      scheduleGuide();
    }

    /* keep URL shareable without reloading */
    try { history.replaceState(null, '', `#slide-${i + 1}`); } catch (e) {}
  }
  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  $('#btnNext').addEventListener('click', next);
  $('#btnPrev').addEventListener('click', prev);

  /* ── keyboard ───────────────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
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
      case '?': case '/': openHelp(); break;
      case 'g': case 'G': toggleGuide(); break;
      case 's': case 'S': toggleSound(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      default:
        if (/^[0-9]$/.test(e.key)) {
          const n = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
          if (n < slides.length) go(n);
        }
    }
  });

  /* ── swipe ──────────────────────────────────────────────────────── */
  let tx = 0, ty = 0, tt = 0, swiping = false;
  deckEl.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    if (e.target.closest('input[type=range], .heat__grid, .stress, .alertlog')) { swiping = false; return; }
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now(); swiping = true;
  }, { passive: true });
  deckEl.addEventListener('touchend', e => {
    if (!swiping) return;
    swiping = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty, dt = Date.now() - tt;
    if (dt > 700) return;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* wheel navigation with throttle */
  let wheelLock = 0;
  deckEl.addEventListener('wheel', e => {
    if (e.target.closest('.scontent, .sensorlist, .overlay__panel')) return;
    const now = Date.now();
    if (now - wheelLock < 900) return;
    if (Math.abs(e.deltaY) < 26) return;
    wheelLock = now;
    e.deltaY > 0 ? next() : prev();
  }, { passive: true });

  /* ── overlays ───────────────────────────────────────────────────── */
  function openOverview() { closeOverlays(); $('#overview').hidden = false; }
  function openHelp() { closeOverlays(); $('#help').hidden = false; }
  function closeOverlays() { $('#overview').hidden = true; $('#help').hidden = true; }
  $$('[data-close-overlay]').forEach(b => b.addEventListener('click', closeOverlays));
  $$('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeOverlays(); }));
  $('#btnOverview').addEventListener('click', openOverview);
  $('#btnHelp').addEventListener('click', openHelp);

  /* ── guided walkthrough ─────────────────────────────────────────── */
  function showGuide(i) {
    const key = slides[i].meta.id;
    const text = DECK.guide[key];
    if (!text) { guideEl.hidden = true; return; }
    guideEl.hidden = false;
    guideTagEl.textContent = `Insight ${String(i + 1).padStart(2, '0')} / ${slides.length}`;
    guideTextEl.textContent = text;
    guideEl.style.animation = 'none';
    void guideEl.offsetWidth;
    guideEl.style.animation = '';
  }
  function scheduleGuide() {
    clearTimeout(guideTimer);
    guideTimer = setTimeout(() => { if (guideOn) go(current + 1, { silentGuide: false }); }, 11000);
  }
  function toggleGuide() {
    guideOn = !guideOn;
    if (guideOn) { showGuide(current); scheduleGuide(); }
    else { guideEl.hidden = true; clearTimeout(guideTimer); }
    srStatus.textContent = guideOn ? 'Guided walkthrough on — advancing every 11 seconds.' : 'Guided walkthrough off.';
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

  /* ── pause background work when tab is hidden ───────────────────── */
  document.addEventListener('visibilitychange', () => {
    const L = slides[current]?.lifecycle;
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

  /* ── boot ───────────────────────────────────────────────────────── */
  const fromHash = /#slide-(\d+)/.exec(location.hash);
  go(fromHash ? parseInt(fromHash[1], 10) - 1 : 0);

  requestAnimationFrame(() => {
    setTimeout(() => {
      const boot = $('#boot');
      boot.classList.add('is-out');
      setTimeout(() => boot.remove(), 700);
    }, 420);
  });
})();
