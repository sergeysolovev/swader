import React from 'react';
import ReactDOM from 'react-dom';
import Film from './Film';
import { MemoryRouter, Link } from 'react-router-dom'
import { StringProp, RelatedResourcesProp } from '../components/Indent'
import { matchPath } from 'react-router'
import { mount } from 'enzyme'
import sinon from 'sinon'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api'


const sandbox = sinon.sandbox.create();
const path = '/films/1/';
const match = matchPath(path, {
  path: '/:resourceType/:id',
  exact: true,
  strict: false
});
const film = {
  title: "A New Hope",
  episode_id: 4,
  release_date: "1977-05-25",
  opening_crawl: "",
  url: "http://swapi.co/api/films/1/"
};

describe('Film', () => {
  afterEach(() => sandbox.restore());

  it('renders without crashing', () => {
    const match = { params: { id: '' } };
    mount(<Film match={match} />);
  });

  it(`console.error for rejected fetch on ${path}`, () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject({}));
    global.console.error = jest.fn();
    mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe(
        `Failed to load ${path} from http://swapi.co`)
    });
  })

  it(`renders empty Film`, () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ url: `http://swapi.co/api/films/1/` })
      }));
    global.console.error = jest.fn();
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
    const wrapper = mount(<Film match={match} />)
    return flushPromises().then(() => {
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
    })
  })

  it('console.error that setState can only update mounted/ing component', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => film
      }));
    sandbox.stub(Film.prototype, 'componentWillUnmount');
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(console.error.mock.calls.length).toBe(2);
      expect(console.error.mock.calls[0][0]).toMatch(msg);
      expect(console.error.mock.calls[1][0]).toMatch(msg);
    });
  });

  it(`unmounting after @fetchResource and before @fetchRelatedResources
      not causing errors`, () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => film
      }));
    let wrapper;
    let stub = sinon
      .stub(api, 'fetchFilmResources')
      .callsFake(item => {
        stub.restore();
        wrapper.unmount();
        return api.fetchFilmResources(item);
      });
    wrapper = mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });

  it('mounting and unmounting not causing errors', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => film
      }));
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });
});
