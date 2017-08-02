import React from 'react';
import Films from './Films';
import { Link, MemoryRouter } from 'react-router-dom';
import flushPromises from '../utils/flushPromises.js'
import { mount, shallow } from 'enzyme';
import * as api from '../middleware/api.js'

describe('Films', () => {
  let consoleError;
  let fetchResources;
  let componentWillUnmount;

  beforeEach(() => {
    consoleError = jest.spyOn(global.console, 'error');
    fetchResources = jest.spyOn(api, 'fetchResources');
    componentWillUnmount = jest.spyOn(Films.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    consoleError.mockRestore();
    fetchResources.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    shallow(<Films />);
  });

  it('does not crash when fetching of films rejects', () => {
    fetchResources.mockImplementation(() => Promise.reject(new Error()));
    mount(<Films />);
    return flushPromises().then(() => {
      expect(fetchResources).toBeCalled();
    });
  });

  it("renders empty list of films", () => {
    fetchResources.mockImplementation(() => Promise.resolve([]));
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
    const film = {
      episode_id: 4,
      title: 'A New Hope',
      release_date: '1977-05-25',
      id: '1',
      url: api.API_ROOT + 'films/1/'
    };
    const films = { results: [film] };
    fetchResources.mockImplementation(() => Promise.resolve(films));
    const wrapper = mount(<MemoryRouter><Films/></MemoryRouter>);
    return flushPromises().then(() => {
      expect(wrapper.find('div.container')).toHaveLength(1);
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.text()).toMatch('let starWarsFilmSeries = [');
      expect(wrapper.text()).toMatch('];');
      expect(wrapper.find(Link).at(0).props().to).toBe('films/1');
      expect(wrapper.containsMatchingElement(
        <a href="films/1">IV – A New Hope (1977)</a>)).toBeTruthy();
    });
  });

  it(`shows console error that
      setState can only update mounted/ing component`, () => {
    fetchResources.mockReturnValue(Promise.resolve([]));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchResources).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchResources.mockReturnValue(Promise.resolve([]));
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      expect(fetchResources).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});
