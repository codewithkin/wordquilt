# 01 — Foundation

Tokens, primitives, platform assets, and the checks that keep them honest.

**Status: complete (session 1).** Committed as one change; the todos below
record what was done and how it was verified.

---

## T01 — Extract the designs into readable values
- [x] `pending-T01`
- **Commit:** `feat(designs): extract design files into greppable values`
- **Touches:** `designs/extract.mjs`, `.gitignore`
- **Done when:** every `.dc.html` produces a `.json` and a sorted `.txt`, and
  the extractor reports failures rather than emitting a partial tree.
- **Result:** all 7 designs extract. 6,484–17,244 values each. See D-002 for why
  this executes the design rather than parsing it.

## T02 — Build the token package from the extracted values
- [x] `pending-T02`
- **Commit:** `feat(tokens): add @wordquilt/tokens from the design files`
- **Touches:** `packages/tokens/**`
- **Done when:** every colour, radius, elevation, type role and grid constant is
  traceable to a value in `designs/extracted`, and the package imports cleanly.
- **Result:** Done. Names follow the design's own vocabulary (field/sheet/tile/
  ink/sewn) rather than a generic scale, so auditing a screen against its design
  needs no translation.

  **Note (session 1):** two values were initially inferred rather than read —
  `screenInset: 20` and `reservedHintBand: 48`. Both were wrong. The real
  content inset is **26px** and the reserved band is a **32px** gap plus a flex
  spacer. Corrected after checking all four screen design files, which agree.

## T03 — Wire the tokens into uniwind and prove the wiring
- [x] `pending-T03`
- **Commit:** `feat(native): wire the WordQuilt palette into uniwind`
- **Touches:** `apps/native/global.css`
- **Done when:** a compiled stylesheet shows WordQuilt values behind the utility
  class names — not merely that the CSS parses.
- **Result:** Verified twice. The Tailwind compiler resolves `bg-field` to
  `#c25a34` in light / `#8a3e27` in dark, and a full iOS bundle contains every
  WordQuilt hex with **zero** occurrences of heroui's stock accent (D-003).

  **Note (session 1):** `--text-kicker` was removed. It collided with the
  `kicker` colour and Tailwind resolves font-size before colour, which would
  have silently deleted the colour utility. See D-008.

## T04 — Token parity test, made to fail
- [x] `pending-T04`
- **Commit:** `test(tokens): assert TS and CSS token parity`
- **Touches:** `packages/tokens/test/parity.test.ts`
- **Done when:** 22 assertions pass, AND each class of check has been shown to
  go red on a deliberate change.
- **Result:** Proven red on all seven classes — colour drift, radius drift, a
  blurred shadow, an introduced error colour, a token missing from one theme, a
  composite rewritten to Tailwind's var chain, and a size/colour name collision.
  Restored clean each time.

  **Note (session 1):** writing this test surfaced two real bugs in itself. A
  prose CSS comment containing `--wq-shade:` parsed as a declaration and
  swallowed the next real one — comments are now stripped before parsing. And
  string comparison failed on `0.30` vs `0.3`; the comparator now canonicalises
  colours numerically, which still separates `0.3` from `0.34`.

## T05 — Reusable primitives
- [x] `pending-T05`
- **Commit:** `feat(native): add UI primitives with the hard-offset elevation`
- **Touches:** `apps/native/components/ui/**`, `apps/native/lib/fonts.ts`,
  `apps/native/app/_layout.tsx`, `apps/native/app/(drawer)/index.tsx`
- **Done when:** Text, Card, Pill, Rule, Button, RoundButton, Chip, WordSlot and
  LetterTile exist with values matching the design, and the app bundles.
- **Result:** Done, bundles clean. Fonts load behind the splash; all 7 faces
  verified present in the export by content hash.

  **Note (session 1):** the drawer index screen was dead Better-T-Stack scaffold
  referencing undefined variables and heroui's `success`/`danger` colours (which
  WordQuilt bans). Replaced with a foundation-preview screen that renders every
  primitive — it exists to make the token layer visible on device. **Delete it
  when the Shelf lands.**

  **Not done:** no screen has been rendered on a device or simulator. "Bundles"
  is not "runs" and is not "looks right". The first device run is the next
  session's first job.

## T06 — Platform assets and app.json
- [x] `pending-T06`
- **Commit:** `fix(native): wire every icon key and flatten the opaque icons`
- **Touches:** `apps/native/app.json`, `apps/native/assets/images/**`,
  `scripts/check-assets.mjs`, `scripts/flatten-ios-icons.mjs`
- **Done when:** every row of the manifest **in the design file** is satisfied by
  a real file and a real config key, checked by a script rather than by reading.
- **Result:** All 15 rows satisfied. Prebuild generates both native projects with
  the correct icons, adaptive layers and splash colours.

  **Note (session 1):** three real corrections. (a) Seven files carried an alpha
  channel the manifest forbids — flattened losslessly, pixel identity verified
  (D-012). (b) `expo prebuild` **re-adds** alpha to the dark iOS icon every run,
  which App Store Connect rejects; fixed with a re-runnable post-prebuild step.
  (c) `android.edgeToEdgeEnabled` is rejected in SDK 57 — removed.

  **Note (session 1):** `ios.bundleIdentifier` / `android.package` deliberately
  left unset — see D-011. Launch blocker, owner's decision.
