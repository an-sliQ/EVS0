# Digital Assessment of Carrying Capacity
### A case study of Maha Kumbh 2025, Prayagraj

An interactive, ten-slide website examining how the world's largest human gathering pressed
against the physical, ecological and social limits of the Triveni Sangam — and how digital
systems made those limits measurable in real time.

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
| 10 | Conclusion & references | Expandable reference cards with a method note |

---

## Controls

| Input | Action |
|---|---|
| `→` `Space` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `1`–`9`, `0` | Jump to slide |
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

## File structure

```
index.html          markup shell, chrome, overlays
css/deck.css        full design system — tokens, layout, components, responsive rules
js/data.js          content model: figures, series, sources, guided narration
js/charts.js        dependency-free SVG charting (line, heatmap, gauge, Venn)
js/slides.js        the ten slide builders and their interactive behaviour
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
- Total payload is under 1 MB, dominated by the three JPEG stills.
