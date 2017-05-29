import Url from 'url'

const API_ROOT = 'http://swapi.co/api/'
const RESOURCE_TYPES = [
  'films',
  'people',
  'planets',
  'starships',
  'vehicles',
  'species'
];

export function fetchFilms() {
  return api('films/')
    .then(json => ({ films: json.results.map(createFilm) }))
    .catch(error => ({isError: true}));
}

export function fetchFilm(filmId) {
  return api(`films/${filmId}/`)
    .then(json => createFilm(json))
    .catch(error => ({isError: true}));
}

function getYear(film) {
  return new Date(film.release_date).getFullYear();
}

// http://eddmann.com/posts/arabic-to-roman-numerals-converter-in-javascript/
function toRoman(decimal) {
  const chart = [
    [ 'M', 1000],
    ['CM',  900],
    [ 'D',  500],
    ['CD',  400],
    [ 'C',  100],
    ['XC',   90],
    [ 'L',   50],
    ['XL',   40],
    [ 'X',   10],
    ['IX',    9],
    [ 'V',    5],
    ['IV',    4],
    [ 'I',    1]
  ];
  function recur(remainder, chart) {
    if (remainder === 0) return '';
    const [[numeral, value], ...tail] = chart;
    return numeral.repeat(remainder / value) + recur(remainder % value, tail);
  };
  return recur(decimal, chart);
}

export function fetchFilmResources(film) {
  const promise = (resourceType, resourceUrls, mapResultsTo) =>
    resourceUrls ?
      Promise.all(resourceUrls
        .map(url => getUrlId(url))
        .map(id => fetchResource(resourceType, id)))
      .then(resources => Promise.resolve(mapResultsTo(resources))) :
      Promise.resolve(mapResultsTo([]));
  const promises = [
    promise('people', film.characters, x => ({'characters': x})),
    promise('planets', film.planets, x => ({'planets': x})),
    promise('starships', film.starships, x => ({'starships': x})),
    promise('species', film.species, x => ({'species': x})),
    promise('vehicles', film.vehicles, x => ({'vehicles': x}))
  ];
  return Promise.all(promises)
    .then(results => Object.assign({}, ...results));
}

export function fetchResources(resourceType, filter, page) {
  validateResourceType(resourceType);
  let url = `${resourceType}/`
    + (filter ? `?search=${encodeURI(filter)}` : '')
    + (page && !filter ? `?page=${page}` : '');
  return api(url)
    .then(json => ({
       items: json.results.map(resource => extendWithId(resource)),
       url: url,
       nextPageUrl: json.next,
       prevPageUrl: json.previous,
       nextPage: getPageNumberFromUrl(json.next),
       prevPage: getPageNumberFromUrl(json.previous),
       page: getCurrentPageNumber(json.next, json.previous) }))
    .catch(error => ({isError: true}));
}

export function fetchResource(resourceType, resourceId) {
  validateResourceType(resourceType);
  let url = `${resourceType}/${resourceId}/`;
  return api(url)
    .then(json => extendWithId(json))
    .catch(error => ({isError: true}));
}

export function getUrlId(url) {
  let urlSplitted = url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

function shorten(string) {
  const maxLength = 200;
  let trimmed = string.substr(0, maxLength);
  return trimmed.substr(0,
    Math.min(trimmed.length, trimmed.lastIndexOf(' ')));
}

function createFilm(filmItem) {
  let film = extendWithId(filmItem);
  return Object.assign({}, film, {
    episode: toRoman(film.episode_id),
    year: getYear(film),
    shortOpening: shorten(film.opening_crawl.replace(/(\r\n)+/g, ' ')),
    opening: film.opening_crawl.replace(/(\r\n)+/g, ' ')
  });
}

function api (endpoint) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ?
    API_ROOT + endpoint :
    endpoint;
  return fetch(fullUrl)
    .then(response => response.json());
}

function validateResourceType(resourceType) {
  if (!(RESOURCE_TYPES.includes(resourceType))) {
    return Promise.reject({isError: true});
  }
}

function extendWithId(resource) {
  return Object.assign({}, resource, {id: getResourceId(resource)});
}

function getResourceId(resource) {
  let urlSplitted = resource.url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

function getPageNumberFromUrl(url) {
  return url ? parseInt(Url.parse(url, true).query.page, 10) : undefined;
}

function getCurrentPageNumber(nextPageUrl, prevPageUrl) {
  if (nextPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) - 1;
  } else if (prevPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) + 1;
  } else {
    return 1;
  }
}
