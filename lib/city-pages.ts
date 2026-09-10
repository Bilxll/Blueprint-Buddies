import { CITY_AREAS } from "@/lib/market";

export type CityPage = {
  slug: string;
  name: string;
  number: string;
  statement: string;
  intro: string;
  demand: string[];
  realtorCopy: string;
};

export const CITY_PAGES: CityPage[] = [
  {
    slug: "karachi", name: "Karachi", number: "01", statement: "A CITY OF MICRO-MARKETS.",
    intro: "Karachi property demand changes street by street. CREAIONX PROPERTY captures the area, budget, property type and timeframe before matching the requirement to participating realtors.",
    demand: ["Residential buyers", "Property owners ready to sell", "Investment requirements", "Rental demand"],
    realtorCopy: "Choose the Karachi areas you actually work. Your opportunity feed is designed around those territories instead of showing irrelevant city-wide noise."
  },
  {
    slug: "lahore", name: "Lahore", number: "02", statement: "MATCH DEMAND TO THE RIGHT SOCIETY.",
    intro: "From DHA to Bahria Town and Gulberg, buyers approach Lahore with very different budgets and objectives. We structure those requirements before they reach realtors.",
    demand: ["Homes and villas", "Plots and investment", "Apartments", "Commercial property"],
    realtorCopy: "Realtors define their Lahore territories and specialties so the platform can prioritize opportunities that fit the markets they understand."
  },
  {
    slug: "islamabad", name: "Islamabad", number: "03", statement: "CLEAR INTENT. LOCAL EXPERTISE.",
    intro: "Islamabad combines sectors, gated communities and investment corridors. CREAIONX PROPERTY turns vague inquiries into structured property requirements.",
    demand: ["Sector-based buyers", "Bahria & DHA demand", "Investment property", "Seller requirements"],
    realtorCopy: "Instead of competing for every inquiry, participating realtors can focus on the sectors and communities where they have real inventory and expertise."
  },
  {
    slug: "rawalpindi", name: "Rawalpindi", number: "04", statement: "ONE REQUIREMENT. THE RIGHT MARKET.",
    intro: "Rawalpindi demand spans established neighborhoods, housing societies and fast-moving investment areas. We capture what the customer actually wants before matching begins.",
    demand: ["Family homes", "Housing society demand", "Plots", "Rental requirements"],
    realtorCopy: "Realtors can select Rawalpindi territories and receive opportunities based on location, property type and buyer intent."
  },
];

export function getCityPage(slug: string) {
  return CITY_PAGES.find(city => city.slug === slug);
}

export function getCityAreas(cityName: string) {
  return CITY_AREAS[cityName] || [];
}
