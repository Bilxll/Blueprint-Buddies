export type CountryCode = "PK" | "US" | "UK";

export type MarketConfig = {
  code: CountryCode;
  name: string;
  shortName: string;
  currency: "PKR" | "USD" | "GBP";
  locale: string;
  phonePrefix: string;
  phonePlaceholder: string;
  defaultCity: string;
  buyBudgetPresets: number[];
  rentBudgetPresets: number[];
  cities: Record<string, string[]>;
};

export const MARKET_CONFIG: Record<CountryCode, MarketConfig> = {
  PK: {
    code: "PK", name: "Pakistan", shortName: "PAKISTAN", currency: "PKR", locale: "en-PK", phonePrefix: "+92", phonePlaceholder: "03XX XXXXXXX", defaultCity: "Karachi",
    buyBudgetPresets: [5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000],
    rentBudgetPresets: [25_000, 50_000, 100_000, 200_000, 500_000],
    cities: {
      Karachi: ["DHA", "Clifton", "Bahria Town Karachi", "Scheme 33", "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "North Nazimabad", "PECHS", "Malir", "Other"],
      Lahore: ["DHA Lahore", "Bahria Town Lahore", "Gulberg", "Johar Town", "Model Town", "Lake City", "Askari", "Other"],
      Islamabad: ["DHA Islamabad", "Bahria Town", "G-11", "F-10", "F-11", "E-11", "Gulberg Greens", "B-17", "Other"],
      Rawalpindi: ["Bahria Town", "DHA", "Saddar", "Chaklala", "Adiala Road", "Airport Housing", "Other"],
    },
  },
  US: {
    code: "US", name: "United States", shortName: "USA", currency: "USD", locale: "en-US", phonePrefix: "+1", phonePlaceholder: "(555) 123-4567", defaultCity: "New York",
    buyBudgetPresets: [250_000, 500_000, 750_000, 1_000_000, 2_000_000],
    rentBudgetPresets: [1_500, 2_500, 3_500, 5_000, 7_500],
    cities: {
      "New York": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Long Island City", "Other"],
      "Los Angeles": ["Beverly Hills", "Santa Monica", "West Hollywood", "Downtown LA", "Hollywood", "Culver City", "Pasadena", "Other"],
      Miami: ["Brickell", "Miami Beach", "Downtown Miami", "Coral Gables", "Coconut Grove", "Aventura", "Doral", "Other"],
      Houston: ["The Heights", "River Oaks", "Montrose", "Downtown", "Midtown", "Memorial", "Sugar Land", "Other"],
    },
  },
  UK: {
    code: "UK", name: "United Kingdom", shortName: "UK", currency: "GBP", locale: "en-GB", phonePrefix: "+44", phonePlaceholder: "07XXX XXXXXX", defaultCity: "London",
    buyBudgetPresets: [250_000, 500_000, 750_000, 1_000_000, 2_000_000],
    rentBudgetPresets: [1_000, 1_500, 2_500, 3_500, 5_000],
    cities: {
      London: ["Mayfair", "Kensington", "Chelsea", "Canary Wharf", "Shoreditch", "Camden", "Richmond", "Other"],
      Manchester: ["City Centre", "Salford Quays", "Didsbury", "Chorlton", "Ancoats", "Deansgate", "Trafford", "Other"],
      Birmingham: ["City Centre", "Edgbaston", "Jewellery Quarter", "Harborne", "Selly Oak", "Digbeth", "Solihull", "Other"],
      Leeds: ["City Centre", "Headingley", "Chapel Allerton", "Roundhay", "Holbeck", "Horsforth", "Meanwood", "Other"],
    },
  },
};

export const COUNTRY_OPTIONS = (["PK", "US", "UK"] as CountryCode[]).map(code => ({ value: code, label: MARKET_CONFIG[code].shortName }));

export function isCountryCode(value: unknown): value is CountryCode {
  return value === "PK" || value === "US" || value === "UK";
}

export function getMarket(country: CountryCode | string | undefined): MarketConfig {
  return MARKET_CONFIG[isCountryCode(country) ? country : "PK"];
}

export function getCities(country: CountryCode | string | undefined) {
  return Object.keys(getMarket(country).cities);
}

export function getAreas(country: CountryCode | string | undefined, city: string) {
  return getMarket(country).cities[city] || ["Other"];
}

export function getCountryForCity(city: string): CountryCode {
  for (const code of Object.keys(MARKET_CONFIG) as CountryCode[]) {
    if (MARKET_CONFIG[code].cities[city]) return code;
  }
  return "PK";
}

export function formatMoney(value: number | string | undefined, country: CountryCode | string | undefined) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "Open";
  const market = getMarket(country);
  return new Intl.NumberFormat(market.locale, { style: "currency", currency: market.currency, maximumFractionDigits: 0 }).format(n);
}

export function formatCompactMoney(value: number, country: CountryCode | string | undefined) {
  const market = getMarket(country);
  if (market.code === "PK") {
    if (value >= 10_000_000) { const c = value / 10_000_000; return `${Number.isInteger(c) ? c : c.toFixed(1)} CR`; }
    if (value >= 100_000) { const l = value / 100_000; return `${Number.isInteger(l) ? l : l.toFixed(1)} LAC`; }
  }
  return new Intl.NumberFormat(market.locale, { style: "currency", currency: market.currency, notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export const CITY_AREAS: Record<string, string[]> = Object.fromEntries(
  Object.values(MARKET_CONFIG).flatMap(market => Object.entries(market.cities))
);

export const PROPERTY_TYPES = ["House", "Apartment", "Flat", "Condo", "Townhouse", "Plot", "Land", "Commercial", "Office", "Shop", "Farmhouse", "Other"];
export const TIMEFRAMES = ["Within 30 days", "1–3 months", "3–6 months", "6–12 months", "Just exploring"];
