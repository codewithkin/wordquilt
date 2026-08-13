# Decisions

Numbered, immutable, cited by number in code and in plan files. Never renumber.
When a decision is superseded, add a new one and mark the old one superseded —
do not edit it.

Cite them in comments: `// tilt is deterministic, never re-rolled (D-009)`.

---

### D-001 — `plans/`, `systems/` and `progress/` are tracked in git
*Session 1.*
The workflow template suggests gitignoring them as working notes. Sessions here
run in ephemeral cloud containers reclaimed after inactivity, so anything
uncommitted is destroyed. Gitignoring the memory would lose it every session.
`designs/extracted/` stays ignored — regenerated in seconds, ~80k lines of noise.

### D-002 — The design files are read by EXECUTING them, not by parsing markup
*Session 1.*
The `.dc.html` files are templates full of `{{token}}` placeholders; every real
value lives in a `renderVals()` method in an embedded script. `designs/extract.mjs`
runs that method in a sandbox and dumps the value tree. Regex over the markup
returns placeholders, not values.

### D-003 — heroui-native's semantic variables are repointed at the WordQuilt palette
*Session 1.*
Rather than avoiding the library or restyling each component. Without the
repoint its components render in stock grey/blue while our components render in
terracotta — internally consistent and completely wrong. Verified by grepping a
built iOS bundle: every WordQuilt hex present, zero occurrences of the stock accent.

### D-004 — Prefer the `wq-*` composite utilities over Tailwind's `shadow-*`
*Session 1.*
Tailwind's `shadow-card` compiles to a composed
`var(--tw-inset-shadow), var(--tw-ring-shadow), …` chain. React Native's
`boxShadow` parser takes a simple string and the chain is **not verified** to
survive it. The `wq-*` composites emit a plain `box-shadow`. The token test
asserts they stay plain. Revisit once someone has run this on a device.

### D-005 — Ship both `muted` and `mutedStrong`
*Session 1.*
The core screens specify `muted` `#7A6E5C` (light) / `#A99C89` (dark). The
Accessibility design file specifies `#6A5F4E` / `#B0A390` for the same role.
Measured contrast on the light sheet: 4.55:1 vs 5.70:1 — the core value only
just clears AA. Shipping both as tokens lets the high-contrast setting swap
without changing what the core screens actually specify.

### D-006 — The seam is unsolved, and must not be approximated
*Session 1. OPEN.*
The sheet curves over the field as an ellipse (`border-top-radius: 50% 74px`,
`width: 116%`). React Native does not support elliptical corner radii. It needs
an SVG path or a mask. A circular-radius approximation is obviously wrong — the
curve is roughly 4× wider than tall. Blocks the Shelf and Puzzle screens.

### D-007 — Seam overlap is 40px, not 48px
*Session 1.*
`Core Screens`, `Alternate States` and `Onboarding` all place the sheet exactly
40px above the field's base, across every field height they draw (196, 214, 216,
306). `Puzzle & Reveal` alone uses 48. That file was drawn first ("the hardest
screen first") and drifted. We follow the three-file majority, including on the
Puzzle screen — where `Alternate States` also draws 40.

### D-008 — The 13px `kicker` type role is not in the token layer
*Session 1.*
It appears only in the website design and the design-canvas chrome, neither in
launch scope. In-app "kickers" (`dailyKicker`, `offerKicker`) are 12px/900/0.16em
— identical to `sectionLabel`, differing only in colour. Its presence would also
collide with the `kicker` **colour**: Tailwind v4 resolves `text-<name>` against
`--text-*` before `--color-*`, so defining both silently deletes the colour
utility. The token test now fails any such collision.

### D-009 — Tile tilt is deterministic, never randomised at render
*Session 1.*
`((row*7 + col) % 5 - 2) * 0.7`, from the design. The tilt is texture, not
animation. A board that re-tilts on each render reads as a rendering fault.
The literal 7 is a hash multiplier, not the row length — it stays 7 for grid
sizes 6×6 through 9×9.

### D-010 — Our `Text` primitive takes `variant`, not `role`
*Session 1.*
React Native's `TextProps` already has `role` — the ARIA role. Declaring ours on
top narrowed the union to an empty intersection and made every call site a type
error. WordQuilt has real accessibility work ahead (VoiceOver traversal of the
grid is a designed screen), so RN's `role` stays available.

### D-011 — The bundle identifier is deliberately absent from `app.json`
*Session 1. OPEN — launch blocker.*
`expo prebuild` wrote `com.anonymous.wordquilt` into both `ios.bundleIdentifier`
and `android.package`. That is Expo's "you must change this" placeholder. Both
are permanent once submitted to either store and are the owner's decision, so
they were removed rather than guessed. Prebuild re-defaults them in development,
which is harmless and keeps the gap visible.

### D-012 — Opaque source icons are stored as RGB, and prebuild output is re-flattened
*Session 1.*
The design manifest requires seven files to have no alpha channel. All seven
shipped as RGBA (fully opaque, but the channel present — which is what App Store
Connect rejects). They were flattened losslessly, pixel-identity verified.

Separately, `expo prebuild` **re-adds** an alpha channel to the generated dark
iOS icon every time — exactly what the asset README warned about. Since `ios/` is
regenerated, the fix is a re-runnable post-prebuild step
(`scripts/flatten-ios-icons.mjs`), wired into `pnpm --filter native prebuild`.

### D-013 — Orientation is locked to portrait
*Session 1.*
Was `default` (any orientation). Every frame in every design file is portrait
390×844, and there is no landscape design for any screen. The core gesture is a
finger drag across a grid sized to a portrait width. Reversible in one line if
the owner wants landscape designed.

### D-014 — Motion is implemented with Moti, and is material rather than decorative
*Session 1.*
Moti on Reanimated. The vocabulary is press / stitch / lay-down / resolve /
recede — see `systems/03-motion.md`. Things are stitched, pressed and laid down;
nothing slides in from offscreen or bounces.

The spec is derived from what the Accessibility design says is REMOVED under
reduced motion, which tells us what exists normally. Anything not traceable to a
design caption is an invention and is recorded as such.

Two consequences that are easy to get wrong:
- The press gesture is the control sitting DOWN onto its own offset edge by
  exactly the edge depth, with the shadow collapsing in step — not an opacity
  fade. The only exception is `RoundButton` on the field, which has no edge.
- Reduced motion **degrades, never skips**. A player with reduced motion still
  has to see that a word locked in. `useMotion()` returns the durations to use.

### D-015 — One commit per todo
*Session 1. Process.*
A feature is a plan file; a todo is a sub-feature; each todo is one commit
carrying its own message and SHA. Where several todos are genuinely one edit to
one file, they may share a SHA **and must say so** — fabricating intermediate
states that never existed is worse than an honest shared commit.

### D-016 — Oblique titles are generated per theme, not authored per puzzle
*Session 2. Owner's decision.*
Authoring is ~370 lines of editorial at launch and a permanent 50/month tax.
Generation makes a new pack cost one small block of writing instead of fifty
lines. `packages/generator/src/titles.ts` assembles from per-theme frames plus
fillers, plus standalone lines for the ones that only work whole.

Four rules are enforced in code, not left to whoever writes the next theme: a
title may never contain the theme phrase or theme name; never contain a word
hidden in that puzzle; never repeat within a pack; and is deterministic per
puzzle. The first two protect the only moment the product exists for.

### D-017 — Reanimated directly; Moti removed. Supersedes the tooling half of D-014
*Session 2. Owner's request.*
The motion vocabulary in D-014 is unchanged — press / stitch / lay-down /
resolve / recede, material rather than decorative. Only the implementation moved.

`lib/motion.ts` exposes Reanimated configs and a memoised `useMotion()`. Reduced
motion is handled with `ReduceMotion.System` on every timing, spring and
entering animation, so Reanimated itself honours the OS setting and animations
degrade rather than being skipped.

Two things worth knowing: the iOS bundle dropped 6.3MB to 5.8MB, and
`useMotion()` MUST stay memoised — an unmemoised return makes every
`useEffect([..., motion])` re-fire on each render, which on the grid restarts
every tile's spring whenever anything above it re-renders.

### D-018 — Word selection constrains word SHAPE, not just the letter total
*Session 2.*
Hitting an exact total is easy if short words are allowed: the first working
generator returned GREASEPROOF plus six three-letter words — arithmetically
perfect, and a miserable puzzle. The design's own reference board is six words
averaging 5.5 letters.

Selection now takes `minWordLength` (default 4), `maxWordLength` and
`maxShortWords`. This has a direct product consequence: **phrase length and word
quality trade off against each other**, because the grid area is fixed. A long
theme phrase leaves fewer cells for words and forces them short. Theme phrases
must be authored against the grid sizes they will be used at.

### D-019 — The cold-open board is generated, not transcribed from the design
*Session 3.*
The Onboarding design draws a specific 6×6 demo board revealing "morning
ritual". Its four words (TOAST, MILK, OATS, SOAP) do read correctly off that
grid, but they occupy only 17 of the 36 cells, so the 19 leftover letters
resolve to `MMORNIUNGRIGMTUAJAL` — not the 13-letter `MORNINGRITUAL` promised.
Verified by transcribing the board and reading the leftovers.

The design board is illustrative. Shipping it would mean the first reveal a
player ever sees resolves to nonsense, and that reveal is the entire product.
So O1 generates its board with the real packer against a morning pool, seeded so
every player gets the same one and it actually resolves.

Everything else about O1 follows the design exactly: 6×6, four words, the
"Something warm." oblique title, the 306px field, the reserved hint band.

### D-020 — Tapping a word slot stands in for tracing, temporarily
*Session 3. OPEN — the biggest remaining gap.*
The drag-to-trace gesture is not built. Until it is, O1 and S2 sew a word by
tapping its slot.

This keeps the whole flow walkable and every other behaviour real — the boards,
the reveal, the hint band, the progression — but it is NOT the game. The drag is
the core interaction of the product and everything else is scaffolding around
it. `react-native-gesture-handler` is already installed.

### D-020 — SUPERSEDED by D-021. Tracing is no longer stubbed.
*Session 4.* Kept for the record; see D-021.

### D-021 — Trace rules are pure functions in the generator, not in the gesture handler
*Session 4.*
`packages/generator/src/trace.ts`, with 23 tests. The rules about what a legal
trace IS are game rules, not UI concerns, and they are the one piece of logic
that must be right — a trace accepting a non-adjacent hop, or rejecting a
legitimate diagonal, breaks the only interaction the product has. Pure functions
mean CI tests them directly instead of through a gesture handler.

Three specifics that are easy to get wrong:
- Hit targets are the full PITCH, not the drawn cell. The 2px gutters between
  tiles must not drop a trace mid-drag.
- Dragging back onto the previous cell UNDOES the last step. Players correct
  themselves constantly; a grow-only trace forces them to lift and restart.
- A trace matches against PLACEMENTS, not the word list. A coincidental spelling
  elsewhere on the board would leave the real placement unsewn and its cells
  wrongly counted as used, breaking the leftover arithmetic and the reveal.

A wrong trace does nothing at all — no shake, no red, no buzz (constraint 4).
A correct one gets a light haptic tick. Silence is not a rebuke.

### D-022 — Progress stores a set of things done, and nothing else
*Session 4.*
No streak, no last-played-for-a-chain, no missed-day count, no scores, times or
stars. Those fields do not exist in `Progress`, because a field that exists
eventually gets displayed and each would be a way of telling a player they have
let something slip. A test asserts no such field appears.

Free hints REFILL daily rather than accumulating, and are never removed, so
there is nothing to lose by not playing. Free hints are spent before purchased
ones, always.

Pure rules are split from persistence (`progress.ts` vs `progress-store.ts`) so
they test under plain `node` without a simulator.

### D-023 — CI asserts the palette survived the build
*Session 4.*
`scripts/check-bundle.mjs` greps the shipped Hermes bytecode for the WordQuilt
colours and font families, and for the absence of heroui-native's stock accent.

This is the one failure the project cannot catch any other way. If the uniwind
config stops being picked up, every component falls back to the library's theme:
everything stays internally consistent, nothing errors, the typecheck passes and
the diff looks fine — and the app ships in grey and blue. It has to be asserted
against the artefact, not the source.

CI ordering is deliberate: pure logic first (milliseconds), then design fidelity,
then typecheck and bundle. A broken trace rule should fail in ten seconds rather
than after a twenty-minute build.
