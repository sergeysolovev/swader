import Url from 'url'

const API_ROOT = 'http://swapi.co/api/'

export const fetchPeople = (filter, page) => {
  let url = 'people/'
    + (filter ? `?search=${encodeURI(filter)}` : '')
    + (page && !filter ? `?page=${page}` : '');
  return api(url)
    .then(json => ({
       people: json.results.map(item => getPerson(item)),
       url: url,
       nextPageUrl: json.next,
       prevPageUrl: json.previous,
       nextPage: getPageNumberFromUrl(json.next),
       prevPage: getPageNumberFromUrl(json.previous),
       page: getCurrentPageNumber(json.next, json.previous) }))
    .catch(error => ({isError: true}));
}

export const fetchPlanets = (filter, page) => {
  let url = 'planets/'
    + (filter ? `?search=${encodeURI(filter)}` : '')
    + (page && !filter ? `?page=${page}` : '');
  return api(url)
    .then(json => ({
       planets: json.results.map(item => getPlanet(item)),
       url: url,
       nextPageUrl: json.next,
       prevPageUrl: json.previous,
       nextPage: getPageNumberFromUrl(json.next),
       prevPage: getPageNumberFromUrl(json.previous),
       page: getCurrentPageNumber(json.next, json.previous) }))
    .catch(error => ({isError: true}));
}

export const fetchPerson = (personId) => {
  let url = `people/${personId}/`;
  return api(url)
    .then(json => ({person: json}))
    .catch(error => ({isError: true}));
}

export const fetchPlanet = (planetId) => {
  let url = `planets/${planetId}/`;
  return api(url)
    .then(json => ({person: json}))
    .catch(error => ({isError: true}));
}

const api = endpoint => {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ?
    API_ROOT + endpoint :
    endpoint;
  return fetch(fullUrl)
    .then(response => response.json());
}

const getPerson = personData =>
  Object.assign({}, personData, {id: getPersonId(personData)});

const getPersonId = (person) => {
  let urlSplitted = person.url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

const getPlanet = planetData =>
  Object.assign({}, planetData, {id: getPlanetId(planetData)});

const getPlanetId = (planet) => {
  let urlSplitted = planet.url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

const getPageNumberFromUrl = url =>
  url ? parseInt(Url.parse(url, true).query.page) : undefined;

const getCurrentPageNumber = (nextPageUrl, prevPageUrl) => {
  if (nextPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) - 1;
  } else if (prevPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) + 1;
  } else {
    return 1;
  }
}
