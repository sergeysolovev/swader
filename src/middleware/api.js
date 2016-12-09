import Url from 'url'

const API_ROOT = 'http://swapi.co/api/'
const RESOURCE_TYPES = ['people', 'planets']

export const fetchResources = (resourceType, filter, page) => {
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

export const fetchResource = (resourceType, resourceId) => {
  validateResourceType(resourceType);
  let url = `${resourceType}/${resourceId}/`;
  return api(url)
    .then(json => ({item: json}))
    .catch(error => ({isError: true}));
}

const api = endpoint => {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ?
    API_ROOT + endpoint :
    endpoint;
  return fetch(fullUrl)
    .then(response => response.json());
}

const validateResourceType = resourceType => {
  if (!(RESOURCE_TYPES.includes(resourceType))) {
    return Promise.reject({isError: true});
  }
}

const extendWithId = resource =>
  Object.assign({}, resource, {id: getResourceId(resource)});

const getResourceId = (resource) => {
  let urlSplitted = resource.url.split('/');
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
