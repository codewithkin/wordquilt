import type { Theme } from "../src/types.ts";
import type { TitleBank } from "../src/titles.ts";

/**
 * "Kitchen Things" — the theme the design files use, built out to a realistic
 * pool so the spike measures something real rather than a toy.
 *
 * The handover names this as the theme that reaches a large pool comfortably,
 * which makes it the right BEST CASE to measure. A theme that struggles here
 * ("Rain" became a 20-puzzle free theme for exactly this reason) will do worse,
 * so treat these numbers as a ceiling, not an average.
 *
 * Every word here is ordinary kitchen vocabulary — the rule is that difficulty
 * comes from grid size and path tangling, never from vocabulary obscurity.
 * Nothing in this list would send anyone to a dictionary.
 *
 * British/American: this pool is en-GB. Words that differ by locale are marked
 * in `LOCALE_SPLIT` below rather than being silently mixed.
 */

const WORDS = [
  // vessels and cookware
  "KETTLE", "TEAPOT", "SAUCER", "TEACUP", "MUG", "JUG", "POT", "PAN", "WOK",
  "SKILLET", "STOCKPOT", "CASSEROLE", "ROASTER", "STEAMER", "COLANDER",
  "SIEVE", "STRAINER", "BOWL", "PLATTER", "TUREEN", "RAMEKIN", "TRIVET",
  "CAULDRON", "SAUCEPAN", "GRIDDLE", "CRUET", "DECANTER", "CARAFE", "FLASK",
  "TUMBLER", "GOBLET", "PITCHER", "CANISTER", "CROCK", "URN",

  // tools
  "LADLE", "WHISK", "SPATULA", "TONGS", "PEELER", "GRATER", "MASHER",
  "SKEWER", "CORKSCREW", "OPENER", "SCOOP", "SIFTER", "ROLLINGPIN",
  "CLEAVER", "PARER", "SLICER", "MANDOLIN", "ZESTER", "JUICER", "PRESS",
  "TIMER", "SCALES", "THERMOMETER", "FUNNEL", "BASTER", "BRUSH", "SHEARS",
  "CORER", "PITTER", "REAMER", "SPIDER", "TURNER", "SCRAPER", "PADDLE",

  // cutlery and setting
  "SPOON", "FORK", "KNIFE", "TEASPOON", "CHOPSTICK", "NAPKIN", "COASTER",
  "PLACEMAT", "TABLECLOTH", "SALTCELLAR", "PEPPERMILL", "BUTTERDISH",

  // surfaces and storage
  "COUNTER", "WORKTOP", "CUPBOARD", "PANTRY", "LARDER", "SHELF", "DRAWER",
  "RACK", "HOOK", "CADDY", "BASKET", "CRATE", "BIN", "JAR", "TIN", "TUB",
  "CARTON", "PACKET", "SACHET", "WRAPPER", "LID", "CORK", "STOPPER",

  // appliances and fixtures
  "OVEN", "STOVE", "HOB", "GRILL", "TOASTER", "BLENDER", "MIXER", "FRIDGE",
  "FREEZER", "MICROWAVE", "DISHWASHER", "EXTRACTOR", "SINK", "TAP", "DRAIN",
  "PLUG", "SOCKET", "SWITCH", "TIMER", "GRINDER", "PROCESSOR", "WARMER",

  // linens and cleaning
  "APRON", "OVENGLOVE", "TEATOWEL", "DISHCLOTH", "SPONGE", "SCOURER",
  "DUSTER", "MOP", "BROOM", "BUCKET", "SOAP", "POLISH",

  // materials and surfaces
  "CHOPPINGBOARD", "BAKINGTRAY", "TIN", "PARCHMENT", "FOIL", "CLINGFILM",
  "MUSLIN", "TWINE", "GREASEPROOF",

  // pantry staples
  "FLOUR", "SUGAR", "SALT", "PEPPER", "YEAST", "VINEGAR", "TREACLE",
  "HONEY", "SYRUP", "OIL", "BUTTER", "CREAM", "MILK", "STOCK", "SPICE",
  "HERB", "MUSTARD", "PICKLE", "PRESERVE", "MARMALADE",

  // actions that belong to the room
  "SIMMER", "BOIL", "ROAST", "BAKE", "STEAM", "POACH", "BRAISE", "GRILL",
  "WHIP", "KNEAD", "PROVE", "CHOP", "DICE", "MINCE", "GRATE", "STIR",
  "FOLD", "SEASON", "GARNISH", "SERVE", "CHILL", "THAW", "DRAIN", "RINSE",
] as const;

/**
 * Words whose spelling differs between en-GB and en-US.
 *
 * Locked per locale, not accepted inconsistently — mixed spellings in one pack
 * is the kind of thing a reader with a literature degree notices immediately.
 * The en-US pack substitutes these rather than adding them.
 */
export const LOCALE_SPLIT: Record<string, { gb: string; us: string }> = {
  CLINGFILM: { gb: "CLINGFILM", us: "PLASTICWRAP" },
  TEATOWEL: { gb: "TEATOWEL", us: "DISHTOWEL" },
  HOB: { gb: "HOB", us: "COOKTOP" },
  WORKTOP: { gb: "WORKTOP", us: "COUNTERTOP" },
  GREASEPROOF: { gb: "GREASEPROOF", us: "WAXPAPER" },
  MANDOLIN: { gb: "MANDOLIN", us: "MANDOLINE" },
};

export const kitchenThings: Theme = {
  id: "kitchen-things",
  name: "Kitchen Things",
  phrases: [
    "Something's brewing",
    "Everything in its place",
    "The heart of the house",
    "Warm from the oven",
    "Where the kettle lives",
    "Mind the hot handle",
    "A place to gather",
    "Second helpings",
    "Still warm",
    "Nearly ready",
  ],
  // Deduplicated: the categories above overlap on purpose (TIN, TIMER, GRILL),
  // and a duplicate in the pool would let one word be selected twice.
  words: [...new Set(WORDS)],
};

/**
 * Oblique titles for this theme.
 *
 * None of these names a kitchen object, and none is the theme phrase. They
 * point at the FEELING of the room at a moment — which is the register the
 * design uses ("Before anyone else is up.").
 */
export const kitchenTitles: TitleBank = {
  frames: [
    "Before anyone else is {}.",
    "Everything here is {}.",
    "It always starts {}.",
    "Somebody has been {}.",
    "The whole room smells {}.",
    "Nothing much, just {}.",
    "You can hear it {}.",
    "Leave it {} a moment.",
  ],
  fillers: [
    "up",
    "awake",
    "warm",
    "waiting",
    "busy",
    "humming",
    "ready",
    "settling",
  ],
  standalone: [
    "The window has gone foggy.",
    "Someone put the light on.",
    "It is louder in here than anywhere else.",
    "Everything gets washed eventually.",
    "The good one lives at the back.",
    "Six o'clock and the radio is on.",
    "Sunday takes the longest.",
    "Nobody has sat down yet.",
    "There is a lid for all of it somewhere.",
    "The draining board is full again.",
  ],
};
