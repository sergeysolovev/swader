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

  it('does not crash when fetching of film rejects', () => {
    fetchFilm.mockImplementation(() => Promise.reject(new Error()));
    mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).not.toBeCalled();
    });
  });

  it('does not crash when fetching of film resources rejects', () => {
    fetchFilm.mockImplementation(() => Promise.resolve({}));
    fetchFilmResources.mockImplementation(() => Promise.reject(new Error()));
    mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).toBeCalled();
    })
  });

  it(`renders DOM of empty Film`, () => {
    fetchFilm.mockReturnValue(Promise.resolve({}));
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
    const wrapper = mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).toBeCalled();
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.text()).toMatch('let film = {');
      expect(wrapper.text()).toMatch('};');
      expect(wrapper.find(Link).exists()).toBeFalsy();
      stringProps.forEach(name => {
        const matchingProps = wrapper
          .find(StringProp)
          .filterWhere(w => w.prop("name") === name);
        expect(matchingProps).toHaveLength(1);
        expect(matchingProps.first().prop("value")).toBeUndefined();
      });
      relatedResourcesProps.forEach(name => {
        const matchingProps = wrapper
          .find(RelatedResourcesProp)
          .filterWhere(w => w.prop("name") === name);
        expect(matchingProps).toHaveLength(1);
        expect(matchingProps.first().prop("value")).toBeUndefined();
      });
    });
  });

  it(`shows two times console error that
      setState can only update mounted/ing component`, () => {
    fetchFilm.mockReturnValue(Promise.resolve({}));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
      expect(consoleError).toHaveBeenLastCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchFilm.mockReturnValue(Promise.resolve({}));
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      expect(fetchFilm).toBeCalled();
      expect(fetchFilmResources).not.toBeCalled();
      expect(consoleError).not.toBeCalled();
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
