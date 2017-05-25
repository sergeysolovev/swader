export const FILMS = "/";
export const PEOPLE = "/people";
export const PLANETS = "/planets";
export const STARSHIPS = "/starships";
export const ABOUT = "/about";

export const getResourcePath = (resourceType, resourceId) =>
  `${resourceType}/${resourceId}`
