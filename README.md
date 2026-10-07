# Digital Assessment of Carrying Capacity
### A case study of Maha Kumbh 2025, Prayagraj

An interactive, twelve-slide website examining how the world's largest human gathering pressed
against the physical, ecological and social limits of the Triveni Sangam — and how digital
systems made those limits measurable in real time. It closes with a working capacity simulator
and a weighted decision matrix that share one model.

Built as a self-contained static site. No build step, no frameworks, no external CDNs,
no network calls at runtime.

---

## Running it

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or open `index.html` directly. Everything works from the file system.

---

## Design rules

| Rule | How it is applied |
|---|---|
| **6×6 rule** | Maximum six bullets per slide, maximum six words per bullet. Enforced in `js/slides.js`. |
| **Visual dominance** | The graphic panel takes roughly 63% of every slide body; text sits in the narrower column. |
| **Data-first** | Every quantitative claim carries a figure and a source note. Charts, maps and gauges lead each slide. |

---

## Slides

| # | Slide | Interactive element |
|---|---|---|
| 01 | Title & introduction | Ken-burns hero, scale statistics |
| 02 | Carrying capacity frameworks | Clickable Venn — physical / ecological / social TCC with a system-failure core |
| 03 | Hydrological stress | Multi-axis line chart of BOD, dissolved oxygen and faecal coliform with annotated bathing days |
| 04 | Waste & land degradation | 25-sector heatmap with click-to-inspect sector readouts |
| 05 | Digital ecological monitoring | Live sensor dashboard with six parameters and a rolling 24-reading buffer |
| 06 | Crowd analytics | AI vision simulation — 320 agents, colour-classified bounding boxes, live alert log, inflow slider |
| 07 | Comparative stress analysis | Stress meter comparing city baseline against Mela peak, plus a composite gauge |
| 08 | Smart solutions & green engineering | Six expandable solution cards with icons |
| 09 | Strategic policy recommendations | Digital-twin blueprint with five selectable policy nodes |
| 10 | **Capacity simulator** | Six levers driving a live crowd / river / waste pressure envelope, with the binding constraint named in real time |
| 11 | **Decision matrix** | Six intervention packages scored against five adjustable-weight criteria; applying a package rewires the simulator |
| 12 | Conclusion & references | Expandable reference cards with a method note |

---

## Controls

| Input | Action |
|---|---|
| `→` `Space` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `1`–`9`, `0` | Jump to slide (`0` = last slide) |
| `O` | Slide overview grid |
| `?` | Keyboard shortcut sheet |
| `G` | Guided walkthrough (auto-advances with narration) |
| `S` | Ambient river sound (synthesised, no audio files) |
| `F` | Fullscreen |
| `Home` / `End` | First / last slide |
| `Esc` | Close overlays |
| Swipe / scroll wheel | Change slides on touch and desktop |

---

## Data and method

Figures are drawn from publicly reported monitoring data and official statements made
during and about the 2025 event. Each slide carries an inline source note, and slide 10
lists the reference base in full. Principal sources:

- **CPCB** water-quality monitoring submitted to the National Green Tribunal — twenty
  rounds at ten mass-bathing locations, 12 January to 22 February 2025.
- **UPPCB** daily Sangam readings, including faecal coliform of 11,000 MPN/100 mL on
  Makar Sankranti and 49,000 MPN/100 mL on 20 January, against a 2,500 MPN/100 mL limit.
- **NGT record** — projected event sewage flow of about 519 MLD, against roughly 450 MLD
  of treatment provision and an installed city capacity near 340 MLD.
- **ICCC operational records** — over 3,000 cameras, 1,800 of them AI-enabled, thirteen
  standing contingency schemes, drone and underwater surveillance across 25 sectors.
- **PIB and Mela Authority briefings** — plastic-free zones, about 1.5 lakh toilets and
  urinals, 25,000 dustbins, roughly 10,000 sanitation workers, and Miyawaki replanting of
  the cleared Baswar yard with 27,000 saplings across 27 species.
- **Urban infrastructure demand assessment** — peak-day potable water demand above
  450 MLD against a city supply near 350 MLD, with 85 new tubewells.

**Where the deck is illustrative rather than reported:** the 25-sector heatmap load
indices and the live sensor telemetry on slide 5 are modelled illustrations built to
published ranges, not raw instrument output. The crowd-density simulation on slide 6 is a
visual model of the documented system, not a replay of ICCC footage. Both are labelled as
such in the interface.

---

## The simulator model

Slide 10 runs one small engine. Pressure on each axis is expressed as a multiple of that axis's
limit, so the three are directly comparable and the **binding constraint is simply the largest
of the three** — which changes as the levers move:

| Axis | Pressure | Limit |
|---|---|---|
| Crowd & physical | bathers arriving in the peak hour against the hourly throughput of the bathing frontage, expressed as corridor and approach density | 2.5 persons/m² operational control band |
| River & ecological | untreated discharge × raw load, diluted by the reach flow available for near-field mixing; the worst of BOD, faecal coliform and dissolved oxygen governs | 3 mg/L BOD · 2,500 MPN/100 mL · 5 mg/L DO |
| Waste & land | solid waste arriving against processing capacity | processing capacity |

Defaults are calibrated so the starting state reproduces the documented peak day — about 480 MLD
of sewage generated against 400 MLD treated, 650 MT/day of waste reaching the Baswar plant, and a
near-field coliform load of roughly 2.3× the criterion. From there the crowd axis binds if the
inflow and frontage levers are pushed, the river axis binds if treatment or dilution fall, and a
well-set combination leaves no axis over its limit at all.

Slide 11 scores six intervention packages against crowd safety, river health, waste handling,
speed to deploy and feasibility. Weights are yours (0–4) and re-rank the table live; every package
carries a modelled effect on the same levers, so applying one immediately moves the pressure
envelope, the axis cards and the binding-constraint verdict on slide 10.

**Modelled, not measured:** package scores, feasibility ratings and every coefficient in the engine
are illustrative judgements built to the published ranges. The relationships — not the decimals —
are what the 2025 monitoring record supports.

---

## File structure

```
index.html          markup shell, chrome, overlays
css/deck.css        full design system — tokens, layout, components, responsive rules
js/data.js          content model: figures, series, sources, guided narration
js/charts.js        dependency-free SVG charting (line, heatmap, gauge, Venn)
js/slides.js        the ten document slide builders and their interactive behaviour
js/simulator.js     capacity-simulator engine plus the simulator and decision-matrix slides
js/app.js           navigation, keyboard, swipe, overlays, guided mode, audio
assets/             three photographs — hero aerial, monitoring dawn, finale sunset
```

---

## Accessibility & performance notes

- Full keyboard navigation; inactive slides are `visibility:hidden` and therefore removed
  from tab order.
- `prefers-reduced-motion` disables animation and the Ken Burns drift.
- Live region announces every slide change for screen readers.
- Charts are inline SVG, redrawn on resize via a single `ResizeObserver` per host.
- The crowd simulation pauses via `requestAnimationFrame` cancellation when its slide is
  inactive or the tab is hidden.
- The simulator engine recomputes on `input` but paints at most once per animation frame, so
  dragging a lever stays smooth while both slides stay in sync.
- Overlays are hidden with the `hidden` attribute backed by `[hidden]{display:none!important}`,
  which is what makes them closable — an author `display` rule otherwise outranks the UA rule.
- Total payload is under 1 MB, dominated by the three JPEG stills.
