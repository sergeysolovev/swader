import React from 'react';
import Film from './Film';
import { Link } from 'react-router-dom'
import { StringProp, RelatedResourcesProp } from '../components/Indent'
import { shallow, mount } from 'enzyme'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api'

describe('Film', () => {
  const match = { params: { id: '' } };

  let consoleError;
  let fetchFilm;
  let fetchFilmResources;
  let componentWillUnmount;

  beforeEach(() => {
    consoleError = jest.spyOn(global.console, 'error');
    fetchFilm = jest.spyOn(api, 'fetchFilm');
    fetchFilmResources = jest.spyOn(api, 'fetchFilmResources');
    componentWillUnmount = jest.spyOn(Film.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    consoleError.mockRestore();
    fetchFilm.mockRestore();
    fetchFilmResources.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    shallow(<Film match={match} />);
  });

  it(`renders DOM of empty Film`, () => {
    const emptyFilm = {};
    const emptyResources = {
      characters: [],
      planets: [],
      starships: [],
      species: [],
      vehicles: []
    };
    fetchFilm
      .mockReturnValueOnce(Promise.resolve(emptyFilm))
      .mockReturnValueOnce(Promise.resolve({}));
    fetchFilmResources
      .mockReturnValueOnce(Promise.resolve(emptyResources))
      .mockReturnValueOnce(Promise.resolve({}));
    const stringProps = [
      'episode',
      'title',
      'released_on',
      'directed_by',
      'produced_by',
      'opening'
    ];
    const relatedResourcesProps = [
      'characters',
      'starships',
      'planets',
      'species',
      'vehicles'
    ];
    const mounted = [
      mount(<Film match={match} />),
      mount(<Film match={match} />)
    ];
    return flushPromises().then(() => {
      expect(fetchFilm).toHaveBeenCalledTimes(2);
      expect(fetchFilmResources).toHaveBeenCalledTimes(2);
      mounted.forEach(wrapper => {
        expect(wrapper.find('table').length).toBe(1);
        expect(wrapper.text()).toMatch('let film = {');
        expect(wrapper.text()).toMatch('};');
        expect(wrapper.find(Link).exists()).toBe(false);
        stringProps.forEach(name => {
          const matchingProps = wrapper
            .find(StringProp)
            .filterWhere(w => w.prop("name") === name);
          expect(matchingProps.length).toBe(1);
          expect(matchingProps.first().prop("value")).toBe(undefined);
        });
        relatedResourcesProps.forEach(name => {
          const matchingProps = wrapper
            .find(RelatedResourcesProp)
            .filterWhere(w => w.prop("name") === name);
          expect(matchingProps.length).toBe(1);
          expect(matchingProps.first().prop("value")).toBe(undefined);
        });
      });
    });
  });

  it(`shows two times console error that
      setState can only update mounted/ing component`, () => {
    consoleError.mockImplementation(() => {});
    fetchFilm.mockReturnValue(Promise.resolve({}));
    fetchFilmResources.mockReturnValue(Promise.resolve({}));
    componentWillUnmount.mockImplementation(() => {});
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchFilm).toHaveBeenCalledTimes(1);
      expect(fetchFilmResources).toHaveBeenCalledTimes(1);
      expect(componentWillUnmount).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError.mock.calls[0][0]).toMatch(msg);
      expect(consoleError.mock.calls[1][0]).toMatch(msg);
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchFilm.mockReturnValue(Promise.resolve({}));
    fetchFilmResources.mockReturnValue(Promise.resolve({}));
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).not.toBeCalled();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  it(`unmounting after @fetchResource and before @fetchRelatedResources
      not causing errors`, () => {
    let wrapper;
    fetchFilm.mockReturnValue(Promise.resolve({}));
    fetchFilmResources.mockImplementation(() => {
      wrapper.unmount();
      return Promise.resolve({});
    });
    wrapper = mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});
