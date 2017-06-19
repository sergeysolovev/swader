import Url from 'url'
import toRoman from '../utils/toRoman'
import swdb from 'idb-keyval'

const API_ROOT = 'http://swapi.co/api/'

export function fetchFilms() {
  const filmsPath = '/films';
  const fetchFilmsOverApi = () => {
    const getPath = (filmJson) => `${filmsPath}/${getUrlId(filmJson.url)}`;
    const getDisplayName = (filmJson) => {
      const episode = toRoman(filmJson.episode_id);
      const title = filmJson.title;
      const year = getYear(filmJson);
      return `${episode} – ${title} (${year})`;
    };
    return api(filmsPath)
      .then(json => json.results.map(filmJson => ({
        path: getPath(filmJson),
        displayName: getDisplayName(filmJson)
      })));
  };
  return swdb
    .get(filmsPath)
    .then(films => films || fetchFilmsOverApi()
      .then(films => {
        swdb
          .set(filmsPath, films)
          .catch(err => console.error(`failed to store ${filmsPath} in idb`, err));
        return films;
      })
    );
}

export function fetchFilm(filmId) {
  const path = `films/${filmId}/`;
  return api(path)
    .then(film => Object.assign({}, film, {
      episode: toRoman(film.episode_id || 0),
      opening: (film.opening_crawl || '').replace(/(\r\n)+/g, ' ')
    }))
}

export function fetchFilmResources(film) {
  const promise = (resourceType, resourceUrls, mapResultsTo) =>
    resourceUrls ?
      Promise.all(resourceUrls
        .map(url => getUrlId(url))
        .map(id => fetchResource(resourceType, id))
      )
      .then(resources => mapResultsTo(resources)) :
      Promise.resolve(mapResultsTo([]));
  const promises = [
    promise('people', film.characters, x => ({'characters': x})),
    promise('planets', film.planets, x => ({'planets': x})),
    promise('starships', film.starships, x => ({'starships': x})),
    promise('species', film.species, x => ({'species': x})),
    promise('vehicles', film.vehicles, x => ({'vehicles': x}))
  ];
  return Promise.all(promises)
    .then(results => Object.assign({}, ...results))
}

export function getResourceTypeByProp(propName) {
  const propToResourceType = {
    'residents': 'people',
    'pilots': 'people',
    'characters': 'people',
    'homeworld': 'planets'
  };
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
    .then(json => extendWithId(json));
}

export function getUrlId(url) {
  let urlSplitted = url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

function api (endpoint) {
  const fullUrl = endpoint.includes(API_ROOT) ?
    endpoint :
    API_ROOT + endpoint;
  return fetch(fullUrl)
    .then(response => response.json());
}

function validateResourceType(resourceType) {
  const validTypes = [
    'films',
    'people',
    'planets',
    'starships',
    'vehicles',
    'species'
  ];
  return validTypes.includes(resourceType) ?
    false :
    Promise.reject(`Invalid resource type '${resourceType}'`);
}

function extendWithId(resource) {
  return Object.assign({}, resource, {id: getUrlId(resource.url)});
}

function getPageNumberFromUrl(url) {
  return url ? parseInt(Url.parse(url, true).query.page, 10) : undefined;
}

function getYear(film) {
  return new Date(film.release_date).getFullYear();
}