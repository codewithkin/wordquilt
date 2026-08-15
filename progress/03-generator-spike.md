# The generator spike — results

Run it yourself: `node packages/generator/bench/yield.mjs`

Measured against the real "Kitchen Things" pool (187 words, 10 phrases), which
the handover names as the theme that reaches a large pool comfortably. **Treat
these as a ceiling, not an average** — a thinner theme does worse.

---

## The answer: 30 puzzles per pack, not 50

| Pack size | Pool | Built | Distinct words used | Max uses of one word |
| --- | --- | --- | --- | --- |
| **30** | 187 | **30/30 (100%)** | 125 | 2 |
| 50 | 187 | 36/50 (72%) | 138 | 2 |

At 30, a ~190-word pool produces a complete pack with no word appearing more
than twice. At 50 the pool starves — it is not the packer failing, it is the
vocabulary running out.

### What 50 would cost

| Pool | 30 puzzles | 50 puzzles |
| --- | --- | --- |
| 80 | 57% | 34% |
| 120 | 87% | 50% |
| 160 | 97% | 64% |
| 187 | **100%** | 72% |

Extrapolating the curve, 50 puzzles needs roughly **280–300 words per theme** to
build reliably. That is about 50% more curation per pack, on the work the
handover already identifies as the real launch risk.

**Recommendation: 30-puzzle packs.** Same price, ~190 words per theme, and the
launch library becomes 6 free themes × 20 + 5 packs × 30 = **270 puzzles**
instead of 370. Content cadence stays one pack a month and gets easier to hold.

---

## Two bugs the spike found, both now fixed

### 6×6 with six words is arithmetically impossible

It failed **100% of the time**. 36 cells minus a 9–20 letter phrase leaves about
27 letters for six words, but six words with at most two short ones needs
`4+5+6+6+6+6 = 33`. It could never have worked.

Fixed: the ramp's first rung is now **6×6 with five words** (`4+5+6+6+6 = 27`).
Success went 0% → 100%. The board still reads as a full puzzle.

### The selector converged on a handful of words

With no usage budget it used only **94 distinct words across 50 puzzles, with
one word appearing nine times** — exactly the repetition the handover says the
most engaged players notice. It was not random: the selector gravitates to
whichever words happen to fit the arithmetic.

Fixed: `maxUsesPerWord` (default 2, matching the handover's cross-pack rule).
Distinct words used went 94 → 138, and no word now appears more than twice.

---

## Success rate by grid size

All 100%, and every generated puzzle resolves to its theme.

| Grid | Words | Success | Avg word length | Resolves | Median attempts |
| --- | --- | --- | --- | --- | --- |
| 6×6 | 5 | 100% | 5.4 | 100% | 6 |
| 7×7 | 7 | 100% | 5.6 | 100% | 4 |
| 8×8 | 8 | 100% | 6.1 | 100% | 1 |
| 8×8 | 9 | 100% | 5.8 | 100% | 2 |
| 9×9 | 10 | 100% | 6.5 | 100% | 1 |

The design's own reference board averages 5.5 letters, so these sit right.

---

## Phrase length trades directly against word quality

Grid area is fixed, so every letter the theme phrase takes is a letter the words
cannot have. At 8×8 with 8 words:

| Phrase | Letters | Cells left for words | Avg word length |
| --- | --- | --- | --- |
| "Still warm" | 9 | 55 | **6.9** |
| "Nearly ready" | 11 | 53 | 6.6 |
| "A place to gather" | 14 | 50 | 6.3 |
| "Something's brewing" | 17 | 47 | 5.9 |
| "Everything in its place" | 20 | 44 | **5.5** |

**Author theme phrases at 9–15 letters.** Beyond ~18 the words get noticeably
shorter, and short words are what make a word search feel thin.

Every phrase succeeded 100% of the time, so this is a quality lever, not a
feasibility one.

---

## What this means for authoring a theme

Per 30-puzzle pack:

- **~190 words**, all within roughly the top 30,000 lemmas, 4–9 letters
- **8–12 theme phrases**, each 9–15 letters
- **A title bank of 40+** distinct oblique titles — the current Kitchen Things
  bank yields 74 from 8 frames × 8 fillers + 10 standalone lines, which is
  comfortable. Check with `bankCapacity()` before writing fifty of anything.

The word count matters more than it looks: 190 is reachable for "Kitchen
Things", "Breakfast" or "The Garden". It is not reachable for "Rain", which is
why the handover already demoted that one to a 20-puzzle free theme.
