import * as api from './api';
import swdb from 'idb-keyval'

jest.mock('idb-keyval', () => {
  let store = {};
  return {
    get: jest.fn((key) => Promise.resolve(store[key])),
    set: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    keys: jest.fn(() => Object.keys(store)),
    clear: jest.fn(() => Object.keys(store).forEach(key => delete store[key]))
  }
});

describe('middleware/api', () => {
  afterEach(() => {
    jest.clearAllMocks();
    swdb.clear();
  });

  describe('fetchFilms', () => {
    const fetchFilms = jest.spyOn(api, 'fetchFilms');
    const fetch = jest.spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve({
        json() {
          return { results: [] };
        }
      }));

    it('calls fetch only once', () => {
      return Promise.resolve()
        .then(() => api.fetchFilms())
        .then(() => api.fetchFilms())
        .then(() => api.fetchFilms())
        .then(() => {
          expect(fetchFilms).toHaveBeenCalledTimes(3);
          expect(swdb.get).toHaveBeenCalledTimes(3);
          expect(swdb.set).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledTimes(1);
        });
    });
  })
});