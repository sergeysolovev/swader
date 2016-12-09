export const PEOPLE = "/people";
export const PLANETS = "/planets";
export const STARSHIPS = "/starships";
export const ABOUT = "/about";

export const getPersonPath = personId => `people/${personId}`;
export const getPlanetPath = planetId => `planets/${planetId}`;
export const getResourcePath = (resourceType, resourceId) =>
  `${resourceType}/${resourceId}`
