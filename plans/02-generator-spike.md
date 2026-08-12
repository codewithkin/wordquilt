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
- [ ] `pending-T04`
- **Depends on:** T03
- **Commit:** `test(generator): measure yield across grid sizes`
- **Done when:** we have real numbers, not impressions:
  - success rate and median attempts for 6×6/6 words through 9×9/10 words
  - **can a 200-word themed pool actually yield 50 distinct puzzles?**
  - how the rate degrades as the pool shrinks
- **This answers whether packs are 50 puzzles or 30.** Report the numbers to the
  owner before building anything on top.

## T05 — Vocabulary rules as enforceable checks
- [ ] `pending-T05`
- **Commit:** `feat(generator): enforce the vocabulary rules`
- **Done when:** the rules from the handover are checks, not intentions:
  - no word repeats inside a pack
  - no word appears in more than two packs total
  - every word falls within roughly the top 30,000 lemmas
  - British/American spellings locked per locale, not accepted inconsistently
- **Note:** the handover names vocabulary as the real launch risk — 3,000 word
  placements at launch, and the most engaged players are the ones who notice
  repetition. These need to be machine-checked; hand-checking 3,000 placements
  will not hold.
