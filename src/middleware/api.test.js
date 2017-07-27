import * as api from './api';
import db from 'idb-keyval';
import mockdate from 'mockdate';

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
  const addSeconds = (date, seconds) => new Date(
    new Date(date).setSeconds(date.getSeconds() + seconds)
  );

  const firstFilm = {
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2015-04-11T09:46:52.774897Z'
  };
  const firstFilmEdited = {
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2015-04-11T09:46:52.774898Z'
  };

  afterEach(() => {
    jest.clearAllMocks();
    db.clear();
    mockdate.reset();
  });

  describe('fetchResource', () => {
    const fetchStub = (resource) => Promise.resolve({
      json() { return resource; }
    });

    const res = {
      created: '2014-12-10T14:23:31.880000Z',
      edited: '2015-04-11T09:46:52.774897Z',
      // todo: remove
      url: 'http://swapi.co/api/people/42/'
    }

    it('calls fetch only once within 24 hours', () => {
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => api.fetchResource('people', 42))
        .then(() => api.fetchResource('people', 42))
        .then(() => api.fetchResource('people', 42))
        .then(() => expect(fetch).toHaveBeenCalledTimes(1));
    });

    it('calls fetch again if last fetch was more than 24 hours ago', () => {
      const now = new Date();
      fetch.mockReturnValue(fetchStub(res));
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchResource('people', 42);
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(1))
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60 - 1));
          return api.fetchResource('people', 42);
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(1))
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchResource('people', 42);
        })
        .then(() => expect(fetch).toHaveBeenCalledTimes(2));
    });

    it(`sets idb record with films, fetchedOn timestamp and hash`, () => {
      fetch.mockReturnValue(fetchStub(res));
      return api.fetchResource('people', 42)
        .then(() => {
          expect(db.set).toBeCalledWith(api.API_ROOT + `people/42/`, expect.objectContaining({
            fetchedOn: expect.any(Date),
            res: expect.objectContaining({
              created: expect.any(String),
              edited: expect.any(String)
            }),
            hash: expect.any(Number)
          }));
          const idbRecord = db.set.mock.calls[0][1];
          expect((idbRecord.fetchedOn - new Date()) / 1000.0).toBeCloseTo(0);
          expect(idbRecord.hash).toEqual(4094460650);
        });
    });

    it(`does not update idb record
        when got the same values of res.created, res.updated
        on refetch`, () => {
      fetch
        .mockReturnValue(fetchStub(res));
      const now = new Date();
      return Promise.resolve()
        .then(() => {
          mockdate.set(now);
          return api.fetchResource('people', 42)
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchResource('people', 42)
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(db.set).toHaveBeenCalledTimes(1);
        });
    });
  });

  describe('fetchFilms', () => {
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
          expect(db.set).toBeCalledWith('films/', expect.objectContaining({
            fetchedOn: expect.any(Date),
            films: expect.any(Array),
            hash: expect.any(Number)
          }));
          const idbRecord = db.set.mock.calls[0][1];
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
          expect(db.set).not.toBeCalled();
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
          expect(db.set).toHaveBeenCalledTimes(1);
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
          expect(db.set).toHaveBeenCalledTimes(1);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(db.set).toHaveBeenCalledTimes(2);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 2 * 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(3);
          expect(db.set).toHaveBeenCalledTimes(2);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 3 * 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(4);
          expect(db.set).toHaveBeenCalledTimes(3);
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
          expect(db.set).toHaveBeenCalledTimes(1);
        })
        .then(() => {
          mockdate.set(addSeconds(now, 24 * 60 * 60));
          return api.fetchFilms();
        })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
          expect(db.set).toHaveBeenCalledTimes(1);
        });
    });
  })
});
