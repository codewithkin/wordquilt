import type { Theme } from "../src/types.ts";
import { pool, titles } from "./_shared.ts";

/**
 * Trains — paid pack, 30 puzzles.
 *
 * Stations, journeys and the ordinary business of getting somewhere by rail —
 * not locomotive engineering. The platform vocabulary is what most people
 * actually have, and it is plentiful.
 */
export const trains: Theme = {
  id: "trains",
  name: "Trains",
  phrases: [
    "Two minutes late",      // 14
    "Somewhere north",       // 15
    "Window seat",           // 10
    "The long way",          // 10
    "Nearly there",          // 11
    "Changing here",         // 12
    "Watch the doors",       // 13
    "Out of the tunnel",     // 14
    "Last one home",         // 11
    "All the way",           // 9
  ],
  words: pool(
    // the train
    "TRAIN","ENGINE","CARRIAGE","COACH","WAGON","TRUCK","GUARD","BUFFER",
    "COUPLING","WHEEL","AXLE","BRAKE","WHISTLE","HORN","BOILER","FUNNEL",
    "STEAM","DIESEL","ELECTRIC","SLEEPER","PULLMAN","EXPRESS","LOCAL",
    "SHUTTLE","COMMUTER","FREIGHT","SERVICE","DEPARTURE","ARRIVAL",
    // the track
    "TRACK","RAIL","LINE","SIDING","JUNCTION","POINTS","SIGNAL","CROSSING",
    "TUNNEL","BRIDGE","VIADUCT","EMBANKMENT","CUTTING","GRADIENT","CURVE",
    "STRAIGHT","BALLAST","SLEEPERS","GAUGE","LOOP","TERMINUS",
    // the station
    "STATION","PLATFORM","CONCOURSE","BARRIER","GATE","TICKET","OFFICE",
    "BOOKING","TIMETABLE","BOARD","CLOCK","BENCH","SHELTER","CANOPY","KIOSK",
    "TROLLEY","LUGGAGE","LOCKER","WAITING","ROOM","BUFFET","CAFE","STAIRS",
    "LIFT","FOOTBRIDGE","SUBWAY","ENTRANCE","EXIT","HALT","STOP",
    // people
    "DRIVER","CONDUCTOR","GUARD","PORTER","INSPECTOR","SIGNALMAN","PASSENGER",
    "COMMUTER","TRAVELLER","TOURIST","STRANGER","CROWD","QUEUE","PLATFORMS",
    // the journey
    "JOURNEY","TRIP","ROUTE","CHANGE","CONNECTION","DELAY","DIVERSION",
    "TIMETABLE","SCHEDULE","DESTINATION","TERMINAL","OUTBOUND","RETURN",
    "SINGLE","SEASON","RESERVED","STANDING","SEATED","BOARDING","ALIGHTING",
    // in the carriage
    "SEAT","WINDOW","AISLE","RACK","DOOR","HANDLE","STRAP","BLIND",
    "HEATER","LIGHT","MIRROR","NOTICE","SIGN","TICKETS","NEWSPAPER","BOOK",
    "COFFEE","SANDWICH","CRISPS","FLASK","SUITCASE","RUCKSACK","HOLDALL",
    // the world outside
    "COUNTRY","FIELDS","HEDGES","VILLAGE","TOWN","CITY","SUBURB","FACTORY",
    "CHIMNEY","CANAL","RIVER","VALLEY","HILLS","MOOR","FOREST","PYLON",
    "SUNSET","FROST","SNOW","DARKNESS","LAMPLIGHT",
    // motion and sound
    "RATTLE","RUMBLE","CLATTER","HISSING","SQUEAL","JOLT","LURCH","GLIDE",
    "SPEEDING","SLOWING","STOPPING","STARTING","PULLING","PASSING","WAITING",
    "ARRIVING","LEAVING","RUNNING","HURRYING","MISSING",
  ),
};

export const trainsTitles = titles(
  [
    "The whole platform is {}.",
    "Everything here is {} again.",
    "It has been {} for twenty minutes.",
    "Somebody has been {} since Crewe.",
    "You can hear it {} from here.",
    "By the next stop it will be {}.",
    "Nothing on this line is ever {}.",
    "Leave it {} another minute.",
  ],
  ["late","waiting","early","empty","moving","stopped","quiet","full"],
  [
    "Nobody knows which platform yet.",
    "The board has given up.",
    "Somebody left a coat on the rack.",
    "It goes dark in the tunnel.",
    "Two minutes, apparently.",
    "You can see your house from here.",
    "The trolley never reaches this end.",
    "Everyone stands up too early.",
    "It smells of coffee and rain.",
    "The last one is always the slowest.",
  ],
);
