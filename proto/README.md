# Signal Arena — complete group, implementation iteration 5 — platform pass

Open `index.html`. Nine interactive prototypes and 201 isolated lab routes are included.

## Platform expansion (+5,414 lines)
- One command palette across every screen (`Ctrl/⌘+K` or `/`).
- Instant search across all 201 executable routes.
- Recent routes, favorites and local completion status.
- Progress dashboard and JSON export.
- Reduced motion, high contrast, large text and feedback preferences.
- Automatic dialog semantics, focus trapping, skip navigation and live announcements.
- Local-only interaction telemetry with no network transmission.
- Built-in 26-check accessibility and UX audit available from the **QA** tab.
- Explicit 201-route registry generated from the fixture contracts.
- All 223 HTML screens load the same platform layer.

## UX improvements
- Isolated practice reduced from 3 screens to 2: decision → debrief.
- Evidence Director reduced from 6 screens to 4 without removing evidence, risk lock or reveal.
- Module onboarding reduced from 4 screens to 3; safe practice advances after the answer.
- TaskEnvelope teaching reduced from 3 screens to 2.
- Chest odds are visible by default; opening no longer requires a preliminary tap.
- Search and live result counts added to the 38-module, 36-mechanic, 46-mechanic, 24-mechanic, 120-factor and 201-route registries.
- Lens selection now replaces an occupied role directly instead of producing a blocking error.
- Mobile bottom sheets, sticky context header, stronger focus states and 48 px minimum targets added globally.

## Engineering evidence added
- 201 JSON fixtures across all major registries and support systems.
- 201 ten-check manifests and 201 `/lab/<suite>/<code>/` executable routes.
- Novice, guided and advanced modes with local state and telemetry.
- Canonical 100/60/20/0 option weights; speed is excluded from Quality Score.
- 52-term level-aware lexicon and executable `tools/lexicon_gate.py`.
- Executable `tools/audit.py` for caps, scoring, telemetry, routes and hidden-future invariants.
- Canonical motion-token and seven-gesture dictionary audit in `tools/lint_motion_gestures.py`.
- 120-factor `evidence-manifest.json` connected to the Readiness Bench.
- Engineering Lab for public projection, decision/future hashes, verified reveal and idempotent rewards.

## Start
- `index.html` — all nine prototypes.
- `route-index.html` — all 201 isolated routes.
- `engineering-lab.html` — contracts and evidence.
- `prototype-9-readiness.html` — specification/build readiness modes.
- `ROAD_TO_95.md` — strict current estimates and external evidence gates.

## Local verification
```bash
python tools/audit.py
python tools/lexicon_gate.py fixtures --level 5 --player-only
python tools/lint_motion_gestures.py
# Open any screen and press Ctrl/⌘+K → QA
```
