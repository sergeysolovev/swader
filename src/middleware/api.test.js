import * as api from './api';
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
  let fetch = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    consoleInfo = jest
      .spyOn(global.console, 'info')
      .mockImplementation(() => {})
  });

  afterEach(() => {
    mockdate.reset();
    jest.clearAllMocks();
    db.clearStores();
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
});
