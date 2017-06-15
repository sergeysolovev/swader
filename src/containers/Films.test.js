import React from 'react';
import Films from './Films';
import { Link, MemoryRouter } from 'react-router-dom';
import flushPromises from '../utils/flushPromises.js'
import { mount, shallow } from 'enzyme';
import * as api from '../middleware/api.js'

describe('Films', () => {
  let consoleError;
  let fetchFilms;
  let componentWillUnmount;

  beforeEach(() => {
    consoleError = jest.spyOn(global.console, 'error');
    fetchFilms = jest.spyOn(api, 'fetchFilms');
    componentWillUnmount = jest.spyOn(Films.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    consoleError.mockRestore();
    fetchFilms.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    shallow(<Films />);
  });

  it('does not crash when fetching of films rejects', () => {
    fetchFilms.mockImplementation(() => Promise.reject(new Error()));
    mount(<Films />);
    return flushPromises().then(() => {
      expect(fetchFilms).toBeCalled();
    });
  });

  it("renders empty list of films", () => {
    fetchFilms.mockImplementation(() => Promise.resolve([]));
    const wrapper = mount(<Films />);
    return flushPromises().then(() => {
      expect(wrapper.find('table').length).toBe(1);
      expect(wrapper.text()).toMatch(`let starWarsFilmSeries = [];`);
      expect(wrapper.find(Link)).toHaveLength(0);
      expect(wrapper.find('tr')).toHaveLength(0);
      expect(wrapper.find('td')).toHaveLength(0);
      expect(wrapper.find('tbody')).toHaveLength(0);
    })
  });

  it('renders a list of one film', () => {
    const film = {displayName: 'value', path: 'films/1/'};
    fetchFilms.mockImplementation(() => Promise.resolve([film]));
    const wrapper = mount(<MemoryRouter><Films/></MemoryRouter>);
    return flushPromises().then(() => {
      expect(wrapper.find('div.container')).toHaveLength(1);
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.text()).toMatch('let starWarsFilmSeries = [');
      expect(wrapper.text()).toMatch('];');
      expect(wrapper.find(Link).at(0).props().to).toBe(film.path);
      expect(wrapper.containsMatchingElement(
        <a href={film.path}>{film.displayName}</a>)).toBeTruthy();
    });
  });

  it(`shows console error that
      setState can only update mounted/ing component`, () => {
    fetchFilms.mockReturnValue(Promise.resolve([]));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchFilms).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchFilms.mockReturnValue(Promise.resolve([]));
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      expect(fetchFilms).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});