import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * Birds — paid pack, 30 puzzles.
 *
 * Garden and common British birds, plus what they do and where they live.
 * Deliberately not a twitcher's list: every species here is one an ordinary
 * person could name, because difficulty comes from the grid, never from
 * vocabulary.
 */
export const birds: Theme = {
  id: "birds",
  name: "Birds",
  phrases: [
    "Before the light",      // 14
    "Up in the eaves",       // 12
    "Gone by winter",        // 13
    "Listen a moment",       // 14
    "First one up",          // 10
    "All morning",           // 10
    "Something sings",       // 14
    "Out of nowhere",        // 13
    "Back again",            // 9
    "Gone off south",        // 12
  ],
  words: pool(
    // common birds
    "ROBIN","SPARROW","BLACKBIRD","THRUSH","STARLING","WREN","FINCH","TIT",
    "MAGPIE","CROW","ROOK","RAVEN","JACKDAW","JAY","PIGEON","DOVE","SWALLOW",
    "SWIFT","MARTIN","CUCKOO","WOODPECKER","NUTHATCH","TREECREEPER","WAGTAIL",
    "DUNNOCK","GOLDFINCH","GREENFINCH","BULLFINCH","CHAFFINCH","LINNET",
    "SISKIN","REDWING","FIELDFARE","WAXWING","PIPIT","LARK","SKYLARK",
    "NIGHTINGALE","WARBLER","CHIFFCHAFF","BLACKCAP","FLYCATCHER","SHRIKE",
    // water and coast
    "DUCK","GOOSE","SWAN","HERON","EGRET","MOORHEN","COOT","GREBE","DIPPER",
    "KINGFISHER","CURLEW","LAPWING","PLOVER","SNIPE","REDSHANK","SANDPIPER",
    "GULL","TERN","PUFFIN","GANNET","CORMORANT","SHAG","MALLARD","TEAL",
    "WIGEON","SHELDUCK","POCHARD","GOLDENEYE",
    // birds of prey and larger
    "OWL","HAWK","FALCON","KESTREL","BUZZARD","HARRIER","MERLIN","OSPREY",
    "EAGLE","KITE","SPARROWHAWK","PHEASANT","PARTRIDGE","GROUSE","QUAIL",
    "PEACOCK","HERON","STORK","CRANE",
    // parts
    "WING","FEATHER","BEAK","BILL","CLAW","TALON","CREST","PLUMAGE","DOWN",
    "TAIL","BREAST","THROAT","QUILL","WINGSPAN","PRIMARY","MOULT",
    // nests and homes
    "NEST","EGG","CLUTCH","BROOD","CHICK","FLEDGLING","NESTLING","HATCHING",
    "BURROW","HOLLOW","ROOST","PERCH","BRANCH","HEDGE","THICKET","REEDBED",
    "EAVES","CHIMNEY","BOX","LEDGE","CLIFF","COPSE","WOODLAND","MEADOW",
    // doings
    "SINGING","CALLING","NESTING","FEEDING","PREENING","SOARING","GLIDING",
    "DIVING","WADING","PERCHING","HOVERING","FLOCKING","MIGRATING","ROOSTING",
    "PECKING","BATHING","FLUTTER","SWOOPING","CIRCLING","LANDING",
    // sound and season
    "SONG","CHORUS","WHISTLE","TRILL","CHIRP","CAWING","HOOTING","DAWN",
    "DUSK","SPRING","SUMMER","AUTUMN","WINTER","MORNING",
    // what a person brings
    "FEEDER","SEED","SUET","PEANUT","CRUMB","WATER","BATH",
    "BINOCULARS","NOTEBOOK","WINDOW","GARDEN","HIDE","FIELD","PATH",
    "MIGRATION","FLOCK","MURMURATION","COLONY","PAIR",
  ),
};

export const birdsTitles = titles(
  [
    "Something out there is {}.",
    "The whole hedge is {}.",
    "It started before it was {}.",
    "They have been at it since {}.",
    "You can hear them {}.",
    "By evening they will be {}.",
    "Nothing here stays {}.",
    "Leave the window {} a while.",
  ],
  ["awake","loud","busy","early","hidden","light","gone","open"],
  [
    "Four in the morning, apparently.",
    "Something has emptied the feeder.",
    "It only sings when you stop looking.",
    "They took the whole hedge over.",
    "Same one, same branch, every day.",
    "Gone the moment you fetch the binoculars.",
    "The cat has given up.",
    "Louder than the traffic.",
    "It was here before the houses were.",
    "They will be back in March.",
  ],
);
