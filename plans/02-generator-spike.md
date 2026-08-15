# 02 — The generator spike

**Do this before any screen work.** The handover's own recommended next step.

A few hours proves whether the backtracking packer can reliably produce grids
with exact leftover-letter counts. Everything downstream depends on the answer:
content budget, pack pricing, launch library size, and whether packs are 50
puzzles or 30.

Pure logic, no design dependency — so it can proceed while the seam (D-006) is
still open.

---

## The constraint that makes this hard

The binding constraint is arithmetic, not search. Leftover cells must **exactly**
equal the theme phrase length:

```
(rows × cols) − (sum of the lengths of the placed words) = length of the theme phrase
```

So word sets are selected to hit an exact letter total **before** packing begins.
The packer then has to place that specific set along snaking paths through
orthogonally and diagonally adjacent cells, with no cell reused within a trace.

A packer that "usually works" is not enough: every puzzle in a 50-puzzle pack
has to land, or the pack is short.

---

## T01 — Word-set selection by exact letter total
- [ ] `pending-T01`
- **Commit:** `feat(generator): select word sets hitting an exact letter total`
- **Touches:** `packages/generator/src/select.ts`
- **Done when:** given a themed pool and a target total, it returns candidate
  sets hitting the total exactly, or reports that none exist — and a test
  covers the "none exist" branch, which is the one that will actually bite.

## T02 — Backtracking path packer
- [ ] `pending-T02`
- **Depends on:** T01
- **Commit:** `feat(generator): pack words along snaking adjacent paths`
- **Touches:** `packages/generator/src/pack.ts`
- **Done when:** it places a given word set into an N×N grid along
  orthogonally/diagonally adjacent paths with no cell reused within a word, and
  returns the leftover cells in reading order.

## T03 — Fill leftover cells with the theme phrase
- [ ] `pending-T03`
- **Depends on:** T02
- **Commit:** `feat(generator): resolve leftover cells to the theme phrase`
- **Done when:** leftover cells in reading order spell the theme phrase exactly,
  asserted on generated output rather than by construction.

## T04 — Measure the success rate. THIS IS THE SPIKE.
- [x] `see progress/03-generator-spike.md`
- **Depends on:** T03
- **Commit:** `test(generator): measure yield across grid sizes`
- **Done when:** we have real numbers, not impressions:
  - success rate and median attempts for 6×6/6 words through 9×9/10 words
  - **can a 200-word themed pool actually yield 50 distinct puzzles?**
  - how the rate degrades as the pool shrinks
- **ANSWERED: 30.** At 30 a ~190-word pool builds 30/30 with no word used twice;
  at 50 the same pool manages 36/50. Full results and the two bugs it found in
  `progress/03-generator-spike.md`. See D-025, D-026, D-027, D-028.

## T05 — Vocabulary rules as enforceable checks
- [x] `pnpm check:vocabulary` — `packages/generator/bench/vocabulary.mjs`
- **Commit:** `feat(generator): add five themed packs and the vocabulary linter`
- **DONE.** The rules are checks and the check exits 1:
  - no duplicates inside a pool, plain A–Z only
  - **no word in more than two packs** — found 20 violations across the seven
    pools on its first run; each shared word now keeps the two packs it belongs
    to most
  - no word used more than twice within a pack
  - enough usable 4–9 letter words for the pack size
  - 8+ phrases each 9–15 letters (D-028), a title bank that outruns the pack
  - **every pack builds its full run and every puzzle resolves to its theme**,
    seeded exactly as the app seeds it, with no repeated oblique title
- **Not covered:** "top 30,000 lemmas" and locale-locking are still authored by
  hand. Both need a word list to check against; the length window and the
  A–Z rule catch the shapes that actually break the packer.
