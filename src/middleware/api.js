import Url from 'url'

const API_ROOT = 'http://swapi.co/api/'

export const fetchPeople = url => {
  return api(url)
    .then(json => ({
       people: json.results,
       url: url,
       nextPageUrl: json.next,
       prevPageUrl: json.previous,
       pageNumber: getCurrentPageNumber(json.next, json.previous) }));
}

const api = endpoint => {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ?
    API_ROOT + endpoint :
    endpoint;
  return fetch(fullUrl)
    .then(response => response.json());
}

const getCurrentPageNumber = (nextPageUrl, prevPageUrl) => {
  const getPageNumberFromUrl = url =>
    Url.parse(url, true).query.page;
  if (nextPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) - 1;
  } else if (prevPageUrl) {
    return getPageNumberFromUrl(nextPageUrl) + 1;
  } else {
    return 1;
  }
}
