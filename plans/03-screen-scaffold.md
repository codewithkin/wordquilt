# 03 — Screen scaffold

The field-over-sheet chrome every screen sits in. Blocks Shelf, Puzzle, Pack and
most of Onboarding, so solving it once unblocks all of them.

---

## T01 — Solve the seam (D-006)
- [ ] `pending-T01`
- **Commit:** `feat(native): build the field-to-sheet seam`
- **Touches:** `apps/native/components/ui/seam.tsx`
- **The problem:** the sheet curves over the field as a wide shallow ellipse —
  `left: -8%`, `width: 116%`, `border-top-radius: 50% 74px`. React Native does
  not support elliptical corner radii, so this cannot be a View with a radius.
- **Options, in the order worth trying:**
  1. `react-native-svg` path — already a dependency. A quadratic curve across
     116% width with a 74px rise, plus a 2px stroke for the border. Most likely
     to be exact.
  2. A masked View.
  3. Two overlapping circles — almost certainly wrong; the curve is ~4× wider
     than tall.
- **Done when:** rendered on a device beside `designs/extracted/Core Screens`,
  the curve height and overhang match, the 2px border follows the curve, and it
  holds at 196/214/216/306 field heights.
- **Do NOT approximate with a circular radius.** It is obviously wrong at a
  glance and every screen built on it would need rebuilding.

## T02 — Screen scaffold component
- [ ] `pending-T02`
- **Depends on:** T01
- **Commit:** `feat(native): add the field-over-sheet screen scaffold`
- **Done when:** a `<Screen>` takes a field height and renders status bar
  (54px), field, seam, content column (padding `0 26px`) and home-indicator zone
  (34px) at the design's exact metrics, and safe-area insets are handled without
  changing those metrics on a 390×844 reference device.

## T03 — Header chrome
- [ ] `pending-T03`
- **Depends on:** T02
- **Commit:** `feat(native): add the screen header row`
- **Done when:** the 52px header row — round back button, uppercase breadcrumb,
  spacer, status chip — matches the Puzzle and Core Screens designs, and the
  back button is a real 46px target.

## T04 — Audit the scaffold against the designs, both themes
- [ ] `pending-T04`
- **Depends on:** T03
- **Commit:** `fix(native): correct scaffold deviations found in audit`
- **Done when:** every metric has been compared **on a device** against
  `designs/extracted`, in light AND dark, and each deviation is either fixed or
  written down here as a `Note (session N)`.
- **This is a separate, deliberate step. Do not skip it because you were
  careful.** In the project this workflow came from, a session that had followed
  the designs closely still had five real deviations — including a wrong
  background on the most important screen.
