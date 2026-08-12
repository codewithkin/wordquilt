# systems — the why, and the rules that span screens

A design file tells you what one screen looks like. These documents tell you
what is true across all of them, and why.

| Doc | Holds |
| --- | --- |
| `01-architecture.md` | Monorepo shape, what lives where, the token layer |
| `02-design-system.md` | The palette, elevation, type and grid, and their rules |
| `09-decisions.md` | Numbered, immutable decisions. Cite them by number in code |

---

## The precedence ladder

When two sources disagree, the higher one wins.

| Rank | Source | Authority |
| --- | --- | --- |
| 1 | `designs/extracted/*` | What a screen **looks like** |
| 2 | `systems/*` | **Why**, and rules that no single screen can express |
| 3 | `packages/tokens` | A convenience for values the designs share |
| 4 | Anything else | Nothing |

Where 1 and 2 disagree about an **appearance**, 1 wins.
Where they disagree about a **behaviour** that no single screen can express —
"never show a countdown", "no red anywhere" — 2 wins.

### The three rules that make this real

1. **Open the design file for the screen you are building. Every time.**
   Do not build from `packages/tokens`. Tokens are downstream and are allowed to
   be incomplete; the designs are not. Read
   `designs/extracted/<Screen>.txt` — it is sorted `path = value`, so grep it.

2. **Read the captions.** Every screen in the design carries a `capState`
   describing what state it shows and, often, why. The markup says what it looks
   like; the caption says what it means. A caption will sometimes overrule a
   written spec, and it should.

3. **Register exceptions, never assume them.** When a design and a systems doc
   genuinely conflict, stop and ask. Then write the decision into
   `09-decisions.md` so it is not re-litigated.

---

## Registered exceptions

Every place where something other than the design file was followed.
Keep this list short and complete.

| # | What the design says | What we do | Why |
| --- | --- | --- | --- |
| D-007 | `Puzzle & Reveal` draws the seam 48px above the field's base | 40px | Three of four design files use 40, across every field height they draw. The Puzzle file was drawn first and drifted. |
| D-005 | `Accessibility` uses a higher-contrast `muted` | Both are tokens | The core screens specify `#7A6E5C`; the a11y file specifies `#6A5F4E`. Shipping both lets the high-contrast setting swap without changing the default. |
| D-008 | Design manifest names a 13px `kicker` type role | Not in the token layer | It appears only in the website and design-canvas chrome, neither in launch scope. Its name would also collide with the `kicker` **colour**, which is used in-app. |

---

## The starting point for a new session

`progress/00-START-HERE.md`. It is rewritten every session and is
self-contained. Read it before this file.
