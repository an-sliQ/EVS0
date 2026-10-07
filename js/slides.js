/* ══════════════════════════════════════════════════════════════════════
   slides.js — Builds the ten slides of the deck.
   Layout rule: maximum six bullets, maximum six words per bullet.
   Visual rule: the graphic panel owns the larger half of every slide.
   ══════════════════════════════════════════════════════════════════════ */

const Slides = (() => {

  /* ── helpers ────────────────────────────────────────────────────── */
  const h = (s) => s; // tagged-template passthrough for readability
  const bullets = (items, tone = '') =>
    `<ul class="bullets ${tone ? 'bullets--' + tone : ''}">${
      items.map((t, i) => `<li style="--i:${i}">${t}</li>`).join('')
    }</ul>`;

  const stat = (rows) =>
    `<div class="stats">${rows.map(([v, l, u]) =>
      `<div class="stat"><div class="stat__v">${v}${u ? `<small>${u}</small>` : ''}</div><div class="stat__l">${l}</div></div>`
    ).join('')}</div>`;

  const head = ({ num, kicker, title, tag }) => `
    <header class="shead">
      <div class="shead__num">${num}</div>
      <div class="shead__meta">
        <p class="kicker">${kicker}</p>
        <h2>${title}</h2>
      </div>
      ${tag ? `<div class="shead__tag">${tag}</div>` : ''}
    </header>`;

  const cite = (t) => `<p class="datacite"><b>Sources &middot;</b> ${t}</p>`;

  /* ── inline icon set ────────────────────────────────────────────── */
  const icons = {
    toilet:'<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6"/><path d="M4 21h16"/><path d="M12 3v4"/>',
    plastic:'<circle cx="12" cy="12" r="8.5"/><path d="M6.5 17.5L17.5 6.5"/><path d="M9 4.5h6"/>',
    tree:'<path d="M12 21v-5"/><path d="M12 16c-3.6 0-6-2.2-6-5 1.9 0 3.1.7 4 1.6C10 9.9 11 7.4 12 4c1 3.4 2 5.9 2 8.6.9-.9 2.1-1.6 4-1.6 0 2.8-2.4 5-6 5z"/>',
    energy:'<path d="M4 20h16"/><path d="M9 20V9l6 4v-4l5 4v7"/><path d="M13 4l-3 5h3l-2 4"/>',
    plate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M4 12h2M18 12h2"/>',
    solar:'<path d="M4 15h16l-2-6H6z"/><path d="M12 9V4M8 5.5 9.5 7M16 5.5 14.5 7"/><path d="M9 19h6"/>'
  };
  const icon = (k, color) => `<span class="solcard__ic" style="color:${color}"><svg viewBox="0 0 24 24" stroke="${color}" aria-hidden="true">${icons[k]}</svg></span>`;

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 1 · Title & Introduction
     ══════════════════════════════════════════════════════════════════ */
  function slide1() {
    const node = document.createElement('section');
    node.className = 'slide';
    node.id = 's1';
    node.innerHTML = `
      <div class="titlehero">
        <div class="titlehero__media">
          <img src="assets/hero-sangam-aerial.jpg" alt="High-altitude aerial view of a vast tent city spread across a river floodplain at dawn, with two rivers converging at the centre" />
        </div>
        <div class="titlehero__scrim"></div>
        <div class="titlehero__in">
          <h1>Digital Assessment of <em>Carrying Capacity</em></h1>
          <p class="titlehero__sub">A case study of Maha Kumbh 2025 at Prayagraj &mdash; measuring how the world&rsquo;s largest human gathering pressed against the physical, ecological and social limits of the Triveni Sangam, and how digital systems made those limits visible.</p>
          <div class="titlehero__meta">
            <span class="chip chip--hot">45 days &middot; 13 Jan &ndash; 26 Feb 2025</span>
            <span class="chip">Prayagraj, Uttar Pradesh</span>
            <span class="chip">Triveni Sangam</span>
          </div>
        </div>
        <div class="titlehero__stats">
          <div class="tstat"><div class="tstat__v">4,000<small>ha</small></div><div class="tstat__l">Mela ground area</div></div>
          <div class="tstat"><div class="tstat__v">400<small>M+</small></div><div class="tstat__l">Visitors over 45 days</div></div>
          <div class="tstat"><div class="tstat__v">25</div><div class="tstat__l">Managed sectors</div></div>
          <div class="tstat"><div class="tstat__v">7</div><div class="tstat__l">Monitoring locations</div></div>
        </div>
      </div>
      <div class="sbody sbody--full" style="flex:0 0 auto;margin-top:clamp(10px,1.6vh,18px)">
        <div class="scontent" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          ${bullets([
            '<b>World&rsquo;s largest</b> human gathering event',
            '<b>400M+ visitors</b> across 45 days',
            'Confluence of <span class="fx">Ganga, Yamuna, Saraswati</span>',
            'Analyzing <b>environmental resilience</b> via technology',
            'Scaling infrastructure for <span class="fx">transient spikes</span>'
          ])}
          <div class="panel">
            <p class="panel__t"><span>How to read this deck</span></p>
            <p style="font-size:12.4px;color:var(--text-2);line-height:1.6">
              Each slide pairs a live visual with a six-line brief. Figures marked
              <span class="flag flag--live" style="display:inline-block">live</span> come from monitoring runs during the event;
              those marked <span class="flag flag--risk" style="display:inline-block">risk</span> are readings that breached a criterion.
              Hover, tap or drag the graphics &mdash; every chart responds.
            </p>
          </div>
        </div>
      </div>`;
    return { node, init: () => {} };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 2 · Carrying capacity frameworks
     ══════════════════════════════════════════════════════════════════ */
  function slide2() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's2';
    node.innerHTML = `
      ${head({ num:'02', kicker:'Conceptual framework', title:'Three Ways a System Reaches <em>Its Limit</em>', tag:'Interactive Venn' })}
      <div class="sbody">
        <div class="svisual">
          <div class="vennwrap" id="vennHost"></div>
          <div class="svisual__cap">
            <p>Hover or tap a set to isolate it. The red core is the point where all three limits coincide &mdash; the failure zone this study is built around.</p>
          </div>
        </div>
        <div class="scontent">
          <div class="panel vennread" id="vennRead">
            <p class="panel__t"><span>Set detail</span><span class="livechip">Interactive</span></p>
            <h4>Select a capacity set</h4>
            <p>Carrying capacity is not a single threshold. Three independent limits bind at once, and the binding constraint changes hour by hour.</p>
            <ul>
              <li>Physical &mdash; square metres available per pilgrim</li>
              <li>Ecological &mdash; organic load the rivers can absorb</li>
              <li>Social &mdash; density beyond which crowds turn dangerous</li>
            </ul>
          </div>
          ${bullets([
            '<b>Physical TCC:</b> total space per pilgrim',
            '<b>Ecological TCC:</b> river&rsquo;s purification threshold limits',
            '<b>Social TCC:</b> maximum density before panic',
            '<b>Infrastructure Gap:</b> <span class="fx">100x population surge</span>',
            'Managing <b>400M transient</b> population spikes'
          ])}
          ${cite('CPCB &amp; NGT monitoring record 2025; IPE Global capacity assessment; Prayagraj Mela Authority zoning.')}
        </div>
      </div>`;
    const init = () => {
      const host = node.querySelector('#vennHost');
      const read = node.querySelector('#vennRead');
      const copy = {
        phy:{ t:'Physical carrying capacity', p:'Defined by ground area divided by people. The Mela ground covered roughly 4,000 hectares across 25 sectors — generous in aggregate, but brutally localised on bathing days when the crowd funnels into a handful of ghats at the Sangam.', li:['Ground area: about 4,000 ha','Sectors managed: 25','Constraint: ghat and pontoon-bridge width'] },
        eco:{ t:'Ecological carrying capacity', p:'Set by how much organic load the Ganga and Yamuna can assimilate before oxygen demand outruns reaeration. This limit is invisible to a crowd but shows up in dissolved oxygen and coliform readings within hours of a mass bathing event.', li:['Indicator: BOD and dissolved oxygen','Stress signal: faecal coliform spikes','Constraint: assimilative capacity of both rivers'] },
        soc:{ t:'Socio-psychological carrying capacity', p:'The density at which a well-behaved crowd stops behaving like individuals. It is the least measurable and the most dangerous: exceed it and normal crowd self-regulation collapses, which is what makes real-time density sensing a safety system rather than an efficiency one.', li:['Trigger: density above control threshold','Risk: loss of crowd self-regulation','Measure: AI camera density bands'] }
      };
      Charts.venn(host, {});
      host.addEventListener('set', e => {
        const d = copy[e.detail.id];
        read.innerHTML = d
          ? `<p class="panel__t"><span>Set detail</span><span class="livechip">Inspecting</span></p><h4>${d.t}</h4><p>${d.p}</p><ul>${d.li.map(x=>`<li>${x}</li>`).join('')}</ul>`
          : `<p class="panel__t"><span>Set detail</span><span class="livechip">Interactive</span></p><h4>Select a capacity set</h4><p>Carrying capacity is not a single threshold. Three independent limits bind at once, and the binding constraint changes hour by hour.</p><ul><li>Physical &mdash; square metres available per pilgrim</li><li>Ecological &mdash; organic load the rivers can absorb</li><li>Social &mdash; density beyond which crowds turn dangerous</li></ul>`;
      });
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 3 · Hydrological stress
     ══════════════════════════════════════════════════════════════════ */
  function slide3() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's3';
    node.innerHTML = `
      ${head({ num:'03', kicker:'Environmental challenge I', title:'Hydrological Stress at the <em>Sangam</em>', tag:'Live readings Jan–Feb 2025' })}
      <div class="sbody">
        <div class="svisual">
          <div class="panel" style="flex:1;display:flex;flex-direction:column;min-height:0;border:0;background:transparent">
            <div class="panel__t">
              <span>River chemistry &mdash; click any point</span>
              <span class="livechip">Monitoring run</span>
            </div>
            <div class="chartwrap" id="waterChart"></div>
            <div class="legend" style="margin-top:10px">
              <span><i style="background:#FF4D62"></i>BOD mg/L</span>
              <span><i style="background:#2FD6C3"></i>Dissolved oxygen mg/L</span>
              <span><i style="background:#FFC24B"></i>Faecal coliform (log scale)</span>
            </div>
          </div>
          <div class="svisual__cap" style="padding-top:4px">
            <p id="waterRead">Point readings at the Sangam nose crossed the oxygen-demand limit repeatedly, while dissolved oxygen fell on the heaviest bathing days.</p>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            '<b>BOD spike:</b> <span class="fx">5.29 mg/L</span>, safe &lt;3',
            '<b>DO drop:</b> <span class="fx">2.2 mg/L</span> locally',
            '<b>Fecal coliform:</b> <span class="fx">4x above</span> bathing limits',
            '<b>16M litres</b> daily faecal sludge',
            '<b>240M litres</b> daily greywater generation'
          ], 'crimson')}
          <div class="flagrow">
            <span class="flag flag--risk">Peak breaching days</span>
            <span class="flag flag--live">20 monitoring rounds</span>
            <span class="flag flag--note">Median vs peak gap</span>
          </div>
          ${cite('CPCB and UPPCB readings placed before the National Green Tribunal, Jan&ndash;Feb 2025; NGT sewage-load projection; IPE Global demand assessment.')}
        </div>
      </div>`;
    const init = () => {
      const host = node.querySelector('#waterChart');
      const read = node.querySelector('#waterRead');
      const S = DECK.waterSeries;
      const fcLog = S.fc.map(v => Math.log10(Math.max(v, 100)));
      const cfg = {
        labels: S.labels,
        aria: 'Biochemical oxygen demand, dissolved oxygen and faecal coliform at the Sangam',
        y1: { min: 0, max: 11, d: 0, tickFmt: v => v.toFixed(0) },
        y2: { min: 2, max: 5.5, d: 1, color: '#FFC24B' },
        series: [
          { key:'bod', name:'BOD', unit:'mg/L', color:'#FF4D62', values:S.bod, axis:'y1', area:true, d:2, events:S.events },
          { key:'do',  name:'Dissolved oxygen', unit:'mg/L', color:'#2FD6C3', values:S.do2, axis:'y1', d:2, events:S.events },
          { key:'fc',  name:'Faecal coliform', unit:'MPN/100 mL', color:'#FFC24B', values:fcLog, axis:'y2', dashed:true, d:2, events:S.events }
        ],
        thresholds: [
          { axis:'y1', value:3, label:'BOD bathing limit · 3 mg/L', color:'#FF4D62' },
          { axis:'y1', value:5, label:'DO minimum · 5 mg/L', color:'#2FD6C3' }
        ]
      };
      const chart = Charts.lineChart(host, cfg);
      host.addEventListener('point', e => {
        const d = e.detail;
        const realFc = S.fc[d.index];
        const ev = d.event;
        read.innerHTML = ev
          ? `<b style="color:var(--amber)">${ev.tag}</b> &mdash; ${ev.note} BOD ${S.bod[d.index].toFixed(2)} mg/L, DO ${S.do2[d.index].toFixed(1)} mg/L, faecal coliform ${realFc.toLocaleString()} MPN/100 mL.`
          : `Recorded BOD ${S.bod[d.index].toFixed(2)} mg/L, dissolved oxygen ${S.do2[d.index].toFixed(1)} mg/L, faecal coliform ${realFc.toLocaleString()} MPN/100 mL on ${S.labels[d.index]}.`;
      });
      return chart;
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 4 · Waste & land degradation
     ══════════════════════════════════════════════════════════════════ */
  function slide4() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's4';
    node.innerHTML = `
      ${head({ num:'04', kicker:'Environmental challenge II', title:'Waste Load and <em>Land Degradation</em>', tag:'Sector heatmap' })}
      <div class="sbody">
        <div class="svisual">
          <div class="heat" style="padding:clamp(12px,1.4vw,20px)">
            <div class="panel__t"><span>Solid-waste accumulation by sector</span><span class="livechip">25 sectors</span></div>
            <div class="heat__grid" id="heatGrid"></div>
            <div class="heat__scale">
              <span>Low</span><div class="heat__ramp"></div><span>Critical</span>
            </div>
            <p id="heatRead" style="font-size:12.2px;color:var(--text-2);line-height:1.55;min-height:2.6em">
              Load concentrates along the ghats and around the confluence, where pilgrim footfall and food stalls overlap. Select a cell for sector context.
            </p>
          </div>
        </div>
        <div class="scontent">
          ${stat([['650','Garbage MT / day','MT'],['400','Plastic to fuel','MT'],['1.5','Toilets deployed','L'],['10','Sanitation teams','k']])}
          ${bullets([
            '<b>650 MT garbage</b> processed daily capacity',
            '<b>400 MT plastic</b> converted to fuel',
            '<b>1.5 Lakh toilets</b> deployed across sectors',
            'Massive <span class="fx">soil compaction</span> from tent cities',
            'Ecosystem shift along <span class="fx">4,000-hectare</span> banks'
          ], 'lime')}
          ${cite('Prayagraj Mela Authority sanitation briefing via PIB; plant capacity at the Baswar processing yard; worker deployment figures from Mela records.')}
        </div>
      </div>`;
    const init = () => {
      const grid = node.querySelector('#heatGrid');
      const read = node.querySelector('#heatRead');
      const names = Array.from({length:25},(_,i)=>`Sector ${String(i+1).padStart(2,'0')}`);
      Charts.heatmap(grid, DECK.heatmap, {
        cellName: c => {
          const zone = c.col === 0 ? 'Ghat corridor' : c.row >= 3 ? 'Confluence belt' : c.col >= 3 ? 'Transit & parking' : 'Camp interior';
          return `${names[c.i]} · ${zone}`;
        },
        cellLabel: c => ((c.v * 100) | 0),
        loadLabel: c => `Load index ${(c.v*100).toFixed(0)} of 100 · ${c.v > .8 ? 'critical' : c.v > .6 ? 'heavy' : c.v > .4 ? 'moderate' : 'light'} accumulation`
      });
      grid.addEventListener('cell', e => {
        const { cell, on } = e.detail;
        if (!on) return;
        const zone = cell.col === 0 ? 'along the ghat corridor, where bathing footfall is densest' :
                     cell.row >= 3 ? 'in the confluence belt, where the crowd funnels toward the Sangam nose' :
                     cell.col >= 3 ? 'near transit and parking nodes, where vehicles and vendors concentrate' :
                     'inside the camp interior, where tent density drives packaging and food waste';
        read.innerHTML = `<b style="color:#fff">${names[cell.i]}</b> sits ${zone}. Modelled accumulation index <span style="color:var(--amber)">${(cell.v*100).toFixed(0)}/100</span> against a daily processing capacity of 650 MT at the Baswar plant.`;
      });
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 5 · Digital monitoring
     ══════════════════════════════════════════════════════════════════ */
  function slide5() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's5';
    node.innerHTML = `
      ${head({ num:'05', kicker:'Digital instrument I', title:'Real-Time <em>Ecological Monitoring</em>', tag:'Live simulation' })}
      <div class="sbody">
        <div class="svisual svisual--photo">
          <div class="svisual__media">
            <img src="assets/river-monitoring-dawn.jpg" alt="A solar-powered sensor buoy on a calm river at dawn while a tethering drone hovers above the water" />
          </div>
          <div class="svisual__scrim"></div>
          <div style="position:relative;z-index:3;flex:1;display:flex;flex-direction:column;min-height:0;padding:clamp(12px,1.4vw,20px)">
            <div class="sensors" id="sensorPanel">
              <div class="panel" style="display:flex;flex-direction:column;gap:9px;min-height:0;background:rgba(4,7,15,.72)">
                <div class="panel__t"><span>Telemetry feed</span><span class="livechip">Streaming</span></div>
                <div class="sensorlist" id="sensorList"></div>
              </div>
              <div class="panel" style="display:flex;flex-direction:column;gap:8px;background:rgba(4,7,15,.72)">
                <div class="panel__t"><span>Trend buffer</span></div>
                <div class="chartwrap" id="sparkChart" style="min-height:120px"></div>
                <p class="datacite" style="border:0;padding:0" id="sensorNote">Select a parameter to plot its recent buffer.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            '<b>Automated IoT Sensors</b> track river health',
            '<b>Real-time BOD/DO alerts</b> for authorities',
            '<b>GIS Mapping</b> for land-use changes',
            'Satellite monitoring of <span class="fx">Algal Blooms</span>',
            'Digital tracking of <span class="fx">10,000+ cleaners</span>'
          ], 'teal')}
          <div class="panel">
            <p class="panel__t"><span>Why continuous beats spot checks</span></p>
            <p style="font-size:12.2px;color:var(--text-2);line-height:1.58">
              Twenty monitoring rounds produced a reassuring median and a set of alarming peaks in the same stretch of river.
              Continuous telemetry removes that ambiguity: it shows when a threshold is crossed and how fast the river recovers,
              which is what a diversion or intake decision actually depends on.
            </p>
          </div>
          ${cite('CPCB sequential monitoring programme; ICCC telemetry architecture; Mela Authority GIS zoning and worker tracking records.')}
        </div>
      </div>`;
    const init = () => {
      const list = node.querySelector('#sensorList');
      const note = node.querySelector('#sensorNote');
      const spark = node.querySelector('#sparkChart');
      const M = DECK.sensorModel;
      const buffers = {};
      /* seed each buffer with a plausible random walk so the trend is not flat on arrival */
      M.forEach(m => {
        let v = m.base * (0.72 + Math.random() * 0.2);
        buffers[m.key] = Array.from({ length: 24 }, () => {
          v += (Math.random() - 0.42) * m.swing * 0.09;
          v = Math.max(m.min, Math.min(m.max, v));
          return v;
        });
      });
      let selected = 'bod';
      let t = 0;

      const range = m => m.dir === 'high'
        ? { min:m.min, max:m.max, good:v => v >= m.warnAt, warn:v => v >= m.badAt && v < m.warnAt, bad:v => v < m.badAt }
        : { min:m.min, max:m.max, good:v => v <= m.warnAt, warn:v => v > m.warnAt && v <= m.badAt, bad:v => v > m.badAt };

      const render = () => {
        list.innerHTML = M.map(m => {
          const v = buffers[m.key][buffers[m.key].length - 1];
          const r = range(m);
          const cls = r.bad(v) ? 'bad' : r.warn(v) ? 'warn' : 'ok';
          const st = cls === 'bad' ? 'breach' : cls === 'warn' ? 'elevated' : 'normal';
          const pct = Math.max(4, Math.min(100, ((v - m.min) / (m.max - m.min)) * 100));
          return `<button class="sensor sensor--${cls}" data-k="${m.key}" aria-pressed="${m.key === selected}">
            <span class="sensor__n">${m.name}</span>
            <span class="sensor__st">${st}</span>
            <span class="sensor__v" style="grid-column:1">${Charts.fmt(v, v > 100 ? 0 : 2)}<small>${m.unit}</small></span>
            <span class="sensor__bar"><i style="width:${pct}%"></i></span>
          </button>`;
        }).join('');
      };

      const sparkline = () => {
        const m = M.find(x => x.key === selected);
        const buf = buffers[selected];
        spark.innerHTML = '';
        Charts.lineChart(spark, {
          labels: buf.map((_, i) => i % 6 === 0 ? `t-${23 - i}` : ''),
          aria: `${m.name} recent buffer`,
          y1: { min:m.min, max:m.max, d:0 },
          series: [{ key:m.key, name:m.name, unit:m.unit, color: m.key === 'ph' ? '#9B7BFF' : '#2FD6C3', values: buf, axis:'y1', area:true, d:2 }],
          thresholds: [{ axis:'y1', value:m.warnAt, label:`threshold · ${Charts.fmt(m.warnAt,0)}`, color:'#FFC24B' }]
        });
        note.textContent = `${m.name} — safe envelope ${m.safe}. Buffer holds the last 24 simulated readings.`;
      };

      list.addEventListener('click', e => {
        const b = e.target.closest('.sensor');
        if (!b) return;
        selected = b.dataset.k;
        list.querySelectorAll('.sensor').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.k === selected)));
        sparkline();
      });

      render(); sparkline();

      const tick = () => {
        t++;
        M.forEach(m => {
          const buf = buffers[m.key];
          const drift = Math.sin(t / 17 + m.base) * m.swing * 0.42 + (Math.random() - .45) * m.step * 6;
          let v = buf[buf.length - 1] + drift;
          // occasional stress excursion toward the breach zone
          if (t % 23 === 0) v = m.dir === 'high' ? m.badAt * 0.72 : m.badAt * 1.45;
          v = Math.max(m.min, Math.min(m.max, v));
          buf.push(v); if (buf.length > 24) buf.shift();
        });
        render();
        if (t % 2 === 0) sparkline();
      };
      return { tick, interval: 1500 };
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 6 · Crowd analytics
     ══════════════════════════════════════════════════════════════════ */
  function slide6() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's6';
    node.innerHTML = `
      ${head({ num:'06', kicker:'Digital instrument II', title:'Crowd Analytics and <em>Physical Mitigation</em>', tag:'AI vision simulation' })}
      <div class="sbody">
        <div class="svisual">
          <div class="crowd" style="padding:clamp(12px,1.4vw,20px)">
            <div class="panel__t" style="margin:0">
              <span>AI camera field &mdash; density classification</span>
              <span class="livechip" id="crowdState">Nominal</span>
            </div>
            <div class="crowd__stage" id="crowdStage">
              <svg class="crowd__glass" id="crowdSvg" viewBox="0 0 800 460" preserveAspectRatio="none" aria-label="Simulated AI crowd-density view over the Mela ground"></svg>
              <div class="alertlog" id="alertLog"></div>
            </div>
            <div class="crowd__ctl">
              <div class="slider">
                <label for="crowdRange">Pilgrim inflow</label>
                <input type="range" id="crowdRange" min="0" max="100" value="34" aria-label="Simulated pilgrim inflow" />
              </div>
              <span class="metricpill" id="crowdMetric">Density <b>—</b></span>
              <span class="metricpill">Cameras <b>1,800 AI</b></span>
              <span class="metricpill">Zones <b>G / A / R</b></span>
            </div>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            '<b>1,800+ AI Cameras</b> monitoring density',
            '<b>Real-time Alerts</b> when capacity breaches',
            'Predictive algorithms for <span class="fx">Stampede Prevention</span>',
            '<b>Drone Surveillance</b> for traffic diversions',
            '<b>Integrated Command (ICCC)</b> centralized control'
          ], 'cyan')}
          <div class="panel">
            <p class="panel__t"><span>Threshold protocol</span><span class="livechip" id="protoChip">Standby</span></p>
            <p style="font-size:12.2px;color:var(--text-2);line-height:1.58" id="protoText">
              Move the inflow slider. When a zone crosses its marked density threshold, an alert is pushed to the wireless grid and
              ground teams execute one of thirteen standing contingency schemes.
            </p>
          </div>
          ${cite('ICCC operational briefing, Maha Kumbh 2025: over 3,000 cameras of which 1,800 AI-enabled, thirteen contingency schemes, drone and underwater surveillance deployed across 25 sectors.')}
        </div>
      </div>`;
    const init = () => {
      const svg = node.querySelector('#crowdSvg');
      const stage = node.querySelector('#crowdStage');
      const range = node.querySelector('#crowdRange');
      const metric = node.querySelector('#crowdMetric');
      const state = node.querySelector('#crowdState');
      const log = node.querySelector('#alertLog');
      const protoText = node.querySelector('#protoText');
      const protoChip = node.querySelector('#protoChip');
      const NS = 'http://www.w3.org/2000/svg';
      const mk = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

      /* scene: river band + ghats + pontoon bridge + sectors */
      const g = mk('g');
      const defs = mk('defs');
      const grad = mk('linearGradient', { id:'camgrad', x1:'0', y1:'0', x2:'0', y2:'1' });
      grad.appendChild(mk('stop', { offset:'0%', 'stop-color':'#45B7FF', 'stop-opacity':'.22' }));
      grad.appendChild(mk('stop', { offset:'100%', 'stop-color':'#45B7FF', 'stop-opacity':'0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      svg.appendChild(mk('path', { d:'M 0 120 C 180 90, 320 150, 470 128 C 610 108, 700 140, 800 118 L 800 0 L 0 0 Z', fill:'#071120', opacity:'.9' }));
      svg.appendChild(mk('path', { d:'M 0 128 C 180 98, 320 158, 470 136 C 610 116, 700 148, 800 126', fill:'none', stroke:'#1E3A5F', 'stroke-width':'1.4' }));
      g.appendChild(mk('rect', { x:0, y:126, width:800, height:110, fill:'url(#camgrad)' }));
      [[120,86],[300,120],[470,132],[640,124],[760,120]].forEach(([x,w],i)=>{
        g.appendChild(mk('rect', { x, y:126, width:w*0.5, height:9, fill:'#3C5A85', opacity:'.7', rx:2 }));
        g.appendChild(mk('rect', { x:x+8, y:196, width:w*0.42, height:8, fill:'#3C5A85', opacity:'.45', rx:2 }));
      });
      for (let i=0;i<7;i++){
        g.appendChild(mk('rect', { x:60+i*110, y:126, width:64, height:9, fill:'#8A9EC2', opacity:'.55', rx:2 }));
      }
      /* camera mast */
      const camG = mk('g');
      camG.appendChild(mk('path', { d:'M 400 210 L 400 252', stroke:'#7C8DB3', 'stroke-width':'2' }));
      camG.appendChild(mk('circle', { cx:400, cy:208, r:5, fill:'#45B7FF' }));
      camG.appendChild(mk('path', { d:'M 400 212 L 300 320 L 500 320 Z', fill:'url(#camgrad)' }));
      g.appendChild(camG);
      svg.appendChild(g);

      const dotLayer = mk('g'); svg.appendChild(dotLayer);
      const boxLayer = mk('g'); svg.appendChild(boxLayer);

      const zones = [
        { id:'A', x:64,  y:180, w:220, h:150, name:'Ghat corridor' },
        { id:'B', x:300, y:170, w:210, h:160, name:'Sangam approach' },
        { id:'C', x:524, y:186, w:216, h:146, name:'Transit sector' }
      ];
      const dots = [];
      const TOTAL = 320;

      function build() {
        dotLayer.innerHTML = ''; dots.length = 0;
        for (let i = 0; i < TOTAL; i++) {
          const z = zones[i % zones.length];
          const c = mk('circle', { r: 1.9, fill:'#CFE2FF', opacity:'.75' });
          dotLayer.appendChild(c);
          dots.push({ c, z, x:z.x + Math.random()*z.w, y:z.y + Math.random()*z.h, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3 });
        }
      }
      build();

      /* bounding boxes are built once and then updated in place (keeps 60fps) */
      const boxes = zones.map((z, i) => {
        const b = mk('rect', { rx:8, class:'bbox bbox--green' });
        const label = mk('text', { 'font-family':'ui-monospace, monospace', 'font-size':'11', 'letter-spacing':'.08em' });
        boxLayer.appendChild(b); boxLayer.appendChild(label);
        return { z, i, b, label, load:-1, cls:'' };
      });

      function updateBoxes(intensity) {
        boxes.forEach((bx, i) => {
          const load = Math.min(1, intensity * (1 - i*0.12) * 1.35 + (i*0.07));
          const cls = load > .82 ? 'red' : load > .58 ? 'amber' : 'green';
          if (Math.abs(load - bx.load) > 0.004) {
            const pad = 10 - load*6;
            bx.b.setAttribute('x', bx.z.x - pad);
            bx.b.setAttribute('y', bx.z.y - pad);
            bx.b.setAttribute('width', bx.z.w + pad*2);
            bx.b.setAttribute('height', bx.z.h + pad*2);
            bx.label.setAttribute('x', bx.z.x - pad + 4);
            bx.label.setAttribute('y', bx.z.y - pad - 5);
            bx.label.textContent = `${bx.z.name.toUpperCase()} · ${(load*100).toFixed(0)}%`;
            bx.load = load;
          }
          if (cls !== bx.cls) {
            bx.b.setAttribute('class', `bbox bbox--${cls}`);
            bx.label.setAttribute('fill', cls==='red' ? '#FF4D62' : cls==='amber' ? '#FFC24B' : '#9BDF5A');
            bx.cls = cls;
          }
        });
        return boxes;
      }

      let intensity = .34, t = 0, lastLog = 0, raf = null, lastFill = '', lastPeak = -1;
      range.addEventListener('input', () => { intensity = range.value / 100; });

      function frame() {
        t++;
        const target = intensity;
        const fill = target > .8 ? '#FFB0BA' : target > .6 ? '#FFDFA8' : '#CFE2FF';
        dots.forEach(d => {
          const speed = .25 + target * 1.9;
          d.vx += (Math.random() - .5) * .06 * speed;
          d.vy += (Math.random() - .5) * .06 * speed;
          d.x += d.vx * speed; d.y += d.vy * speed;
          if (d.x < d.z.x) { d.x = d.z.x; d.vx *= -1; }
          if (d.x > d.z.x + d.z.w) { d.x = d.z.x + d.z.w; d.vx *= -1; }
          if (d.y < d.z.y) { d.y = d.z.y; d.vy *= -1; }
          if (d.y > d.z.y + d.z.h) { d.y = d.z.y + d.z.h; d.vy *= -1; }
          d.c.setAttribute('cx', d.x.toFixed(1));
          d.c.setAttribute('cy', d.y.toFixed(1));
          if (fill !== lastFill) d.c.setAttribute('fill', fill);
        });
        lastFill = fill;

        const bs = updateBoxes(target);
        const peak = bs.reduce((a,b)=>Math.max(a,b.load),0);
        const overall = peak > .82 ? 'critical' : peak > .58 ? 'elevated' : 'nominal';
        const stateTxt = overall === 'critical' ? 'Threshold breach' : overall === 'elevated' ? 'Watch zone' : 'Nominal';
        if (state.textContent !== stateTxt) state.textContent = stateTxt;

        const peakPct = Math.round(peak * 100);
        if (peakPct !== lastPeak) { metric.innerHTML = `Density <b>${peakPct}%</b>`; lastPeak = peakPct; }
        const want = overall === 'critical'
          ? 'Threshold breached. Alerts pushed to the wireless grid; ground teams begin a diversion under the standing contingency scheme, and pontoon-bridge entry is metered.'
          : overall === 'elevated'
          ? 'Density climbing toward the marked threshold. Observers hold the zone under watch and pre-position diversion teams on the approach routes.'
          : 'Density inside the safe band. Cameras classify the crowd continuously and no intervention is required.';
        if (protoText.textContent.trim() !== want) protoText.textContent = want;
        const chipTxt = overall === 'critical' ? 'Scheme active' : overall === 'elevated' ? 'Watch' : 'Standby';
        if (protoChip.textContent !== chipTxt) protoChip.textContent = chipTxt;

        if (t - lastLog > 74) {
          lastLog = t;
          pushLog(bs);
        }
        raf = requestAnimationFrame(frame);
      }

      function pushLog(bs) {
        bs.forEach((b, i) => {
          setTimeout(() => {
            const d = document.createElement('div');
            d.className = b.cls === 'red' ? '' : b.cls === 'amber' ? 'warn' : 'ok';
            const hh = String(14 + ((t/3600)|0)).padStart(2,'0');
            const mm = String((t/60|0) % 60).padStart(2,'0');
            d.textContent = `${hh}:${mm}  ${b.z.name} — density ${(b.load*100).toFixed(0)}%, ${b.cls === 'red' ? 'breach logged' : b.cls==='amber' ? 'elevated' : 'clear'}`;
            log.appendChild(d);
            while (log.children.length > 3) log.removeChild(log.firstChild);
          }, i * 340);
        });
      }

      return {
        activate() { if (raf === null) raf = requestAnimationFrame(frame); },
        deactivate() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }
      };
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 7 · Comparative stress
     ══════════════════════════════════════════════════════════════════ */
  function slide7() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's7';
    node.innerHTML = `
      ${head({ num:'07', kicker:'Comparative data visual', title:'City Baseline vs. <em>Mela Peak</em>', tag:'Stress meter' })}
      <div class="sbody sbody--flip">
        <div class="svisual">
          <div style="flex:1;display:flex;flex-direction:column;min-height:0;padding:clamp(12px,1.4vw,20px);gap:10px">
            <div class="panel__t" style="margin:0"><span>Load comparison &mdash; hover a row</span><span class="livechip">Ratio scaled</span></div>
            <div class="stress" id="stressRows"></div>
            <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;border-top:1px solid var(--line);padding-top:10px">
              <div id="stressRead" style="font-size:12.2px;color:var(--text-2);line-height:1.55">
                Ratios are computed against Prayagraj&rsquo;s ordinary operating baseline. Bar length is scaled within each row so the baseline and peak remain comparable.
              </div>
              <div class="gauge" id="stressGauge"></div>
            </div>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            '<b>Water demand:</b> 350 vs <span class="fx">450 MLD</span>',
            '<b>Population:</b> 5M vs <span class="fx">400M Peak</span>',
            '<b>Waste Spike:</b> <span class="fx">10x daily baseline</span> increase',
            '<b>Area Load:</b> <span class="fx">10,000+ persons</span> per hectare',
            '<b>Infrastructure Strain:</b> <span class="fx">Extreme Stress</span> (Red Zone)'
          ])}
          ${cite('City supply and sewage capacity from the state environment department submission to the NGT; peak-day demand and tubewell provision from the IPE Global assessment; waste capacity from Mela sanitation records.')}
        </div>
      </div>`;
    const init = () => {
      const rows = node.querySelector('#stressRows');
      const read = node.querySelector('#stressRead');
      const gaugeHost = node.querySelector('#stressGauge');
      const R = DECK.stressRows;

      const maxRatio = Math.max(...R.map(r => r.peak / r.base));
      const scaleOf = ratio => Math.max(7, (Math.log10(ratio) / Math.log10(maxRatio)) * 100);

      rows.innerHTML = R.map((r, i) => {
        const ratio = r.peak / r.base;
        const share = scaleOf(ratio);
        return `<div class="stressrow ${ratio > 8 ? 'is-red' : ''}" data-i="${i}" tabindex="0" role="button"
            aria-label="${r.label}: baseline ${r.baseTxt}, peak ${r.peakTxt}, ${ratio.toFixed(1)} times baseline">
          <div class="stressrow__l">${r.label}<i>${r.unit}</i></div>
          <div class="stressbar ${ratio > 8 ? 'is-over' : ''}" data-share="${share.toFixed(1)}" data-ratio="${ratio}">
            <i></i><u></u>
          </div>
          <div class="stressrow__v">${r.baseTxt} <small>→</small> <b>${r.peakTxt}</b> <small>${ratio.toFixed(ratio >= 10 ? 0 : 1)}&times;</small></div>
        </div>`;
      }).join('');

      /* animate: muted segment = share of load that is ordinary baseline, hot segment = surge */
      requestAnimationFrame(() => {
        rows.querySelectorAll('.stressbar').forEach((bar, i) => {
          const share = parseFloat(bar.dataset.share);
          const ratio = parseFloat(bar.dataset.ratio);
          const basePct = share / ratio;
          const surgePct = share - basePct;
          setTimeout(() => {
            bar.querySelector('i').style.width = basePct.toFixed(2) + '%';
            bar.querySelector('u').style.width = surgePct.toFixed(2) + '%';
          }, 90 + i * 110);
        });
      });

      const overall = Math.min(1, Math.log10(maxRatio) / 3.4);
      Charts.gauge(gaugeHost, {
        value: overall,
        label: 'STRESS INDEX',
        format: () => (overall * 100).toFixed(0),
        aria: 'Composite infrastructure stress index'
      });

      rows.addEventListener('mouseover', e => {
        const row = e.target.closest('.stressrow'); if (!row) return;
        describe(+row.dataset.i);
      });
      rows.addEventListener('focusin', e => {
        const row = e.target.closest('.stressrow'); if (!row) return;
        describe(+row.dataset.i);
      });
      rows.addEventListener('click', e => {
        const row = e.target.closest('.stressrow'); if (!row) return;
        describe(+row.dataset.i);
      });
      function describe(i) {
        const r = R[i], ratio = r.peak / r.base;
        read.innerHTML = `<b style="color:#fff">${r.label}:</b> ${r.note} The peak load runs <span style="color:var(--amber)">${ratio.toFixed(ratio >= 10 ? 0 : 1)}&times;</span> the baseline, which is the gap emergency provisioning has to cover.`;
      }
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 8 · Smart solutions
     ══════════════════════════════════════════════════════════════════ */
  function slide8() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's8';
    const cards = [
      { k:'toilet', c:'#2FD6C3', t:'IIT-model bio-toilets', s:'Zero discharge into the rivers',
        m:'Twin-pit bio-digester units break down waste anaerobically, so nothing untreated reaches the Ganga or Yamuna. Around 1.5 lakh toilets and urinals were deployed and monitored through QR-coded service records.' },
      { k:'plastic', c:'#FF8A1F', t:'Zero-plastic zones', s:'Single-use plastic banned on site',
        m:'The Mela ground was declared a plastic-free zone. Natural substitutes — leaf plates, clay cups, cloth and jute bags — replaced disposables, with enforcement sitting alongside awareness campaigns.' },
      { k:'tree', c:'#9BDF5A', t:'Miyawaki afforestation', s:'Dense native plantation for air quality',
        m:'The Miyawaki method plants mixed native species at high density to accelerate canopy formation. The cleared Baswar yard was replanted with roughly 27,000 saplings across 27 species, and the technique was extended to thirteen more sites in the city.' },
      { k:'energy', c:'#FFC24B', t:'Waste-to-energy', s:'Wet waste to bio-CNG and kiln fuel',
        m:'Segregated wet waste was routed to bio-CNG and manure production, while non-recyclable fractions went to cement plant co-processing — turning a disposal problem into an energy input.' },
      { k:'plate', c:'#45B7FF', t:'Reusable steel plates', s:'Community campaign replacing disposables',
        m:'A volunteer-led campaign distributed reusable steel plates and cloth bags, aiming to displace hundreds of tonnes of disposable waste across 400 million visits.' },
      { k:'solar', c:'#9B7BFF', t:'Solar and e-mobility', s:'Renewable power and shared electric transport',
        m:'Solar lighting and an online e-rickshaw booking system cut diesel generator use and reduced vehicle emissions across the Mela ground.' }
    ];
    node.innerHTML = `
      ${head({ num:'08', kicker:'Engineering response', title:'Smart Solutions and <em>Green Engineering</em>', tag:'Tap a card' })}
      <div class="sbody">
        <div class="svisual">
          <div class="solgrid" id="solGrid"></div>
        </div>
        <div class="scontent">
          ${bullets([
            '<b>IIT-model Bio-toilets</b> for zero discharge',
            '<b>Zero-Plastic Zones</b> enforced by AI',
            '<b>Miyawaki Afforestation</b> for air purification',
            '<b>Waste-to-Energy</b> partnerships with cement plants',
            '<b>1.5M Steel Plates</b> displacing disposables'
          ], 'lime')}
          <div class="panel">
            <p class="panel__t"><span>Design principle</span></p>
            <p style="font-size:12.2px;color:var(--text-2);line-height:1.58">
              Every intervention here attacks the load at source rather than treating it downstream: refuse the disposable,
              digest the waste on site, replant what was cleared, and recover energy from what remains.
            </p>
          </div>
          ${cite('PIB cleanliness briefings for Maha Kumbh 2025; Mela Authority sanitation records; city-level Miyawaki plantation reports.')}
        </div>
      </div>`;
    const init = () => {
      const grid = node.querySelector('#solGrid');
      grid.innerHTML = cards.map((c, i) => `
        <button class="solcard" aria-expanded="false" data-i="${i}">
          ${icon(c.k, c.c)}
          <h4>${c.t}</h4>
          <p>${c.s}</p>
          <span class="solcard__more">${c.m}</span>
        </button>`).join('');
      grid.addEventListener('click', e => {
        const b = e.target.closest('.solcard'); if (!b) return;
        const open = b.getAttribute('aria-expanded') === 'true';
        grid.querySelectorAll('.solcard').forEach(x => x.setAttribute('aria-expanded','false'));
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 9 · Policy recommendations
     ══════════════════════════════════════════════════════════════════ */
  function slide9() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's9';
    node.innerHTML = `
      ${head({ num:'09', kicker:'Strategic recommendations', title:'A <em>Digital Twin</em> Blueprint for the Sangam', tag:'Select a node' })}
      <div class="sbody sbody--flip">
        <div class="svisual">
          <div class="bp" id="bpHost">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Blueprint of a digital twin model over the Sangam basin">
              <defs>
                <linearGradient id="riverg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#45B7FF" stop-opacity=".35"/>
                  <stop offset="100%" stop-color="#2FD6C3" stop-opacity=".14"/>
                </linearGradient>
              </defs>
              <path d="M -2 62 C 18 54, 30 70, 46 66 C 62 62, 74 44, 102 38 L 102 52 C 80 58, 70 74, 50 80 C 32 85, 16 76, -2 82 Z" fill="url(#riverg)" stroke="#45B7FF" stroke-opacity=".5" stroke-width=".25"/>
              <path d="M -2 22 C 22 26, 34 12, 54 18 C 70 23, 78 10, 102 14" fill="none" stroke="#45B7FF" stroke-opacity=".22" stroke-width=".2" stroke-dasharray="1.2 .8"/>
              <g stroke="#45B7FF" stroke-opacity=".16" stroke-width=".16">
                <path d="M 0 88 H 100"/><path d="M 0 71 H 100"/><path d="M 0 45 H 100"/><path d="M 0 28 H 100"/>
                <path d="M 15 0 V 100"/><path d="M 30 0 V 100"/><path d="M 55 0 V 100"/><path d="M 84 0 V 100"/>
              </g>
              <g id="bpPins"></g>
            </svg>
            <div class="bp__cap" id="bpCap"><b>Select a lever</b>Each node is one strategic recommendation drawn from how the 2025 systems actually behaved.</div>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            'Deploy <b>Permanent Digital Twin</b> simulations',
            'Set <b>Dynamic Thresholds</b> for crowd inflow',
            'Mandate <b>Real-time Water Quality</b> dashboards',
            'Automated <b>Resource Re-allocation</b> via AI',
            'Incentivize <b>Circular Waste Economy</b> models'
          ], 'violet')}
          <div class="panel">
            <p class="panel__t"><span>From event to institution</span></p>
            <p style="font-size:12.2px;color:var(--text-2);line-height:1.58">
              The 2025 apparatus was assembled for forty-five days. The recommendations above are what it looks like
              when the same capability is maintained continuously &mdash; so the next gathering starts with a calibrated model
              instead of a blank page.
            </p>
          </div>
          ${cite('Synthesis of ICCC operational records, CPCB monitoring design and Mela Authority sanitation and GIS practice.')}
        </div>
      </div>`;
    const init = () => {
      const host = node.querySelector('#bpPins');
      const cap = node.querySelector('#bpCap');
      DECK.policyPins.forEach((p, i) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.setAttribute('class','bp__pin');
        g.setAttribute('data-i', i);
        g.setAttribute('tabindex','0');
        g.setAttribute('role','button');
        g.setAttribute('aria-label', p.label);
        g.innerHTML = `
          <circle class="bp__pulse" cx="${p.x}" cy="${p.y}" r="4" fill="${p.color}" fill-opacity=".35"/>
          <circle class="ring" cx="${p.x}" cy="${p.y}" r="5.6" stroke="${p.color}"/>
          <circle cx="${p.x}" cy="${p.y}" r="2.1" fill="${p.color}"/>
          <text x="${p.x + 4.4}" y="${p.y + 1.4}">${p.label}</text>`;
        host.appendChild(g);
      });
      const show = i => {
        const p = DECK.policyPins[i];
        host.querySelectorAll('.bp__pin').forEach(g => g.classList.toggle('on', +g.dataset.i === i));
        cap.innerHTML = `<b>${p.label}</b>${p.text}`;
      };
      host.addEventListener('click', e => {
        const g = e.target.closest('.bp__pin'); if (g) show(+g.dataset.i);
      });
      host.addEventListener('keydown', e => {
        const g = e.target.closest('.bp__pin'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+g.dataset.i); }
      });
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDE 10 · Conclusion & references
     ══════════════════════════════════════════════════════════════════ */
  function slide10() {
    const node = document.createElement('section');
    node.className = 'slide'; node.id = 's10';
    node.innerHTML = `
      ${head({ num:'12', kicker:'Conclusion', title:'Resilience Built on <em>Measurement</em>', tag:'References' })}
      <div class="sbody">
        <div class="svisual svisual--photo">
          <div class="svisual__media">
            <img src="assets/finale-sangam-sunset.jpg" alt="Sunset over a calm river confluence with boats and temple spires silhouetted on the far bank" />
          </div>
          <div class="svisual__scrim"></div>
          <div style="position:relative;z-index:3;flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-height:0;gap:14px;padding:clamp(16px,1.9vw,28px)">
            <div class="flagrow">
              <span class="flag flag--live">Future ready</span>
              <span class="flag flag--note">Data-first governance</span>
            </div>
            <h3 style="font-family:var(--fd);font-size:clamp(19px,2.5vw,34px);color:#fff;line-height:1.14;max-width:24ch">
              The rivers were not restored. The <em style="color:var(--amber);font-style:italic">failure points became measurable</em>.
            </h3>
            <p style="font-size:clamp(12px,1.14vw,14.5px);color:var(--text-2);max-width:56ch;line-height:1.6">
              Every instrument on the previous nine slides existed to answer one question in time to act on it:
              how close is this system to its limit, and which limit is binding right now?
            </p>
          </div>
        </div>
        <div class="scontent">
          ${bullets([
            'Technology builds <b>Predictive Ecological Resilience</b>',
            'Digital assessment prevents <b>Environmental Collapse</b>',
            'Mahakumbh: a <b>Smart City</b> blueprint',
            '<b>Resilience</b> through data-driven management'
          ], 'teal')}
          <div class="panel">
            <p class="panel__t"><span>Reference base &mdash; tap to expand</span></p>
            <div class="refs" id="refList">
              ${DECK.sources.map((s, i) => `
                <button class="ref" aria-expanded="false" data-i="${i}">
                  <div class="ref__src">${s.src}</div>
                  <div class="ref__t">${s.title}</div>
                  <div class="ref__d">${s.detail}</div>
                </button>`).join('')}
            </div>
          </div>
          <p class="datacite" style="border:0;padding:0">
            <b>Note on method &middot;</b> Figures are reproduced from publicly reported monitoring data and official statements.
            Sector heatmap values and the live sensor feed are modelled illustrations built to the published ranges, not raw telemetry.
          </p>
        </div>
      </div>`;
    const init = () => {
      const list = node.querySelector('#refList');
      list.addEventListener('click', e => {
        const b = e.target.closest('.ref'); if (!b) return;
        const open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    };
    return { node, init };
  }

  /* ══════════════════════════════════════════════════════════════════
     SLIDES 10–11 · Capacity simulator and decision matrix
     Built by js/simulator.js — one shared model, two views.
     ══════════════════════════════════════════════════════════════════ */
  const slide10b = () => Simulator.slideSimulator();
  const slide11b = () => Simulator.slideMatrix();

  /* ── assembly ───────────────────────────────────────────────────── */
  const builders = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide9,
                    slide10b, slide11b, slide10];

  function build() {
    return builders.map((fn, i) => {
      const { node, init } = fn();
      return { node, init: init || (() => {}), meta: DECK.index[i], num: i };
    });
  }

  return { build };
})();
