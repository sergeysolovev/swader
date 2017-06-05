import React from 'react';
import ReactDOM from 'react-dom';
import Films from './Films';
import { mount } from 'enzyme';
import { Link, MemoryRouter } from 'react-router-dom';
import sinon from 'sinon'
import flushPromises from '../utils/flushPromises.js'

const sandbox = sinon.sandbox.create();

describe('Films', () => {
  afterEach(() => sandbox.restore());

  it('Films renders without crashing', () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => ({ results: [] })
    }));
    mount(<Films />);
  });

  it(`console.error for rejected fetch on /films`, () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject({}));
    global.console.error = jest.fn();
    const wrapper = mount(<Films />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe(
        `Failed to load 'films' from http://swapi.co`)
    });
  });

  it("renders empty list of 'films'", () => {
    const films = [];
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: films,
          count: films.length
        })
      }));
    global.console.error = jest.fn();
    const wrapper = mount(<Films />)
    return flushPromises().then(() => {
      expect(wrapper.find('table').length).toBe(1);
      expect(wrapper.text()).toMatch(`let starWarsFilmSeries = [];`);
      expect(wrapper.find(Link).exists()).toBe(false);
      expect(wrapper.find('tr').exists()).toBe(false);
      expect(wrapper.find('td').exists()).toBe(false);
      expect(wrapper.find('tbody').exists()).toBe(false);
    })
  });

  it('renders a list of films with links', () => {
    const episodeIV = {
      title: "A New Hope",
      episode_id: 4,
      release_date: "1977-05-25",
      opening_crawl: "",
      url: "http://swapi.co/api/films/1/"
    };
    const films = [episodeIV];
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: films,
          count: films.length
        })
      })
    );
    const wrapper = mount(
      <MemoryRouter>
        <Films />
      </MemoryRouter>
    );
    return flushPromises().then(() => {
      expect(wrapper.find('div.container').length).toBe(1);
      expect(wrapper.find('table').length).toBe(1);
      expect(wrapper.text()).toMatch('let starWarsFilmSeries = [');
      expect(wrapper.text()).toMatch('];');
      expect(wrapper.find(Link).at(0).props().to).toBe('/films/1');
      expect(wrapper.containsMatchingElement(
        <a href="/films/1">IV – A New Hope (1977)</a>)).toBe(true);
    });
  });

  it('console.error that setState can only update mounted/ing component', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ results: [] })
      }));
    sandbox.stub(Films.prototype, 'componentWillUnmount');
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toMatch(
        'Warning: setState(...): Can only update a mounted or mounting component.'
      );
    });
  });

  it('mounting and unmounting not causing errors', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ results: [] })
      }));
    mount(<Films />).unmount();
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });
});