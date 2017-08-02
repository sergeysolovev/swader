import * as api from './api';
import dbkv from 'idb-keyval';
import db from './db'
import mockdate from 'mockdate';
import flushPromises from '../utils/flushPromises'

jest.mock('./db', () => {
  let stores = {};
  let gets = {};
  let sets = {};
  let clears = {};

  const mock = function(objectStore) {
    ['', '.ts', '.hs'].forEach(suffix => {
      const storeKey = objectStore + suffix;
      stores[storeKey] = stores[storeKey] || {};
      gets[storeKey] = gets[storeKey] || jest.fn((key) => {
        return Promise.resolve(stores[storeKey][key])
      });
      sets[storeKey] = sets[storeKey] || jest.fn((key, value) => {
        stores[storeKey][key] = value;
        return Promise.resolve();
      });
    });

    return {
      get: gets[objectStore],
      set: sets[objectStore],
      ts: {
        get: gets[objectStore + '.ts'],
        set: sets[objectStore + '.ts'],
      },
      hs: {
        get: gets[objectStore + '.hs'],
        set: sets[objectStore + '.hs'],
      }
    };
  };

  mock.clearStores = function() {
    Object.keys(stores).forEach(storeKey => {
      Object.keys(stores[storeKey]).forEach(key =>
        delete stores[storeKey][key]
      );
    });
  }

  return mock;
});

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

describe('db', () => {
  it('supports get & set for multiple object stores', () => {
    return Promise.resolve()
      .then(() => db('people').set('people/1', 'Luke Skywalker'))
      .then(() => db('people')
        .get('people/1')
        .then(value => expect(value).toBe('Luke Skywalker'))
      )
      .then(() => db('planets')
        .get('people/1')
        .then(value => expect(value).toBeUndefined())
      )
      .then(() => db('planets').set('planets/1', 'Tatooine'))
      .then(() => db('planets')
        .get('planets/1')
        .then(value => expect(value).toBe('Tatooine'))
      )
      .then(() => expect(db('people').get).toBeCalled())
      .then(() => expect(db('planets').set).toBeCalled())
  });

  it(`has .timestamps that supports get & set
      for multiple object stores`, () => {
    return Promise.resolve()
      .then(() => db('people').ts.set('people/1', 'Luke Skywalker'))
      .then(() => db('people').ts
        .get('people/1')
        .then(value => expect(value).toBe('Luke Skywalker'))
      )
      .then(() => db('planets').ts
        .get('people/1')
        .then(value => expect(value).toBeUndefined())
      )
      .then(() => db('planets').ts.set('planets/1', 'Tatooine'))
      .then(() => db('planets').ts
        .get('planets/1')
        .then(value => expect(value).toBe('Tatooine'))
      )
      .then(() => expect(db('people').ts.get).toBeCalled())
      .then(() => expect(db('planets').ts.set).toBeCalled())
  });
})

describe('middleware/api', () => {
  const addSeconds = (date, seconds) => new Date(
    new Date(date).setSeconds(date.getSeconds() + seconds)
  );

  let consoleInfo;

  beforeEach(() => {
    consoleInfo = jest
      .spyOn(global.console, 'info')
      .mockImplementation(() => {})
  });

  afterEach(() => {
    mockdate.reset();
    jest.clearAllMocks();
    db.clearStores();
    dbkv.clear();
    consoleInfo.mockRestore();
  });

  describe('fetchResource', () => {
    const fetchStub = (resource) => Promise.resolve({ json: () => resource });

    const res = {
      edited: '2015-04-11T09:46:52.774897Z',
      url: api.API_ROOT + 'people/42/'
    };

    // todo: what if some operations fails
    // like db.get, db.set, fetch?

    it('attempts to get the resource from idb by its url', () => {
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => api.fetchResource('people', 42))
        .then(() => expect(db('people').get).toHaveBeenCalledWith(res.url));
    });

    it(`doesn't re-fetch less than 1-minute old resource`, () => {
      const now = new Date();
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => mockdate.set(addSeconds(now, 59)))
        .then(() => api.fetchResource('people', 42))
        .then(() => expect(fetch).not.toHaveBeenCalled());
    });

    it(`re-fetches 1-minute old resource`, () => {
      const now = new Date();
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => expect(fetch).not.toHaveBeenCalled())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResource('people', 42))
        .then(() => flushPromises())
        .then(() => expect(fetch).toHaveBeenCalled());
    });

    it(`sets fetched not existent resource to idb`, () => {
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => api.fetchResource('people', 42))
        .then(() => flushPromises())
        .then(() =>
          expect(db('people').set).toHaveBeenLastCalledWith(
            res.url,
            expect.objectContaining(res)
          )
        );
    });

    it(`re-sets a re-fetched resource to idb
        and informs the user that new data is available
        if it's 'edited' value is different`, () => {
      const now = new Date();
      const resEdited = { edited: 'different_timestamp' };
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(resEdited));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => db('people').set.mockClear())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResource('people', 42))
        .then(() => flushPromises())
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          expect(db('people').set).toBeCalledWith(res.url,
            expect.objectContaining({
              edited: resEdited.edited
            })
          );
          expect(consoleInfo).toBeCalledWith(
            `New data is available for ${res.url}; please refresh.`
          );
        });
    });

    it(`doesn't set a re-fetched resource to idb
        if it's 'edited' value is the same`, () => {
      const now = new Date();
      fetch.mockReturnValue(fetchStub(res));
      mockdate.set(now);
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => db('people').set.mockClear())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResource('people', 42))
        .then(() => flushPromises())
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          expect(db('people').set).not.toHaveBeenCalledWith(
            res.url,
            expect.any(Object)
          );
          expect(consoleInfo).not.toHaveBeenCalled();
        });
    });
  });

  describe('fetchResources', () => {
    const fetchStub = (resource) => Promise.resolve({ json: () => resource });

    const res = {
      url: api.API_ROOT + 'people/',
      results: [
        {
          created: '2014-12-10T14:23:31.880000Z',
          edited: '2015-04-11T09:46:52.774897Z',
          url: api.API_ROOT + 'people/42/'
        }
      ]
    };

    it('attempts to get the resource from idb by its url', () => {
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => api.fetchResources('people'))
        .then(() => expect(db('people').get).toHaveBeenCalledWith(res.url));
    });

    it(`doesn't re-fetch less than 1-minute old resource`, () => {
      const now = new Date();
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => mockdate.set(addSeconds(now, 59)))
        .then(() => api.fetchResources('people'))
        .then(() => expect(fetch).not.toHaveBeenCalled());
    });

    it(`re-fetches 1-minute old resource`, () => {
      const now = new Date();
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => expect(fetch).not.toHaveBeenCalled())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResources('people'))
        .then(() => flushPromises())
        .then(() => expect(fetch).toHaveBeenCalled());
    });

    it(`sets fetched resource with items,
        replaced with theirs urls, in idb and
        sets the items in idb as separate records`, () => {
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => api.fetchResources('people'))
        .then(() => flushPromises())
        .then(() => {
          const resItem = res.results[0];
          expect(db('people').set).toBeCalledWith(
            res.url,
            expect.objectContaining(Object.assign({}, res, { results: [resItem.url] }))
          );
          expect(db('people').set).toBeCalledWith(
            resItem.url,
            expect.objectContaining(resItem)
          );
        });
    });

    it(`re-sets a re-fetched resource and its items to idb
        and informs the user that new data is available
        if one of its items 'edited' values is different`, () => {
      const now = new Date();
      const resItem = res.results[0];
      const resEditedItem = Object.assign({}, resItem,
        {edited: resItem.edited + '-different'}
      );
      const resEdited = Object.assign({}, res,
        {results: [resEditedItem]}
      );
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(resEdited));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').set(resItem.url, resItem))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => db('people').set.mockClear())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResources('people'))
        .then(() => flushPromises())
        .then(() => {
          expect(fetch).toBeCalled();
          expect(db('people').set).toBeCalledWith(
            res.url,
            expect.objectContaining(Object.assign({}, res, { results: [resItem.url] }))
          );
          expect(db('people').set).toBeCalledWith(
            resEditedItem.url,
            expect.objectContaining(resEditedItem)
          );
          expect(consoleInfo).toBeCalledWith(
            `New data is available for ${res.url}; please refresh.`
          );
        });
    });

    it(`doesn't re-set a re-fetched resource or its items to idb
        if all of its items 'edited' values are the same`, () => {
      const now = new Date();
      const resItem = res.results[0];
      mockdate.set(now);
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => db('people').set(res.url, res))
        .then(() => db('people').set(resItem.url, resItem))
        .then(() => db('people').ts.set(res.url, now))
        .then(() => db('people').hs.set(res.url, 4094460650))
        .then(() => db('people').set.mockClear())
        .then(() => mockdate.set(addSeconds(now, 60)))
        .then(() => api.fetchResources('people'))
        .then(() => flushPromises())
        .then(() => {
          expect(fetch).toBeCalled();
          expect(db('people').set).not.toHaveBeenCalledWith(
            res.url,
            expect.any(Object)
          );
          expect(db('people').set).not.toHaveBeenCalledWith(
            resItem.url,
            expect.any(Object)
          );
          expect(consoleInfo).not.toHaveBeenCalled();
        });
    });
  });

  describe('fetchFilms', () => {
    const firstFilm = {
      created: '2014-12-10T14:23:31.880000Z',
      edited: '2015-04-11T09:46:52.774897Z'
    };
    const firstFilmEdited = {
      created: '2014-12-10T14:23:31.880000Z',
      edited: '2015-04-11T09:46:52.774898Z'
    };
    const createdFilm = {
      created: '2014-12-20T10:57:57.886000Z',
      edited: '2014-12-20T10:57:57.886000Z'
    };

    const fetchFilms = jest.spyOn(api, 'fetchFilms');
    const fetch = jest.spyOn(global, 'fetch');
    const fetchStub = (...args) => Promise.resolve({
      json() {
        return { results: args };
      }
    });

    it('calls fetch only once within 24 hours', () => {
      fetch.mockReturnValue(fetchStub(firstFilm));
      return Promise.resolve()
        .then(() => api.fetchFilms())
        .then(() => api.fetchFilms())
        .then(() => api.fetchFilms())
        .then(() => expect(fetch).toHaveBeenCalledTimes(1));
    });

    it('calls fetch again if last fetch was more than 24 hours ago', () => {
      const now = new Date();
      fetch.mockReturnValue(fetchStub(firstFilm));
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchFilms();
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(1))
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60 - 1));
          return api.fetchFilms();
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(1))
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(2));
    });

    it(`sets idb record with films, fetchedOn timestamp and hash`, () => {
      fetch.mockReturnValue(fetchStub(firstFilm));
      return api.fetchFilms()
        .then(() => {
          expect(dbkv.set).toBeCalledWith('films/', expect.objectContaining({
            fetchedOn: expect.any(Date),
            films: expect.any(Array),
            hash: expect.any(Number)
          }));
          const idbRecord = dbkv.set.mock.calls[0][1];
          expect((idbRecord.fetchedOn - new Date()) / 1000.0).toBeCloseTo(0);
          expect(idbRecord.films).toHaveLength(1);
          expect(idbRecord.hash).toEqual(4094460650);
        });
    });

    it('does not set idb record when fetched empty list', () => {
      fetch.mockReturnValue(fetchStub());
      return api.fetchFilms()
        .then(() => {
          expect(fetch).toBeCalled();
          expect(dbkv.set).not.toBeCalled();
        });
    });

    it(`does not update idb record
        when got the same values of all film.created, film.updated
        on refetch`, () => {
      fetch
        .mockReturnValue(fetchStub(firstFilm));
      const now = new Date();
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchFilms();
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(dbkv.set).toHaveBeenCalledTimes(1);
        });
    });

    it(`updates idb record
        when film.created or film.edited of any film changed
        on refetch`, () => {
      const now = new Date();
      fetch
        .mockReturnValueOnce(fetchStub(firstFilm))
        .mockReturnValueOnce(fetchStub(firstFilm, createdFilm))
        .mockReturnValueOnce(fetchStub(firstFilm, createdFilm))
        .mockReturnValueOnce(fetchStub(firstFilmEdited, createdFilm));
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchFilms(); })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(dbkv.set).toHaveBeenCalledTimes(1);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(dbkv.set).toHaveBeenCalledTimes(2);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 2 * 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(3);
          expect(dbkv.set).toHaveBeenCalledTimes(2);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 3 * 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(4);
          expect(dbkv.set).toHaveBeenCalledTimes(3);
        });
    });

    it(`does not update idb record
        when film.created or film.edited of any film changed
        on *failed* refetch`, () => {
      const now = new Date();
      fetch
        .mockReturnValueOnce(fetchStub(firstFilm))
        .mockReturnValueOnce(Promise.reject(new Error()))
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchFilms(); })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(dbkv.set).toHaveBeenCalledTimes(1);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(dbkv.set).toHaveBeenCalledTimes(1);
        });
    });
  })
});
