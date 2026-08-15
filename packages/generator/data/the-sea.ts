import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * The Sea — paid pack, 30 puzzles.
 *
 * Coast rather than open ocean: the shore, the boats, the weather and the
 * things a person actually sees from land. That framing is what keeps the
 * vocabulary ordinary — deep-sea nouns get obscure fast.
 */
export const theSea: Theme = {
  id: "the-sea",
  name: "The Sea",
  phrases: [
    "Out past the pier",     // 14
    "The tide turns",        // 12
    "Salt in the air",       // 12
    "Grey and wide",         // 11
    "Nothing but sky",       // 13
    "Miles of it",           // 9
    "Cold even now",         // 11
    "Watch the light",       // 13
    "Far side of it",        // 11
    "It never stops",        // 12
  ],
  words: pool(
    // water and shore
    "WAVE","TIDE","SURF","FOAM","SPRAY","SWELL","CURRENT","RIPPLE","BREAKER",
    "SHORE","BEACH","SAND","SHINGLE","PEBBLE","DUNE","CLIFF","COVE","BAY",
    "INLET","HEADLAND","POINT","REEF","ROCK","POOL","LAGOON","ESTUARY","DELTA",
    "HARBOUR","MARINA","JETTY","PIER","QUAY","SLIPWAY","BREAKWATER","GROYNE",
    "SEASHORE","SEAFRONT","SEASIDE","SEAWALL","SANDBAR","SANDBANK","SHALLOWS",
    "CHANNEL","MOORING","PONTOON","COASTAL","ONSHORE","SEAWARD","TIDAL","DEEP",
    // vessels
    "BOAT","SHIP","FERRY","YACHT","DINGHY","TRAWLER","TANKER","BARGE","CANOE",
    "KAYAK","RAFT","LINER","CUTTER","SLOOP","SKIFF","LAUNCH","TUGBOAT",
    "SAILBOAT","VOYAGE","CROSSING",
    // parts and gear
    "MAST","SAIL","RUDDER","KEEL","ANCHOR","ROPE","CABLE","WINCH","OARS",
    "PADDLE","DECK","CABIN","HULL","BOW","STERN","PORT","BRIDGE","GALLEY",
    "COMPASS","CHART","BEACON","BUOY","FLARE","LANTERN","RADAR",
    "PORTHOLE","LIFEBELT","LIFERAFT",
    "NET","LINE","HOOK","BAIT","CREEL","LOBSTER","TRAP","FLOAT","REEL",
    // weather and sky
    "WIND","GALE","STORM","SQUALL","BREEZE","MIST","FOG","HAZE","CLOUD",
    "RAIN","DRIZZLE","SUNSET","SUNRISE","HORIZON","MOON","STARS","SKY",
    "THUNDER","LIGHTNING","RAINBOW","DAWN","DUSK","TWILIGHT",
    "STORMY","CHOPPY","WINDY","BREEZY","CALM",
    // creatures
    "FISH","CRAB","SHRIMP","MUSSEL","OYSTER","COCKLE","WINKLE","LIMPET",
    "STARFISH","JELLYFISH","URCHIN","SEAL","OTTER","DOLPHIN","WHALE","SHARK",
    "HERRING","MACKEREL","SALMON","COD","PLAICE","SOLE","BASS","MULLET",
    "GULL","TERN","PUFFIN","GANNET","CORMORANT","OYSTERCATCHER","HERON",
    "SEABIRD","SEAGULL",
    // people and place
    "SAILOR","SKIPPER","CREW","FISHER","DIVER","SWIMMER","KEEPER","PILOT",
    "LIGHTHOUSE","COASTGUARD","LIFEBOAT","VILLAGE","COTTAGE","CAFE","KIOSK",
    "PROMENADE","RAILING","STEPS","LADDER","BOARDWALK",
    "CAPTAIN","FISHERMAN",
    // things and doings
    "SHELL","DRIFTWOOD","SEAWEED","KELP","SALT","BRINE","WRECK","CARGO",
    "SAILING","ROWING","FISHING","WADING","PADDLING","SWIMMING","DRIFTING",
    "ANCHORED","MOORED","ADRIFT","AGROUND","OFFSHORE",
    "TRAWLING","SPLASH","SOAKED","SALTY","SEASICK",
    "BUCKET","SPADE","TOWEL","DECKCHAIR","WINDBREAK","SUNHAT","ICECREAM",
  ),
};

export const theSeaTitles = titles(
  [
    "Everything out there is {}.",
    "The whole beach is {}.",
    "It has turned {} again.",
    "Somebody is already out there, {}.",
    "You can hear it from here, {}.",
    "By evening it will be {}.",
    "Nothing out here stays {}.",
    "Leave it {} an hour.",
  ],
  ["grey","loud","calm","cold","rising","turning","empty","bright"],
  [
    "The wind got up overnight.",
    "Somebody left their boots.",
    "It is louder than it looks.",
    "The last ferry has gone.",
    "Nobody swims this early.",
    "It goes out a very long way.",
    "Gulls got the chips.",
    "You can taste it on the railings.",
    "The light on the water is doing something.",
    "It will be gone by six.",
  ],
);
