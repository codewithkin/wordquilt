import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * Books — paid pack, 30 puzzles.
 *
 * Reading as an activity and a room, not literary theory: the objects, the
 * places, the physical business of paper. That keeps the pool ordinary and
 * gets it past 190 without a single word anyone would need to look up.
 */
export const books: Theme = {
  id: "books",
  name: "Books",
  phrases: [
    "One more chapter",      // 14
    "Just to the end",       // 12
    "Where you left it",     // 14
    "Late again",            // 9
    "Somebody else's",       // 14
    "Long way in",           // 9
    "Nearly finished",       // 14
    "Keep going",            // 9
    "Out of print",          // 10
    "Second reading",        // 13
  ],
  words: pool(
    // the object
    "BOOK","NOVEL","VOLUME","PAGE","CHAPTER","PARAGRAPH","SENTENCE","WORD",
    "COVER","JACKET","SPINE","BINDING","STITCH","GLUE","BOARD","LEAF",
    "PAPER","PRINT","INK","TYPE","FONT","MARGIN","COLUMN","INDEX","APPENDIX",
    "PREFACE","EPILOGUE","CONTENTS","TITLE","BLURB","EDITION","REPRINT",
    "PAPERBACK","HARDBACK","BOOKMARK","RIBBON","DUSTJACKET","ENDPAPER",
    // places
    "LIBRARY","SHELF","STACK","CASE","TABLE","DESK","CHAIR","CORNER","ALCOVE",
    "READING","STUDY","ATTIC","BOOKSHOP","MARKET","STALL","BASEMENT","ARCHIVE",
    "COUNTER","TROLLEY","LAMP","CUSHION","BLANKET","SOFA",
    // people
    "READER","AUTHOR","WRITER","POET","EDITOR","PUBLISHER","PRINTER","BINDER",
    "CRITIC","LIBRARIAN","TRANSLATOR","ILLUSTRATOR","NARRATOR","CHARACTER",
    "HERO","VILLAIN","STRANGER","WITNESS","SUSPECT","DETECTIVE",
    // kinds
    "STORY","TALE","FABLE","MYTH","LEGEND","POEM","VERSE","ESSAY","DIARY",
    "JOURNAL","LETTER","MEMOIR","HISTORY","MYSTERY","ROMANCE","THRILLER",
    "COMEDY","TRAGEDY","EPIC","SAGA","SERIES","ANTHOLOGY","ALMANAC",
    "ATLAS","DICTIONARY","MANUAL","GUIDE","PRIMER","TEXTBOOK","CATALOGUE",
    // the reading
    "READING","TURNING","SKIMMING","BROWSING","BORROWING","LENDING","BUYING",
    "COLLECTING","SHELVING","RETURNING","FINISHING","STARTING","REREADING",
    "MARKING","QUOTING","WRITING","EDITING","PRINTING","BINDING","STUDYING",
    // texture and feeling
    "QUIET","HUSH","DUST","MUSTY","WORN","CREASED","FOXED","YELLOWED",
    "CRISP","THICK","SLIM","HEAVY","POCKET","BATTERED","PRISTINE","SIGNED",
    "BORROWED","OVERDUE","MISSING","FOUND","LOST","LOVED","FAVOURITE",
    // the tools
    "PENCIL","PEN","NOTE","SLIP","CARD","STAMP","LABEL","TICKET","RECEIPT",
    "GLASSES","TEA","BISCUIT","LAMPLIGHT","SILENCE","AFTERNOON",
    "EVENING","WEEKEND","HOLIDAY","JOURNEY","TRAIN","GARDEN",
  ),
};

export const booksTitles = titles(
  [
    "The whole room has gone {}.",
    "Somebody has left it {}.",
    "It was better the second time, and {}.",
    "You meant to stop, and now it is {}.",
    "Everything in here is {}.",
    "By the end of it you will be {}.",
    "Nothing here is in any {}.",
    "Leave it {} a day or two.",
  ],
  ["quiet","open","late","dusty","borrowed","unfinished","hurry","waiting"],
  [
    "Three pages and the tea went cold.",
    "Somebody dog-eared it. Unforgivable.",
    "It smells like a cupboard, in a good way.",
    "You have had this out since March.",
    "The last one is always the slowest.",
    "There is a train ticket at page ninety.",
    "You already know how it ends.",
    "The lamp is doing its best.",
    "Nobody has opened this in forty years.",
    "One more, then bed.",
  ],
);
