import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * The Garden — paid pack, 30 puzzles.
 *
 * One of the richest themes available in ordinary vocabulary: tools, plants,
 * weather, seasons and the jobs themselves all belong to the same room, which
 * is what gets a pool past 190 without reaching for obscurity.
 */
export const theGarden: Theme = {
  id: "the-garden",
  name: "The Garden",
  phrases: [
    "Give it time",          // 11
    "Everything grows",      // 15
    "Wait for spring",       // 13
    "Slow and green",        // 12
    "Under the soil",        // 12
    "Left to itself",        // 12
    "After the rain",        // 12
    "Worth the wait",        // 12
    "Quiet work",            // 9
    "It comes back",         // 11
  ],
  words: pool(
    // tools and kit
    "SPADE","TROWEL","RAKE","SHEARS","PRUNER","MOWER","HOSE","GLOVES","TWINE",
    "STAKE","CANE","BASKET","PLANTER","TRAY","SIEVE","BUCKET","LADDER",
    "DIBBER","BROOM","WHEEL","BARROW","STRING","LABEL","NETTING","CLOCHE",
    // ground and growing
    "SEEDS","BULBS","COMPOST","MULCH","GRAVEL","SOIL","LOAM","PEAT","SAND",
    "ROOT","STEM","LEAF","BLOOM","PETAL","THORN","BRANCH","TWIG","BARK","SHOOT",
    "BUDS","SEEDLING","CUTTING","GRAFT","RUNNER","TUBER","CORM","SPORE","POLLEN",
    // the plot
    "HEDGE","LAWN","BORDER","PATH","GATE","FENCE","TRELLIS","ARCH","POND",
    "BENCH","SHED","FRAME","WALL","STEPS","TERRACE","ROCKERY","MEADOW","ORCHARD",
    "PLOT","PATCH","BED","EDGE","CORNER","GREEN",
    // weather and time
    "WATER","SHADE","FROST","RAIN","SUNSHINE","BREEZE","MIST","THAW","DROUGHT",
    "SEASON","SPRING","SUMMER","AUTUMN","WINTER","EVENING","SHOWER",
    // the work
    "HARVEST","SOWING","PRUNING","WEEDING","DIGGING","RAKING","PLANTING",
    "GROWING","TRIMMING","WATERING","POTTING","MOWING","FEEDING","MULCHING",
    "PICKING","TENDING","CLIPPING","THINNING",
    // flowers
    "FLOWER","TULIP","DAISY","ROSE","LILY","POPPY","PANSY","VIOLET","IRIS",
    "PEONY","DAHLIA","ASTER","CROCUS","ORCHID","FUCHSIA","LUPIN","PHLOX",
    "SALVIA","AZALEA","CAMELLIA","JASMINE","LILAC","WISTERIA","CLEMATIS",
    "PRIMROSE","SNOWDROP","BLUEBELL","FOXGLOVE","MARIGOLD","LAVENDER",
    // herbs
    "THYME","BASIL","MINT","SAGE","PARSLEY","CHIVES","ROSEMARY","FENNEL",
    "SORREL","DILL","OREGANO","TARRAGON","BORAGE",
    // crops
    "APPLE","PEAR","PLUM","CHERRY","BERRY","CURRANT","RHUBARB","MARROW",
    "BEAN","PEAS","ONION","LEEK","CARROT","TURNIP","RADISH","POTATO",
    "PARSNIP","CABBAGE","LETTUCE","SPINACH","CELERY","TOMATO","PUMPKIN",
    "SQUASH","GARLIC","SHALLOT","SPROUT","KALE","CRESS","CHARD",
    // wildlife
    "BEE","WASP","MOTH","SNAIL","WORM","BEETLE","SPIDER","THRUSH","ROBIN",
    "SPARROW","BLACKBIRD","HEDGEHOG","BUTTERFLY","LADYBIRD","DRAGONFLY",
    "SQUIRREL","FROG","NEWT","MOUSE","FOX",
  ),
};

export const theGardenTitles = titles(
  [
    "Everything out here is {}.",
    "It has all gone {}.",
    "Nothing to do but wait, and {}.",
    "The whole plot smells {}.",
    "Somebody has been out here {}.",
    "Give it a week and it will be {}.",
    "You can hear it {}.",
    "Leave it {} a season.",
  ],
  ["green","waking","busy","quiet","early","late","damp","settling"],
  [
    "The kettle can wait.",
    "Boots by the back door.",
    "It rained overnight.",
    "Nothing here is in a hurry.",
    "The light goes first behind the wall.",
    "Something has been at the leaves.",
    "You planted this years ago.",
    "Sunday, and nobody is looking.",
    "It will all need doing again.",
    "The birds got there first.",
  ],
);
