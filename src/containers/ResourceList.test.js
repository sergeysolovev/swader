import React from 'react';
import ReactDOM from 'react-dom';
import ResourceList from './ResourceList';
import InfiniteScroll from 'react-infinite-scroller'
import { MemoryRouter, Link } from 'react-router-dom'
import { matchPath } from 'react-router'
import { mount } from 'enzyme'
import sinon from 'sinon'
import flushPromises from '../utils/flushPromises'

const sandbox = sinon.sandbox.create();

describe('ResourceList', () => {
  const resources = [
    'people',
    'planets',
    'starships',
    'species',
    'vehicles'
  ];

  const pathOf = (res) => `/${res}`

  afterEach(() => sandbox.restore());

  it('renders without crashing', () => {
    const match = { params: { resourceType: '' } };
    const wrapper = mount(<ResourceList match={match} />);
  })

  resources.forEach(res =>
    it(`console.error for rejected fetch on ${pathOf(res)}`, () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.reject({}));
      global.console.error = jest.fn();
      const match = matchPath(pathOf(res), {
        path: '/:resourceType',
        exact: true,
        strict: false
      });
      const wrapper = mount(<ResourceList match={match} />);
      return flushPromises().then(() => {
        expect(console.error.mock.calls.length).toBe(1);
        expect(console.error.mock.calls[0][0]).toBe(
          `Failed to load '${res}' from http://swapi.co`)
      });
    })
  );

  it(`console.error for resource type other than: ${resources}`, () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ results: [] })
      }));
    global.console.error = jest.fn();
    const invalidResource = 'aliens';
    const match = matchPath(pathOf(invalidResource), {
      path: '/:resourceType',
      exact: true,
      strict: false
    });
    const wrapper = mount(<ResourceList match={match} />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe(
        "Invalid resource type 'aliens'")
    });
  });

  resources.forEach(res =>
    it(`renders empty list of '${res}'`, () => {
      const results = [];
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => ({
            results,
            count: results.length
          })
        }));
      global.console.error = jest.fn();
      const match = matchPath(pathOf(res), {
        path: '/:resourceType',
        exact: true,
        strict: false
      });
      const wrapper = mount(<ResourceList match={match} />)
      return flushPromises().then(() => {
        expect(wrapper.find('table').length).toBe(2);
        expect(wrapper.text()).toMatch(`let ${res} = {`);
        expect(wrapper.text()).toMatch('results: []');
        expect(wrapper.text()).toMatch('count: "0"');
        expect(wrapper.text()).toMatch('};');
        expect(wrapper.find(Link).exists()).toBe(false);
        expect(wrapper.find(InfiniteScroll).exists()).toBe(true);
      })
    })
  );

  it('renders a list of characters with links', () => {
    const lukeSkywalker = {
      name: "Luke Skywalker",
      url: "http://swapi.co/api/people/1/"
    };
    const dartVader = {
      name: "Darth Vader",
      url: "http://swapi.co/api/people/4/"
    };
    const people = [lukeSkywalker, dartVader];
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          count: people.length,
          nextPage: undefined,
          results: people
        })
      })
    );
    const match = matchPath('/people', {
      path: '/:resourceType',
      exact: true,
      strict: false
    });
    const wrapper = mount(
      <MemoryRouter>
        <ResourceList match={match} />
      </MemoryRouter>
    );
    return flushPromises().then(() => {
      expect(wrapper.find('div.container').length).toBe(1);
      expect(wrapper.find('table').length).toBe(2);
      expect(wrapper.text()).toMatch('let people = {');
      expect(wrapper.text()).toMatch('};');
      expect(wrapper.find(Link).at(0).props().to).toBe('/people/1');
      expect(wrapper.find(Link).at(1).props().to).toBe('/people/4');
      expect(wrapper.find(InfiniteScroll).exists()).toBe(true);
      expect(wrapper.containsMatchingElement(
        <a href="/people/1">Luke Skywalker</a>)).toBe(true);
      expect(wrapper.containsMatchingElement(
        <a href="/people/4">Darth Vader</a>)).toBe(true);
    });
  });

  it('console.error that setState can only update mounted/ing component', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ results: [] })
      }));
    const match = { params: { resourceType: 'people' } };
    sandbox.stub(ResourceList.prototype, 'componentWillUnmount');
    mount(<ResourceList match={match} />).unmount();
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
    const match = { params: { resourceType: 'people' } };
    mount(<ResourceList match={match} />).unmount();
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });
});



