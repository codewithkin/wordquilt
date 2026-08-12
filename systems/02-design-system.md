# The design system

Everything here was read out of `designs/extracted`, not invented. Where a
value is stated, it is the value the design draws.

---

## Grounds — there are three, not one

The single most common way to get a WordQuilt screen wrong is to treat it as
"a background and some cards". It has three grounds, and each carries its own
ink, its own hairline, and its own elevation colour.

| Ground | Light | Dark | Ink on it | Hairline | Edge colour |
| --- | --- | --- | --- | --- | --- |
| **field** — the terracotta band | `#C25A34` | `#8A3E27` | `field-ink` | `field-line` | `field-edge` |
| **sheet** — the cream page | `#FBF4E4` | `#1E1B16` | `ink` / `muted` | `empty` | `shade` |
| **tile** — cards and letter tiles | `#FFFDF6` | `#2C2721` | `ink` | `line` | `shade` |

Every component states which ground it expects. `RoundButton` has a `ground`
prop for exactly this reason: the field variant is translucent with no lift, and
using it on the sheet gives you an invisible button.

### Two dark-mode traps

- **`shade` is not `ink`.** In light both are `#241F19`. In dark, `ink` is
  `#F4EDDF` and `shade` is `#0E0C09` — the elevation moves *away* from the text
  colour. If `shade` tracked `ink`, every card would glow instead of sit. The
  token test asserts `shade` is darker than the sheet.
- **`field-edge` is not `shade`.** On terracotta, near-black reads as a hole
  punched through the band, so controls on the field take a warm scrim
  (`rgba(36,23,16,0.55)`) instead.

Dark mode is a separate design, not an inversion. Every value was re-picked.

---

## Elevation — one language, held everywhere

A hard, **un-blurred** offset edge below the element, in the ink colour, with
no spread and no fade. It reads as material thickness — a stitched patch lying
on cloth.

A census of every `boxShadow` across all seven design files returns only:

```
0 3px 0 <edge>    chips, word slots, price pills, the round ink button
0 4px 0 <edge>    letter tiles, footer pills
0 5px 0 <edge>    cards, the primary button
0 6px 0 <edge>    full-bleed sheets (design chrome and website only)
```

There is not one blurred shadow anywhere. Introducing one breaks the surface.
The token test fails any shadow token with a non-zero blur.

**The border and the offset are one gesture.** Everything that lifts also
carries a 2px border in the same edge colour. An offset without its border reads
as a generic drop shadow and the material disappears. That is why `Card`,
`Pill`, `Button` are components rather than a class people remember to add.

---

## Radii — named by role, not by a scale

The design does not use a geometric radius ramp. A letter tile is 15px and a
card is 22px because each was drawn at that size; snapping them to a shared
scale visibly changes both.

```
patch 1   xs 3   sm 4   tile 15   control 16   button 18
button-lg 20     card 22          frame 44     pill 999
```

## Control heights

```
chip 36   tile 44   round 46   pill 50   button 56   button-lg 64   listRow 66 (min)
```

**44px is the floor for anything interactive**, from the design brief. Chips sit
at 36 only because they are not tappable; if one becomes tappable it has to grow.

---

## Type

Two faces. Newsreader (display, **italic only**) for titles, oblique hints and
the theme reveal — the voice. Nunito for everything else — the workhorse.

IBM Plex Sans appears in the design files as chrome for the design canvas
itself. It is not part of the app.

Roles carry family + size + line-height + tracking together, because in this
design they always travel together. Roles set **type only, not colour** — the
same `body` role is `text-ink` on the sheet and `text-field-ink` on the field.

```
themeReveal  42 display-italic 1.14     the theme phrase on Reveal
pageTitle    36 display-italic 1.06
oblique      31 display-italic 1.18     the hint shown during play
letter       21 ui-extrabold .01em      a letter on the grid
buttonLg     20 ui-black                Puzzle / Reveal
button       19 ui-black
listTitle    17 ui-extrabold
body         15 ui-semibold 1.5
crumb        15 ui-extrabold .1em UPPER
hintBand     15 ui-extrabold            the reserved band under the grid
meta         14 ui-semibold 1.4
chip         14 ui-extrabold
wordChip     14 ui-black .08em
sectionLabel 12 ui-black .16em UPPER    also the in-app "kicker"
```

Body copy never goes below 15px.

---

## The puzzle grid

```
pitch 46    cell 44    pad 7    svgSize 320    boxWidth 334
```

Tiles are **absolutely positioned**, not flex + gap: each carries a ±1.4°
rotation so the board reads as hand-sewn, and rotated tiles in a flex row clip
each other at the gaps. Position is `left = col*pitch + pad`, `top = row*pitch`.

The tilt is deterministic from the cell's position — `((row*7 + col) % 5 - 2) * 0.7`.
The 7 is a hash multiplier, not the row length; it stays 7 for every grid size
from 6×6 to 9×9. A board that re-tilts on render reads as a rendering fault.

The thread along a found word: 5px stroke, `9 8` dash, round caps, `thread` colour.

---

## The screen scaffold

All four screen design files use exactly this, so a screen that does not sit
inside it is wrong:

```
0    ── status bar, 54px, padding 0 30px 8px
54   ── content column, 756px, padding 0 26px
810  ── home indicator zone, 34px
844
```

The **seam**: the cream sheet curves up over the terracotta field as a wide
shallow ellipse — `left: -8%`, `width: 116%`, `border-top-radius: 50% 74px`,
sitting 40px above the field's base.

**React Native does not support elliptical corner radii.** The seam cannot be
built with `borderRadius` on a View; it needs an SVG path or a mask. This is the
biggest design-to-native gap in the product (D-006) and is unsolved. Do not
approximate it with a circular radius — the curve is 4× wider than it is tall
and a circular approximation is obviously wrong at a glance.

---

## Rules that are not about appearance

These come from the product's hard constraints and no single screen expresses
them.

- **No error colour exists.** Not in either theme, not named, not defined. The
  product never tells a player they got something wrong, so red has no job — and
  a red token existing is how it eventually gets used. The token test fails any
  token whose name matches error/danger/destructive/warning/fail.
- **No pure black, no pure white**, in either theme.
- **Nothing appears over the grid during play.** No modals, no toasts, no rating
  prompts, no purchase prompts. The band under the grid is reserved and stays
  empty in the default state so hint feedback never shifts the layout.
- **Nothing counts down.** Counts accumulate. No timers, no streaks, no
  "you missed a day", no red dots.
- **One accent per screen**, on the single action the player can take. Two
  accent buttons on one screen is a bug.
- **Dimmed means exactly one thing** wherever it appears. A locked pack reads as
  unstitched, not badged.
