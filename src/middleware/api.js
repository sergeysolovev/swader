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
    .catch(error => Promise.reject(
      `Failed to load 'films' from http://swapi.co`)
    );
}

export function fetchFilm(filmId) {
  const path = `films/${filmId}/`;
  return api(path)
    .then(json => createFilm(json))
    .catch(error => Promise.reject(
      `Failed to load /${path} from http://swapi.co`)
    );
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

const propToResourceType = {
  'residents': 'people',
  'pilots': 'people',
  'characters': 'people',
  'homeworld': 'planets'
}

export function getResourceTypeByProp(propName) {
  return propToResourceType[propName] || propName;
}

export function getResourceDisplayName(resourceType, item) {
  return {
    'films': `${item.title} (${getYear(item)})`,
    'people': item.name,
    'planets': item.name,
    'starships': item.name,
    'vehicles': item.name,
    'species': item.name
  }[resourceType];
}

export function isRelatedResource(resource) {
  const includesApiRoot = (res) => res.includes(API_ROOT);
  return Array.isArray(resource) ?
    resource.every(includesApiRoot) :
    includesApiRoot(resource)
}

export function fetchRelatedResources(item) {
  const promise = (resourceType, resourceUrls, mapResultsTo) =>
    resourceUrls ?
      Promise.all(resourceUrls
        .map(url => getUrlId(url))
        .map(id => fetchResource(resourceType, id)))
      .then(resources => Promise.resolve(mapResultsTo(resources))) :
      Promise.resolve(mapResultsTo([]));
  const promises = Object
    .keys(item)
    .filter(key => isRelatedResource(item[key]))
    .map(key =>
      promise(
        getResourceTypeByProp(key),
        Array.isArray(item[key]) ? item[key] : [item[key]],
        x => ({[key]: x})
      )
    );
  return Promise.all(promises)
    .then(results => Object.assign({}, ...results));
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
  const url = `${resourceType}/` + (
    filter && page ? `?search=${encodeURI(filter)}&page=${page}` :
    filter ? `?search=${encodeURI(filter)}` :
    page ? `?page=${page}` : ''
  );
  return validateResourceType(resourceType) ||
    api(url)
      .then(json => ({
        count: json.count,
        items: json.results.map(resource => extendWithId(resource)),
        url: url,
        nextPage: getPageNumberFromUrl(json.next)
      }))
      .catch(error => Promise.reject(
        `Failed to load '${resourceType}' from http://swapi.co`)
      );
}

export function fetchResource(resourceType, resourceId) {
  let url = `${resourceType}/${resourceId}/`;
  return validateResourceType(resourceType) || api(url)
    .then(json => extendWithId(json))
    .catch(error => Promise.reject(
      `Failed to load /${url} from http://swapi.co`)
    );
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
  return RESOURCE_TYPES.includes(resourceType) ?
    false :
    Promise.reject(`Invalid resource type '${resourceType}'`)
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
