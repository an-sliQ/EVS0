/* ══════════════════════════════════════════════════════════════════════
   data.js — Content model for the Maha Kumbh 2025 carrying-capacity deck
   Figures are drawn from publicly reported monitoring data and official
   statements (see DECK.sources). Written in the deck's own words.
   ══════════════════════════════════════════════════════════════════════ */

const DECK = (() => {

  /* ── Slide index (used by dots, overview grid, guided mode) ───────── */
  const index = [
    { id:'title',    label:'Title',            short:'Scope & scale',          note:'Event scale, location, 45-day window' },
    { id:'framework',label:'Carrying Capacity',short:'Three TCC frameworks',   note:'Physical · Ecological · Social limits' },
    { id:'water',    label:'Hydrological Stress',short:'BOD, DO, coliform',    note:'River chemistry under mass bathing' },
    { id:'waste',    label:'Waste & Land',     short:'Solid waste & soil',     note:'Tonnes per day, land degradation' },
    { id:'sensors',  label:'Digital Monitoring',short:'IoT sensor network',    note:'Live water-quality telemetry' },
    { id:'crowd',    label:'Crowd Analytics',  short:'AI density control',     note:'1,800 AI cameras, threshold alerts' },
    { id:'stress',   label:'Comparative Stress',short:'City vs. Mela demand',  note:'Load ratios and stress index' },
    { id:'green',    label:'Green Engineering',short:'Smart solutions',        note:'Bio-toilets, Miyawaki, circular waste' },
    { id:'policy',   label:'Recommendations',  short:'Digital twin blueprint', note:'Five strategic policy levers' },
    { id:'conclusion',label:'Conclusion',      short:'Resilience & sources',   note:'Findings and reference base' }
  ];

  /* ── Verified figures with sources ────────────────────────────────── */
  const sources = [
    {
      src:'CPCB / NGT',
      title:'Central Pollution Control Board water-quality monitoring submitted to the National Green Tribunal',
      detail:'Twenty rounds of monitoring at ten mass-bathing locations between 12 January and 22 February 2025 measured pH, dissolved oxygen, biochemical oxygen demand and faecal coliform. Reported medians sat inside the bathing criterion, while individual bathing-day readings — including a BOD of 5.29 mg/L on 19 February — crossed it. The board flagged wide day-to-day variability in the same stretch.'
    },
    {
      src:'UPPCB / State',
      title:'Uttar Pradesh Pollution Control Board daily Sangam readings',
      detail:'Point readings at the Sangam nose recorded faecal coliform of 11,000 MPN/100 mL on Makar Sankranti (14 January) and 49,000 MPN/100 mL on 20 January, against a maximum permissible limit of 2,500 MPN/100 mL and a desired level of 500 MPN/100 mL.'
    },
    {
      src:'NGT record',
      title:'Sewage load projection placed before the National Green Tribunal',
      detail:'The state environment department projected a sewage flow of about 519 MLD during the event, of which roughly 450 MLD would be handled by existing treatment plants and 68 MLD treated on site. Prayagraj generates about 468 MLD against an installed treatment capacity near 340 MLD.'
    },
    {
      src:'ICCC',
      title:'Integrated Command and Control Centre operational record',
      detail:'Over 3,000 cameras were deployed across the Mela and city, of which 1,800 were AI-enabled, alongside ANPR cameras, smart parking systems, tethered and underwater drones, and thirteen contingency schemes defined in standing procedures.'
    },
    {
      src:'PIB / Mela Authority',
      title:'Press Information Bureau and Prayagraj Mela Authority sanitation briefings',
      detail:'Fairgrounds were declared plastic-free zones with a ban on single-use plastic. Roughly 1.5 lakh toilets and urinals, 25,000 dustbins and about 10,000 sanitation workers were deployed. The Baswar yard was cleared and replanted using the Miyawaki method with 27,000 saplings across 27 species.'
    },
    {
      src:'IPE / Water supply',
      title:'Urban infrastructure demand assessment for the Mela',
      detail:'Peak-day potable water demand was estimated above 450 MLD against a city supply capacity near 350 MLD, met partly by 85 new tubewells. Peak bathing days were projected to generate about 16 million litres of faecal sludge and 240 million litres of greywater daily.'
    }
  ];

  /* ── Water chemistry series (Sangam, Jan–Feb 2025) ────────────────── */
  const waterSeries = {
    labels:['12 Jan','13 Jan','14 Jan','15 Jan','20 Jan','24 Jan','29 Jan','16 Feb','19 Feb','22 Feb','28 Feb'],
    bod:[3.74, 3.94, 2.18, 1.00, 2.46, 4.08, 3.26, 5.09, 5.29, 4.60, 2.56],
    do2:[8.50, 9.20, 7.80, 8.50, 8.60, 7.90, 8.20, 7.40, 6.90, 7.65, 8.70],
    fc: [2000, 1800, 11000, 6800, 49000, 26000, 14000, 4200, 3800, 2900, 1400],
    events:{
      2:{ tag:'Makar Sankranti', note:'Peak bathing day — coliform jumps past the permissible ceiling.' },
      4:{ tag:'Mauni Amavasya window', note:'Highest recorded coliform reading of the period.' },
      8:{ tag:'Late-February dip', note:'BOD reading of 5.29 mg/L recorded at the Sangam.' }
    }
  };

  /* ── Heatmap sectors (5×5 zoning model over the Mela ground) ──────────
     Accumulation rises toward the ghat corridor (left edge) and peaks at the
     confluence belt (bottom rows), with a secondary cluster at the transit
     and parking nodes in the upper-right. Modelled, not measured telemetry. */
  const heatmap = Array.from({length:25},(_,i)=>{
    const r = Math.floor(i/5), c = i%5;
    const ghatProximity = Math.pow((4 - c) / 4, 1.15);   // 1 at the river edge
    const confluence    = Math.pow(r / 4, 1.05);          // 1 at the Sangam nose
    const transitNode   = (c === 3 && r <= 1) ? 0.18 : 0; // bus and parking cluster
    const v = Math.min(0.96, 0.18 + ghatProximity * 0.46 + confluence * 0.30 + transitNode);
    return { i, row:r, col:c, v:+v.toFixed(3) };
  });

  /* ── Stress comparison: baseline city vs Mela peak ────────────────── */
  const stressRows = [
    { key:'pop',  label:'Population',      unit:'persons',      base:5e6,   peak:4e8,  baseTxt:'5 M',   peakTxt:'400 M',  note:'Resident base of Prayagraj versus cumulative footfall across 45 days.' },
    { key:'area', label:'Density load',    unit:'persons / ha', base:120,   peak:10000,baseTxt:'~120',  peakTxt:'10,000+',note:'Typical urban density against peak pilgrim density on the Mela ground.' },
    { key:'water',label:'Water demand',    unit:'MLD',         base:350,   peak:450,  baseTxt:'350 MLD',peakTxt:'450 MLD',note:'City supply capacity versus peak-day potable water demand.' },
    { key:'sew',  label:'Sewage flow',     unit:'MLD',         base:340,   peak:519,  baseTxt:'340 MLD',peakTxt:'519 MLD',note:'Installed treatment capacity versus projected event sewage load.' },
    { key:'waste',label:'Waste generation',unit:'MT / day',    base:65,    peak:650,  baseTxt:'~65 MT',peakTxt:'650 MT', note:'Baseline municipal waste against daily processing at the Baswar plant.' }
  ];

  /* ── Live sensor simulation model ────────────────────────────────── */
  const sensorModel = [
    { key:'ph',   name:'pH',                unit:'',        min:6.5,  max:8.5,  warnAt:8.2,  badAt:8.5,  base:7.6,  swing:.5,  step:.02, dir:'band', safe:'6.5 – 8.5' },
    { key:'do',   name:'Dissolved oxygen',  unit:'mg/L',    min:0,    max:12,   warnAt:5,    badAt:3,    base:8.1,  swing:2.4, step:.1,  dir:'high', safe:'> 5 mg/L' },
    { key:'bod',  name:'Biochemical oxygen demand', unit:'mg/L', min:0, max:7, warnAt:3,   badAt:5,    base:2.9,  swing:2.6, step:.09, dir:'low',  safe:'≤ 3 mg/L' },
    { key:'fc',   name:'Faecal coliform',   unit:'MPN/100 mL', min:0, max:52000, warnAt:500, badAt:2500, base:2600, swing:46000, step:900, dir:'low', safe:'≤ 2,500 MPN' },
    { key:'turb', name:'Turbidity',         unit:'NTU',     min:0,    max:60,   warnAt:25,   badAt:40,   base:18,   swing:26,  step:1.1, dir:'low',  safe:'< 25 NTU' },
    { key:'no3',  name:'Nitrate',           unit:'mg/L',    min:0,    max:14,   warnAt:8,    badAt:11,   base:5.4,  swing:6.2, step:.3,  dir:'low',  safe:'< 10 mg/L' }
  ];

  /* ── Policy levers (slide 9 blueprint pins) ───────────────────────── */
  const policyPins = [
    { id:'twin',  x:24, y:34, label:'Digital twin core', color:'#45B7FF', text:'Maintain a permanent, continuously updated simulation of the Sangam basin so that crowd, water and sanitation scenarios can be stress-tested before an event rather than during it.' },
    { id:'thr',   x:46, y:56, label:'Dynamic thresholds', color:'#FF8A1F', text:'Replace fixed crowd caps with thresholds that shift with river level, water quality, temperature and time of day, wired directly into the diversion protocol.' },
    { id:'dash',  x:68, y:30, label:'Public water data',  color:'#2FD6C3', text:'Publish a real-time water-quality dashboard at every mass-bathing site so that pilgrim decisions and administrative action rest on the same numbers.' },
    { id:'alloc', x:78, y:66, label:'AI re-allocation',   color:'#9BDF5A', text:'Let resource models move tankers, sanitation crews and medical teams between sectors automatically as density and load readings change.' },
    { id:'circ',  x:36, y:74, label:'Circular waste',     color:'#FFC24B', text:'Incentivise segregation at source and tie wet waste into bio-CNG and cement kiln co-processing contracts that outlive the festival.' }
  ];

  /* ── Guided walkthrough narration (written in this deck's words) ──── */
  const guide = {
    title:'Forty-five days and four hundred million visits. This study asks a single question — how much can a place take before the system starts to fail? We answer it with the instruments that were actually running at Prayagraj in 2025.',
    framework:'Carrying capacity is not one number. Physical capacity counts the square metres per pilgrim. Ecological capacity is set by how much organic load the rivers can absorb. Social capacity is the density at which a crowd stops behaving like individuals. The warning sits where all three overlap.',
    water:'This is the river chemistry record. Watch the oxygen demand and the coliform counts move together around the bathing days. The median told a reassuring story; the peaks told a different one.',
    waste:'Waste and land run on the same clock as the crowds. Tonnes arrive daily, plastic is meant to become fuel, and the ground itself pays — compacted soil and altered banks outlast the tents.',
    sensors:'The monitoring layer is what makes the rest legible. In this simulation you can watch threshold breaches arrive before a human observer would notice them.',
    crowd:'Crowd control at Prayagraj became a data problem. 1,800 AI-enabled cameras classified density into colour bands, and threshold crossings pushed decisions to ground teams within seconds.',
    stress:'Put the city and the festival side by side and the ratios do the talking. Population multiplies eighty-fold; waste load multiplies tenfold; water demand outruns supply on every peak day.',
    green:'The engineering response was largely circular. Toilets with zero discharge, plastic elimination enforced on the ground, dense native plantations, and waste routed into energy and cement kilns.',
    policy:'Five levers turn a one-off response into standing capability: a permanent digital twin, thresholds that move, public water data, machine-assisted reallocation, and a waste economy with a life beyond the event.',
    conclusion:'The conclusion is not that the rivers were saved. It is that for the first time the failure points were measurable in real time — and that measurement, not the scale of the gathering, is the reusable asset.'
  };

  return { index, sources, waterSeries, heatmap, stressRows, sensorModel, policyPins, guide };
})();
