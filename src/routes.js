export const FILMS = "/films";
export const PEOPLE = "/people";
export const PLANETS = "/planets";
export const STARSHIPS = "/starships";
export const VEHICLES = "/vehicles";
export const SPECIES = "/species";
export const ABOUT = "/about";

export const getResourcePath = (resourceType, resourceId) =>
  `/${resourceType}/${resourceId}`
