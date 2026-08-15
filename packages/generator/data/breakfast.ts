import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * Breakfast — FREE pack, 25 puzzles.
 *
 * The first of the two free themes, and the one the cold open draws from. It
 * shares its subject with `morning-ritual` (which is only the four-word
 * onboarding board) but carries a full pool of its own.
 */
export const breakfast: Theme = {
  id: "breakfast",
  name: "Breakfast",
  phrases: [
    "Before the rest",       // 13
    "First thing",           // 10
    "Still dark out",        // 12
    "One more slice",        // 12
    "Nobody else up",        // 12
    "Slowly does it",        // 12
    "Warm and quiet",        // 12
    "The good mug",          // 10
    "Sunday sort of",        // 13
    "Take your time",        // 12
  ],
  words: pool(
    "TOAST","BREAD","CRUST","SLICE","LOAF","ROLL","BAGEL","MUFFIN","CRUMPET",
    "SCONE","PANCAKE","WAFFLE","CROISSANT","PASTRY","BRIOCHE","TEACAKE",
    "BUTTER","MARGARINE","JAM","MARMALADE","HONEY","SYRUP","SPREAD","CURD",
    "CEREAL","MUESLI","GRANOLA","PORRIDGE","OATMEAL","FLAKES","BRAN","OATS",
    "MILK","CREAM","YOGHURT","JUICE","ORANGE","APPLE","BANANA","BERRY",
    "COFFEE","TEA","KETTLE","TEAPOT","CAFETIERE","GRINDER","BEANS","LEAVES",
    "SUGAR","SWEETENER","MUG","CUP","SAUCER","GLASS","BOWL","PLATE","SPOON",
    "FORK","KNIFE","NAPKIN","TRAY","TOASTER","GRILL","PAN","SKILLET",
    "EGGS","YOLK","WHITE","OMELETTE","SCRAMBLE","POACHED","BOILED","FRIED",
    "BACON","SAUSAGE","MUSHROOM","TOMATO","BEANS","HASH","POTATO","BLACK",
    "PEPPER","SAUCE","KETCHUP","MUSTARD","VINEGAR","OIL","HERB",
    "CHEESE","HAM","SMOKED","SALMON","AVOCADO","SPINACH","ONION","CHIVE",
    "MORNING","SUNRISE","EARLY","QUIET","KITCHEN","TABLE","CHAIR",
    "CURTAIN","LIGHT","WARMTH","AROMA","CRUMBS","SPILL",
    "RADIO","PAPER","POST","LETTER","PHONE","CLOCK","ALARM","SLIPPER",
    "DRESSING","GOWN","APRON","TOWEL","CLOTH","SPONGE","SINK","TAP",
    "FRIDGE","CUPBOARD","JAR","TIN","PACKET","CARTON","BOTTLE",
    "WEEKDAY","WEEKEND","SUNDAY","MONDAY","HOLIDAY","ROUTINE","RITUAL",
    "TOASTING","BREWING","POURING","STIRRING","SPREADING","SLICING",
    "BOILING","FRYING","BAKING","WHISKING","WARMING","SITTING","READING",
    "LISTENING","WAITING","SHARING","LINGERING","WAKING","YAWNING",
    "SECONDS","REFILL","PORTION","HELPING","MOUTHFUL","BITE","SIP","TASTE",
  ),
};

export const breakfastTitles = titles(
  [
    "Everything in here is {}.",
    "It always starts {}.",
    "Nobody else is {} yet.",
    "The whole room smells {}.",
    "Somebody has been {}.",
    "You can hear it {}.",
    "Give it a minute and it will be {}.",
    "Leave it {} a moment.",
  ],
  ["warm","early","quiet","awake","ready","brewing","waiting","slow"],
  [
    "The window has gone foggy.",
    "Someone put the light on.",
    "Six o'clock and the radio is on.",
    "Sunday takes the longest.",
    "Nobody has sat down yet.",
    "The good mug was already out.",
    "It went cold while you read.",
    "There is one slice left.",
    "The cat wants some.",
    "Nothing has to happen for an hour.",
  ],
);
