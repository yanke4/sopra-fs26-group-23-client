import type { TerritoryState } from "@/components/europe-map";

export const PHASES = ["Deploy", "Attack", "Fortify"] as const;
export type Phase = (typeof PHASES)[number];

export const PLAYER_COLORS = ["#b91c1c", "#4361EE", "#15803d", "#FFD60A", "#bc12df","#f37005"];
export const PLAYER_NAMES = ["You", "Player 2", "Player 3", "Player 4"];

export const COLOR_MAP: Record<string, string> = {
  RED: "#b91c1c",
  BLUE: "#4361EE",
  GREEN: "#15803d",
  YELLOW: "#FFD60A",
  PURPLE: "#bc12df",
  ORANGE: "#f37005",
};

export const NEUTRAL_COLOR = "#555555";

export const REGIONS: { name: string; bonus: number; fields: string[] }[] = [
  { name: "British Isles", bonus: 4, fields: ["Iceland", "Ireland", "Great Britain"] },
  { name: "Scandinavia", bonus: 4, fields: ["Norway", "Sweden", "Finland"] },
  { name: "Baltic States", bonus: 3, fields: ["Estonia", "Latvia", "Lithuania", "Belarus"] },
  { name: "Eastern Europe", bonus: 3, fields: ["Ukraine", "Moldova", "Romania"] },
  { name: "Balkans", bonus: 4, fields: ["Balkan", "Greece", "Bulgaria", "Turkey"] },
  { name: "Central Europe", bonus: 5, fields: ["Hungary", "Czech Republic", "Slovakia", "Poland"] },
  { name: "Western Europe", bonus: 4, fields: ["Portugal", "Spain", "France"] },
  { name: "Alpine", bonus: 3, fields: ["Italy", "Switzerland", "Austria"] },
  { name: "Low Countries", bonus: 5, fields: ["Belgium", "Netherlands", "Germany", "Denmark"] },
];

export const ADJACENCY: Record<string, string[]> = {
  Iceland: ["Norway", "Ireland"],
  Ireland: ["Great Britain", "Iceland"],
  "Great Britain": ["Ireland", "France"],
  Norway: ["Sweden", "Iceland"],
  Sweden: ["Finland", "Norway", "Denmark"],
  Finland: ["Estonia", "Sweden"],
  Estonia: ["Latvia", "Finland"],
  Latvia: ["Lithuania", "Estonia", "Belarus"],
  Lithuania: ["Belarus", "Latvia", "Poland"],
  Ukraine: ["Moldova", "Romania", "Hungary", "Slovakia", "Poland", "Belarus"],
  Moldova: ["Romania", "Ukraine"],
  Romania: ["Balkan", "Bulgaria", "Moldova", "Ukraine", "Hungary"],
  Balkan: ["Italy", "Austria", "Greece", "Bulgaria", "Romania", "Hungary"],
  Greece: ["Balkan", "Bulgaria", "Turkey"],
  Bulgaria: ["Greece", "Turkey", "Balkan", "Romania"],
  Turkey: ["Bulgaria", "Greece"],
  Hungary: [
    "Slovakia",
    "Austria",
    "Balkan",
    "Romania",
    "Ukraine",
  ],
  "Czech Republic": ["Germany", "Austria", "Poland", "Slovakia"],
  Slovakia: ["Czech Republic", "Poland", "Austria", "Hungary", "Ukraine"],
  Poland: [
    "Germany",
    "Czech Republic",
    "Slovakia",
    "Ukraine",
    "Belarus",
    "Lithuania",
  ],
  Portugal: ["Spain"],
  Spain: ["France", "Portugal"],
  France: [
    "Great Britain",
    "Spain",
    "Italy",
    "Switzerland",
    "Germany",
    "Belgium",
  ],
  Italy: ["Switzerland", "France", "Austria", "Balkan"],
  Switzerland: ["Italy", "France", "Germany", "Austria"],
  Austria: [
    "Italy",
    "Switzerland",
    "Germany",
    "Czech Republic",
    "Balkan",
    "Hungary",
    "Slovakia",
  ],
  Belgium: ["France", "Germany", "Netherlands"],
  Netherlands: ["Belgium", "Germany"],
  Germany: [
    "Netherlands",
    "Belgium",
    "Denmark",
    "Austria",
    "France",
    "Poland",
    "Czech Republic",
    "Switzerland",
  ],
  Denmark: ["Sweden", "Germany"],
  Belarus: ["Poland", "Ukraine", "Lithuania", "Latvia"],
};

// Fallback territory distribution for when game state is not yet loaded
export const FALLBACK_TERRITORIES: Record<string, TerritoryState> = {
  Spain: { owner: 0, troops: 4 },
  Portugal: { owner: 0, troops: 2 },
  France: { owner: 0, troops: 6 },
  Belgium: { owner: 0, troops: 2 },
  Italy: { owner: 0, troops: 5 },
  Switzerland: { owner: 0, troops: 3 },
  Ireland: { owner: 0, troops: 1 },
  "Great Britain": { owner: 0, troops: 3 },
  Netherlands: { owner: 1, troops: 3 },
  Germany: { owner: 1, troops: 7 },
  Denmark: { owner: 1, troops: 2 },
  Poland: { owner: 1, troops: 4 },
  "Czech Republic": { owner: 1, troops: 2 },
  Austria: { owner: 1, troops: 3 },
  Iceland: { owner: 1, troops: 1 },
  Norway: { owner: 2, troops: 4 },
  Sweden: { owner: 2, troops: 3 },
  Finland: { owner: 2, troops: 2 },
  Estonia: { owner: 2, troops: 1 },
  Latvia: { owner: 2, troops: 2 },
  Lithuania: { owner: 2, troops: 2 },
  Belarus: { owner: 2, troops: 3 },
  Slovakia: { owner: 3, troops: 2 },
  Hungary: { owner: 3, troops: 3 },
  Romania: { owner: 3, troops: 4 },
  Moldova: { owner: 3, troops: 1 },
  Bulgaria: { owner: 3, troops: 2 },
  Balkan: { owner: 3, troops: 3 },
  Greece: { owner: 3, troops: 2 },
  Turkey: { owner: 3, troops: 3 },
  Ukraine: { owner: 3, troops: 5 },
};

export const MOCK_LOGS = [
  { text: "You deployed 3 troops to Italy", icon: "deploy" as const },
  { text: "Player 2 attacked France from Germany", icon: "attack" as const },
  { text: "Player 3 fortified Norway", icon: "fortify" as const },
  { text: "You conquered Switzerland!", icon: "conquer" as const },
  { text: "Player 4 deployed 2 troops to Ukraine", icon: "deploy" as const },
  {
    text: "Player 2 attacked Belgium from Netherlands",
    icon: "attack" as const,
  },
  { text: "You defended France successfully!", icon: "defend" as const },
];
