# START HERE

You are picking up **WordQuilt**, a daily themed word search where the letters
you never use spell out the theme. This file is self-contained.

> Read `AGENT-WORKFLOW.md` first — that is *how* work is done here.
> This file is *what* to build next.

Last updated: end of session 3.

---

## Which screens are done?

**14 of 19.** All nine onboarding screens, and five of the ten core screens.

The app walks a complete first-time flow: cold open -> reveal -> proposition ->
theme picker -> fabric picker -> payoff -> rhythm -> Shelf, then Shelf -> pack ->
puzzle -> reveal -> back to the Shelf.

Not built: The Wall, Store, Fabric, Hint overlay, Settings.

**`progress/02-screens.md` is the screen-by-screen list.** Read that for what to
build next. It is the only doc that talks in screens rather than layers.

**Every screen bundles. None has ever been rendered on a device.** That is the
biggest gap in the project, and it is task one below.

---

## The rule that comes before everything else

**Every screen you build, you build from its design file. Every time.**

| Rank | Source | Authority |
| --- | --- | --- |
| 1 | `designs/extracted/*` | What a screen looks like |
| 2 | `systems/*` | Why, and rules spanning screens |
| 3 | `packages/tokens` | A convenience for shared values |
| 4 | Anything else | Nothing |

Run `pnpm designs:extract`, then grep `designs/extracted/<Screen>.txt` — it is
sorted `path = value`, one per line. **Do not build from `packages/tokens`.**
Tokens are downstream and allowed to be incomplete; the designs are not.

**The concrete failure, from this project:** in session 1 I wrote two spacing
values from inference instead of reading — `screenInset: 20` and a `48px`
reserved band. Both were wrong. The real values are **26** and **32**, and all
four screen design files agreed on them the whole time. Reading took ninety
seconds.

**Registered exceptions** (the only places we knowingly override a design):
D-005, D-007, D-008 in `systems/09-decisions.md`. Add to that list rather than
diverging silently.

---

## Your task, in order

### 1. Run it, walk the whole flow, then AUDIT. Before anything else.

```bash
pnpm install
pnpm --filter native prebuild     # also flattens the iOS icons — see D-012
pnpm --filter native ios          # or: android
```

Fourteen screens have been written and none has been seen. Walk the flow from a
fresh install, then open each screen's design file and compare it in BOTH
themes: ground, surface, border, radii, control heights, type sizes, section
gaps.

**This is a separate, deliberate step — do not skip it because the screens were
built carefully.** In the project this workflow came from, a session that had
genuinely followed the designs still had five real deviations, including a wrong
background on the most important screen.

### 2. The drag gesture. It is the core interaction and it is stubbed (D-020).

Tracing a word by dragging across adjacent cells.
`react-native-gesture-handler` is installed. Until it lands, O1 and S2 sew a
word by tapping its slot — the flow is walkable but it is not the game.

### 3. A progress store

Every screen shows placeholder counts. Sewn squares, hints used and daily
history all need somewhere real to live. `lib/storage.ts` has the pattern.

### 4. The remaining five screens

S5 The Wall, S6 Store, S8 Fabric, S9 Hint overlay, S10 Settings.

### 5. The generator spike is written but unmeasured

`packages/generator` selects word sets, packs snaking paths and resolves the
theme reveal — verified end to end on a real board. What has NOT been run is
the yield measurement that answers **50 puzzles per pack or 30**. See
`plans/02-generator-spike.md` T04.

## What WordQuilt is, in five rules

Full context in `progress/01-project.md`. The ones that decide arguments:

1. **No advertising anywhere, in any form.** This is the entire market position.
2. **Play is never gated by a resource.** No lives, energy, timers, currency.
   A puzzle is always completable with zero hints.
3. **No punitive language, ever.** No streaks lost, no "you missed a day", no
   red badges. There is no error colour in the palette and the token test fails
   if one appears.
4. **Zero interruption budget on the Puzzle screen.** Nothing appears over the
   grid during play. The band under it is reserved and stays empty so hint
   feedback never shifts the layout.
5. **No account, no login, no email capture.** Progress is on-device.

---

## What is already built

| Area | State |
| --- | --- |
| Design extraction | **Works.** `pnpm designs:extract`, all 7 files |
| Token layer | **Built and proven wired.** Every WordQuilt hex is in a real iOS bundle; heroui's stock accent appears zero times |
| Token parity check | **22 assertions, proven able to fail on 7 classes of drift** |
| UI primitives | **Written and they bundle. Never rendered on a device.** |
| Fonts | **All 7 faces load and bundle**, verified by content hash |
| Platform assets | **All 15 manifest rows pass.** Prebuild generates both native projects correctly |
| Screens | **14 of 19.** All onboarding, 5 core. See `progress/02-screens.md` |
| The seam | **Solved** (D-006 closed). One SVG arc — see `components/ui/seam.tsx` |
| Generator | **Works end to end.** Selection, packing and reveal verified on a real board. Yield NOT measured |
| Motion | **Reanimated only** (D-017). Moti removed |

"Built" above means written, bundled and machine-checked. It does **not** mean
seen.

---

## Read this before you write a line

- **Class names must be literal.** Uniwind extracts them statically at build
  time. A className built from a template string produces **no styles at all**,
  silently. Variant maps hold full literal strings for this reason.
- **Never set `fontWeight`.** RN does not synthesise weights for custom families
  — it renders the regular cut on Android and a faked bold on iOS, which looks
  almost right. The family IS the weight (`Nunito_900Black`).
- **`shade` is not `ink` in dark mode**, and `field-edge` is not `shade`. Get
  these wrong and cards glow or punch holes. See `systems/02-design-system.md`.
- **Prefer the `wq-*` composites over Tailwind's `shadow-*`** (D-004). The
  latter compiles to a var chain RN's shadow parser may not handle.
- **The elevation border and offset are ONE gesture.** An offset without its
  matching 2px border reads as a drop shadow and the material disappears.
- **`expo prebuild` re-adds alpha to the dark iOS icon every run** and App Store
  Connect rejects it. `pnpm --filter native prebuild` handles it; a bare
  `expo prebuild` does not.
- **Tile tilt is deterministic** (D-009). Never randomise it at render.

---

## Where things are

| Path | What | Tracked |
| --- | --- | --- |
| `designs/*.dc.html` | The design source of truth | yes |
| `designs/extract.mjs` | Runs them, dumps values | yes |
| `designs/extracted/` | Readable values — grep these | **no**, regenerate |
| `systems/` | Rules, architecture, numbered decisions | yes (D-001) |
| `plans/` | Numbered todos, one per commit | yes (D-001) |
| `progress/02-screens.md` | **Which screens are done.** Start here for screens | yes |
| `progress/` | This file, the project brief, the changelog | yes (D-001) |
| `packages/tokens/` | Design values as TS + the parity test | yes |
| `packages/generator/` | Puzzle generation. Deterministic, seeded | yes |
| `apps/native/global.css` | **The uniwind config.** Mirrors the tokens | yes |
| `apps/native/components/ui/` | The primitives | yes |
| `scripts/` | Asset and icon checks | yes |
| `apps/native/ios`, `android` | Prebuild output | **no**, regenerate |

### Commands

```bash
pnpm designs:extract              # refresh designs/extracted
pnpm check:tokens                 # TS <-> CSS parity, 22 assertions
pnpm check:assets                 # PNGs + app.json vs the design's manifest
pnpm --filter native prebuild     # prebuild + flatten the iOS icons
```

---

## Open items, in priority order

1. **Nothing has been rendered on a device.** Do this first.
2. **The bundle identifier is unset (D-011).** `ios.bundleIdentifier` and
   `android.package` are deliberately absent — prebuild defaults them to
   `com.anonymous.wordquilt`. Permanent once submitted; the owner must choose.
   **Launch blocker.**
3. **The seam is unsolved (D-006).** Blocks every screen. Try the SVG path first.
4. **Generator spike unrun.** Decides 50 vs 30 puzzles per pack.
5. **Four open product questions** — oblique titles authored or generated;
   quilt scope continuous or per-pack; cloud sync in v1; alternate input mode.
   See `plans/00-roadmap.md`. None block items 1–4.
6. **`apps/web` is untouched scaffold.** Out of launch scope. Leave it.

---

## The test

Every decision here answers to one question:

> It is 6:40am. She has not had coffee, she has four minutes before the house
> wakes up, and this is the only thing today that is just hers.
> **Does what you just built leave her calmer than it found her?**

If it asks her for anything — attention, money, a decision, an apology for
missing yesterday — it fails, no matter how good it looks.
