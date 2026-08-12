# Roadmap

Ordered by what unblocks the most. Each area is its own plan file, and each
todo is one commit.

| # | Area | Plan | State |
| --- | --- | --- | --- |
| 01 | Foundation — tokens, primitives, assets, checks | `01-foundation.md` | **done (session 1)** |
| 02 | The generator spike — can the packer do it? | `02-generator-spike.md` | not started |
| 03 | Screen scaffold — the seam, field/sheet, status chrome | `03-screen-scaffold.md` | not started |
| 04 | Puzzle + Reveal — the core loop | not written | blocked on 02, 03 |
| 05 | Shelf, Pack view | not written | blocked on 03 |
| 06 | Onboarding — 9 screens | not written | blocked on 04 |
| 07 | Store, The Wall, Fabric | not written | blocked on 05 |
| 08 | Daily calendar, Settings | not written | blocked on 05 |
| 09 | Alternate states, accessibility modes | not written | blocked on 04–08 |
| 10 | Store listings, submission | not written | blocked on D-011 |

---

## Why this order

**The generator spike comes before any screen work.** The handover is explicit
about it: a few hours proves whether the backtracking packer can reliably
produce 8×8 snaking-path grids with exact leftover-letter counts. Everything
downstream — content budget, pack pricing, launch library size, whether packs
are 50 puzzles or 30 — depends on that answer. Building the Puzzle screen first
means building it against a puzzle format that might not be producible.

It is also pure logic with no design dependency, so it can proceed while the
seam question (D-006) is still open.

**The seam blocks every screen.** Shelf, Puzzle, Pack and most of Onboarding all
sit on the field-over-sheet scaffold, and the seam is its defining edge. Solving
it once in `03-screen-scaffold` unblocks all of them; guessing at it means
rebuilding every screen when it is solved properly.

---

## Explicitly out of launch scope

- `apps/web` and the website designs. Kept, not built. A marketing site with no
  traffic source is wasted effort at launch; the store listing does that job.
- Cloud sync. If it stays out of v1, reinstall data loss must be stated plainly
  in Settings rather than discovered by players. **Still open.**

---

## The four open product questions

From the handover, unchanged. Three of them affect work in this roadmap.

1. **Oblique titles** — authored per puzzle (~370 lines of editorial at launch,
   +50/month) or generated per theme with variation? Affects the Puzzle screen
   and the content budget.
2. **Quilt scope** — one continuous quilt across all packs, or one per pack?
   Continuous is more emotionally powerful but unwieldy past ~300 squares.
   Affects the Shelf.
3. **Cloud sync in v1** — in or out?
4. **Alternate input mode** — tap-first-cell then tap-last-cell, for
   accessibility. Needs a rule for grids where multiple valid paths exist
   between two cells.

None of these block the generator spike.
