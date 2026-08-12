# Motion

Implemented with **Moti** (on Reanimated). Values and helpers live in
`apps/native/lib/motion.ts`.

---

## The governing rule

**Motion in WordQuilt is material, not decorative.** Things are stitched,
pressed and laid down. They do not slide in from offscreen, bounce, spin, or
draw attention to themselves.

The product exists to give someone five quiet minutes that ask nothing of them.
An animation that reads as "an app being clever" is wrong here no matter how
well it is executed. When in doubt, less.

**Nothing animates on the Puzzle screen except in direct response to the
player's own finger.** That is constraint 7 — zero interruption budget — and it
applies to motion as much as to modals.

---

## Where the spec comes from

The design files describe motion mostly by describing its **removal**, on the
reduced-motion screen (`Accessibility`, X3):

> "Tile tilt is removed, so patches sit square. The lock animation becomes an
> instant state change with a 120ms cross-fade, the Reveal resolves all leftover
> letters in one step, and the sew-in on the Shelf does not animate."

Read forwards, that is the spec. There is a lock animation when a word is found,
the Reveal resolves leftover letters progressively in reading order, and the
Shelf sews a square in. The Reveal caption gives the shape of the payoff:

> "The three-second hold: the sheet drops away, unused letters resolve in
> reading order as cream patches, found words recede into the field. No controls
> until the hold ends and the square sews in."

Anything not traceable to a design caption is an invention — keep those few,
and record them here.

---

## The vocabulary

| Gesture | Where | What it is |
| --- | --- | --- |
| **Press** | Any lifted control | Travels down by exactly its own edge depth, and the shadow collapses in step. At full press the edge is gone and it is flat on the page. 90ms. |
| **Stitch** | Word lock, tile sew, square sew-in | A short spring that settles rather than wobbles (damping 18, stiffness 220). Things are sewn down. |
| **Lay down** | Card and row entry | A 10px rise and a fade. No slide from offscreen. 260ms, staggered ~45ms per row. |
| **Resolve** | Reveal | Leftover letters come forward in reading order, 40ms apart. |
| **Recede** | Reveal | Letters that belonged to found words drop to 38% and lose their ground. |

### The press gesture is the important one

The elevation in this design is a hard offset edge that reads as material
thickness. Pressing a control sits it **down onto that edge** — the same gesture
as the elevation itself. An opacity fade instead reads as a web button and
throws away the material.

The one exception: `RoundButton` on the terracotta field has no edge to
compress into, so it dims. That is the only place opacity is the press feedback.

---

## Reduced motion is not optional

Reduced motion is a **designed screen** here, with the app's own switch
overriding the OS only where the OS has an opinion. Every animated component
calls `useMotion()` and degrades — it does not skip the state change. A player
with reduced motion still has to see that a word locked in.

```
motion.ms(n)      -> 120ms when reduced
motion.stagger()  -> 0 when reduced ("resolves in one step")
motion.stitch     -> a 120ms timing when reduced
motion.tilt(deg)  -> 0 when reduced ("patches sit square")
```

Note that the **tile tilt** is removed under reduced motion even though it is
static texture rather than animation. The design says so by name: a dense
tilted grid reads as unstable to some players.

---

## Timings

```
press      90ms     contact
reduced   120ms     the substitute for everything, stated in the design
lock      220ms     a tile locking into a found word
enter     260ms     card / row entry
sew       420ms     a square sewing into the quilt
sheetDrop 520ms     the sheet dropping away at the start of the Reveal

revealHold   3000ms  minimum hold before ANY control appears
revealStagger  40ms  between leftover letters resolving
```

**The 3-second Reveal hold is a floor, not a target.** The reveal is the entire
product. Letting a button appear over it to hurry the player along would undo
the one moment everything else exists to produce.
