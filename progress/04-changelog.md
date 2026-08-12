# Changelog

Newest first. This is where the **reasoning** lives — git has the file list.

---

## Session 1

**Scaffolded the working method, and built the foundation: token layer,
primitives, platform assets, and three checks that keep them honest.**

### The working method

`designs/` + `systems/` + `plans/` + `progress/`, per `AGENT-WORKFLOW.md`.

The design files turned out to be **executable, not static**: each `.dc.html` is
a template of `{{token}}` placeholders plus a `renderVals()` method holding
every real value. Regexing the markup returns placeholders. So
`designs/extract.mjs` runs that method in a sandbox and dumps the value tree
(D-002). All 7 designs extract, 6.5k–17k values each.

`plans/`, `systems/` and `progress/` are **tracked, not gitignored** (D-001),
against the template's suggestion. Sessions here run in ephemeral cloud
containers reclaimed after inactivity — gitignoring the memory would destroy it
every session.

### Tokens

Built from the extracted values, using **the design's own vocabulary** —
`field`, `sheet`, `tile`, `ink`, `sewn` — rather than a generic
background/foreground scale. That matters for audits: `bg-field` in the code
maps to `t.field` in the design with nothing to translate.

The design has **three grounds**, not one, each with its own ink, hairline and
elevation colour. Two dark-mode traps are called out in
`systems/02-design-system.md`: `shade` moves *away* from `ink` in dark (or every
card glows), and controls on the terracotta field take a warm scrim rather than
the near-black shade (or they read as holes punched through the band).

Elevation is one language — a hard, un-blurred `0 Npx 0 <ink>` offset edge. A
census of every shadow across all seven design files found no blurred shadow
anywhere.

### What the checks caught

Three checks now span gaps that nothing else covers, and **all three were
deliberately made to fail** before being trusted.

`pnpm check:tokens` (22 assertions) proved red on seven classes: colour drift,
radius drift, a blurred shadow, an introduced error colour, a token missing from
one theme, a composite rewritten to Tailwind's var chain, and a size/colour name
collision.

Writing it surfaced two bugs **in the test itself**, both worth knowing:
- A prose CSS comment containing `--wq-shade:` parsed as a declaration and
  swallowed the next real one. Comments are now stripped before parsing.
- String comparison failed on `0.30` vs `0.3`. The comparator now canonicalises
  colours numerically — still separating `0.3` from `0.34`, which is the
  difference that matters.

`pnpm check:assets` reads the manifest **out of the design file** rather than
copying it, so editing the design is what changes the requirement.

### Real corrections to the assets

- **Seven files carried an alpha channel the manifest forbids.** Fully opaque,
  but the channel's presence is what App Store Connect rejects. Flattened
  losslessly, pixel identity verified (D-012).
- **`expo prebuild` re-adds alpha to the dark iOS icon every run** — exactly
  what the asset README warned about. Since `ios/` is regenerated, the fix is a
  re-runnable post-prebuild step, wired into `pnpm --filter native prebuild`.
- `android.edgeToEdgeEnabled` is rejected in SDK 57 — removed.
- `expo-system-ui` was missing, so `userInterfaceStyle: automatic` did nothing.

Everything else in the manifest verified clean, by measurement rather than by
reading filenames: the tinted icon is genuinely greyscale (0 non-grey pixels of
188 colours), the monochrome layer is genuinely one flat shape, and the adaptive
foreground sits inside the 72dp safe circle (325.3px of a 341.3px radius).

### Divergences from the specs

- **D-007, seam overlap 40 not 48.** Three of four design files place the sheet
  exactly 40px above the field's base across every field height they draw.
  `Puzzle & Reveal` alone uses 48; it was drawn first and drifted. We follow the
  majority — including on the Puzzle screen, where `Alternate States` also
  draws 40.
- **D-008, the 13px `kicker` type role is not in the token layer.** Website and
  design-chrome only. Its name would also have collided with the `kicker`
  *colour*, and Tailwind resolves font-size before colour — which would have
  silently deleted the colour utility.
- **D-005, both `muted` and `mutedStrong` ship.** Core screens specify one, the
  Accessibility file another. Measured: 4.55:1 vs 5.70:1 on the light sheet.
- **D-013, orientation locked to portrait.** Was `default`. Every frame in every
  design file is portrait and there is no landscape design.
- **D-011, the bundle identifier is deliberately absent.** Prebuild wrote
  `com.anonymous.wordquilt`; that is permanent once submitted and is the owner's
  decision, so it was removed rather than guessed.

Two of my own errors, corrected mid-session and worth recording because the
pattern will recur: I wrote `screenInset: 20` and `reservedHintBand: 48` from
inference rather than reading. Both were wrong — the real values are **26** and
**32**, and all four screen design files agree. Read the design; do not infer it.

### What is verified, and what is not

**Verified by execution:**
- `expo prebuild` runs clean on both platforms, no warnings.
- A full iOS Metro bundle builds (5.8MB Hermes).
- Every WordQuilt hex is present in that bundle, and heroui's stock accent
  appears **zero** times — the palette is genuinely live, not merely configured.
- All 7 font faces are in the export, confirmed by content hash.
- Generated native projects carry the right icons, adaptive layers (background
  colour + foreground + monochrome) and splash colours in both themes.
- 22 token assertions pass; 15 asset manifest rows pass.

**NOT verified:**
- **Nothing has been rendered on a device or simulator.** "Bundles" is not
  "runs" and is not "looks right". No screen has been visually compared against
  its design file.
- The `wq-*` composites are believed correct on native but that rests on reading
  uniwind's parser, not on seeing a shadow (D-004).
- Typecheck was not run to completion — the owner asked mid-session to verify
  via prebuild instead and to ignore errors that do not stop the app running.
  Known outstanding: none introduced by this session that prebuild or the
  bundler flagged.

### Next

**Run the app and look at it.** The foundation preview screen at
`app/(drawer)/index.tsx` exists for exactly this — it renders every primitive in
both themes. If the ground is not terracotta-and-cream with hard offset edges,
stop and fix that before anything else.

Then **the generator spike** (`plans/02-generator-spike.md`), before any screen
work. It answers whether packs are 50 puzzles or 30, and everything downstream
depends on that number.
