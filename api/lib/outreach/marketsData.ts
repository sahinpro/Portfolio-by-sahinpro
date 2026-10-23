/**
 * Server-side copy of planner markets (kept in sync with
 * src/admin/constants/outreachMarkets.ts).
 */

export type MarketZone = { id: string; city: string; tz: string };

export type OutreachMarket = {
  id: string;
  flag: string;
  name: string;
  countries: string[];
  zones: MarketZone[];
};

const z = (id: string, city: string, tz: string): MarketZone => ({
  id,
  city,
  tz,
});

export const OUTREACH_MARKETS: OutreachMarket[] = [
  {
    id: "us",
    flag: "🇺🇸",
    name: "United States",
    countries: ["united states", "usa", "u.s.a.", "us"],
    zones: [
      z("newyork", "New York · Eastern", "America/New_York"),
      z("chicago", "Chicago · Central", "America/Chicago"),
      z("denver", "Denver · Mountain", "America/Denver"),
      z("losangeles", "Los Angeles · Pacific", "America/Los_Angeles"),
      z("phoenix", "Phoenix · no DST", "America/Phoenix"),
      z("anchorage", "Anchorage · Alaska", "America/Anchorage"),
      z("honolulu", "Honolulu · Hawaii", "Pacific/Honolulu"),
    ],
  },
  {
    id: "ca",
    flag: "🇨🇦",
    name: "Canada",
    countries: ["canada"],
    zones: [
      z("toronto", "Toronto / Ottawa · Eastern", "America/Toronto"),
      z("winnipeg", "Winnipeg · Central", "America/Winnipeg"),
      z("calgary", "Calgary / Edmonton · Mountain", "America/Edmonton"),
      z("vancouver", "Vancouver · Pacific", "America/Vancouver"),
      z("halifax", "Halifax · Atlantic", "America/Halifax"),
      z("stjohns", "St. John's · Newfoundland", "America/St_Johns"),
    ],
  },
  {
    id: "au",
    flag: "🇦🇺",
    name: "Australia",
    countries: ["australia"],
    zones: [
      z("sydney", "Sydney / Melbourne · AEST", "Australia/Sydney"),
      z("brisbane", "Brisbane · AEST, no DST", "Australia/Brisbane"),
      z("adelaide", "Adelaide · ACST/ACDT", "Australia/Adelaide"),
      z("darwin", "Darwin · ACST", "Australia/Darwin"),
      z("perth", "Perth · AWST", "Australia/Perth"),
    ],
  },
  {
    id: "uk",
    flag: "🇬🇧",
    name: "United Kingdom",
    countries: [
      "united kingdom",
      "uk",
      "u.k.",
      "great britain",
      "england",
      "wales",
      "scotland",
      "northern ireland",
    ],
    zones: [z("london", "London · GMT/BST", "Europe/London")],
  },
  {
    id: "de",
    flag: "🇩🇪",
    name: "Germany",
    countries: ["germany", "deutschland"],
    zones: [z("berlin", "Berlin · CET/CEST", "Europe/Berlin")],
  },
  {
    id: "it",
    flag: "🇮🇹",
    name: "Italy",
    countries: ["italy", "italia"],
    zones: [z("rome", "Rome · CET/CEST", "Europe/Rome")],
  },
];
