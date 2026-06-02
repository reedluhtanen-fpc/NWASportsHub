export const SPORTS = ["Baseball", "Soccer"];

export const AGE_GROUPS_BY_SPORT: Record<string, string[]> = {
  Baseball: ["6U","7U","8U","9U","10U","11U","12U","13U","14U","15U","16U","17U","18U"],
  Soccer:   ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16","U17","U18"],
};

export const CATEGORIES = ["Recreational", "Competitive"];

export const SPORT_IMAGES: Record<string, string> = {
  Baseball:
    "https://images.unsplash.com/photo-1631834399827-aa6ddf207889?w=1600&q=80",
  Soccer:
    "https://images.unsplash.com/photo-1622659097509-4d56de14539e?w=1600&q=80",
  default:
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1600&q=80",
};
