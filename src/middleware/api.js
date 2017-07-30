import Url from 'url'
import toRoman from '../utils/toRoman'
import dbkv from 'idb-keyval'
import db from './db'
import stringHash from 'string-hash'
import resources from './resources'

export const API_ROOT = 'https://swapi.now.sh/api/';
export const throttleInterval = 60 * 1000;

export function fetchFilms() {
  const path = 'films/';
  const fetchFilmsOverApi = () => {
    const getPath = (filmJson) => filmJson.url ?
      path + getUrlId(filmJson.url) : '#';
    const getDisplayName = (filmJson) => {
      const episode = toRoman(filmJson.episode_id || 0);
      const title = filmJson.title;
      const year = getYear(filmJson);
      return `${episode} – ${title} (${year})`;
    };
    return api(path)
      .then(json => json.results.map(filmJson => ({
        created: filmJson.created,
        edited: filmJson.edited,
        path: getPath(filmJson),
        displayName: getDisplayName(filmJson)
      })));
  };
  const setIdbRecord = films => {
    const isNonEmptyArray = Array.isArray(films) && films.length > 0;
    if (isNonEmptyArray) {
      const newRecord = {
        films,
        fetchedOn: new Date(),
        hash: stringHash(films.map(f => f.created + f.edited).join()),
      };
      dbkv.get(path)
        .then(record => {
          record = record || {};
          if (record.hash !== newRecord.hash) {
            dbkv.set(path, newRecord)
              .catch(err => console.error(`failed to store ${path} in idb`, err));
          }
        });
    }
  };
  return dbkv.get(path)
    .then(record => {
      if (record) {
        const maxAge = 86400000;
        const isExpired = (new Date() - record.fetchedOn) >= maxAge;
        if (isExpired) {
          return fetchFilmsOverApi()
            .then(films => {
              setIdbRecord(films);
              return films;
            })
            .catch(() => {
              return record.films;
            });
        }
        return record.films;
      } else {
        return fetchFilmsOverApi()
          .then(films => {
            setIdbRecord(films);
            return films;
          });
      }
    });
}

export function fetchResource(resourceType, resourceId) {
  const uri = API_ROOT + `${resourceType}/${resourceId}/`;

  const fetch = () =>
    validateResourceType(resourceType) ||
    api(uri).then(json => extendWithId(json));

  const storeRes = res => db(resourceType)
    .set(uri, res)
    .catch(err => console.error(
      `failed to store ${uri} in idb`, err)
    );

  const storeTimestamp = () => db(resourceType).ts
    .set(uri, new Date())
    .catch(err => console.error(
      `failed to store timestamp for ${uri} in idb`, err)
    );

  return db(resourceType).get(uri)
    .then(storedRes => {
      if (storedRes) {
        db(resourceType).ts.get(uri).then(fetchedOn => {
          const needRefresh = (new Date() - fetchedOn) >= throttleInterval;
          if (needRefresh) {
            fetch().then(fetchedRes => {
              storeTimestamp().then(() => {
                if (fetchedRes.edited !== storedRes.edited) {
                  storeRes(fetchedRes).then(() =>
                    console.info(
                      `New data is available for ${uri}; please refresh.`
                    )
                  );
                }
              });
            });
          }
        });
        return storedRes;
      } else {
        return fetch().then(fetchedRes => {
          storeTimestamp().then(() => {
            storeRes(fetchedRes);
          });
          return fetchedRes;
        });
      }
    })
    .catch(error => console.error(error));
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

export function isRelatedResource(key, value) {
  const includesApiRoot = (res) => res.includes(API_ROOT);
  if (key === 'url') {
     return false;
  }
  if (typeof value === 'string') {
    return includesApiRoot(value);
  }
  if (Array.isArray(value)) {
    return value.every(includesApiRoot);
  }
  return false;
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
    .filter(key => isRelatedResource(key, item[key]))
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

export function getUrlId(url) {
  let urlSplitted = url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}

function api (endpoint) {
  const fullUrl = endpoint.includes(API_ROOT) ?
    endpoint :
    API_ROOT + endpoint;
  return fetch(fullUrl)
    .then(response => {
      return response.json();
    });
}

function validateResourceType(resourceType) {
  return resources.includes(resourceType) ?
    false :
    Promise.reject(`Invalid resource type '${resourceType}'`);
}

function extendWithId(resource) {
  return Object.assign({}, resource, {
    id: resource.url && getUrlId(resource.url)
  });
}

function getPageNumberFromUrl(url) {
  return url ? parseInt(Url.parse(url, true).query.page, 10) : undefined;
}

function getYear(film) {
  return new Date(film.release_date).getFullYear();
}
