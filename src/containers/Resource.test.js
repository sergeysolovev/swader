import React from 'react';
import ReactDOM from 'react-dom';
import Resource from './Resource';
import { MemoryRouter, Link } from 'react-router-dom'
import { matchPath } from 'react-router'
import { mount } from 'enzyme'
import sinon from 'sinon'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api'

const resources = [
  'people',
  'planets',
  'starships',
  'species',
  'vehicles'
];

const pathOf = (res, id = 1) => `/${res}/${id}/`

const sandbox = sinon.sandbox.create();

describe('Resource', () => {
  afterEach(() => sandbox.restore());

  it('Resource should render without crashes', () => {
    global.console.error = jest.fn();
    const match = { params: { resourceType: '' } };
    mount(<Resource match={match} />);
  });

  resources.forEach(res =>
    it(`console.error for rejected fetch on ${pathOf(res)}`, () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.reject({}));
      global.console.error = jest.fn();
      const match = { params: { resourceType: res, id: '1' } };
      mount(<Resource match={match} />);
      return flushPromises().then(() => {
        expect(console.error.mock.calls.length).toBe(1);
        expect(console.error.mock.calls[0][0]).toBe(
          `Failed to load ${pathOf(res)} from http://swapi.co`)
      });
    })
  );

  it(`console.error for resource type other than: ${resources}`, () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ url: 'http://swapi.co/api/aliens/1/' })
      }));
    global.console.error = jest.fn();
    const invalidResource = 'aliens';
    const match = { params: { resourceType: invalidResource, id: '1' } };
    const wrapper = mount(<Resource match={match} />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe(
        "Invalid resource type 'aliens'")
    });
  });

  resources.forEach(res =>
    it(`renders empty '${res}' Resource`, () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => ({ url: `http://swapi.co/api/${res}/1/` })
        }));
      global.console.error = jest.fn();
      const match = { params: { resourceType: res, id: '1' } };
      const wrapper = mount(<Resource match={match} />)
      return flushPromises().then(() => {
        expect(wrapper.find('table').length).toBe(1);
        expect(wrapper.text()).toMatch(`let ${res}Item = {};`);
        expect(wrapper.find(Link).exists()).toBe(false);
      })
    })
  );

  it('console.error that setState can only update mounted/ing component', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ url: 'http://swapi.co/api/whatever/1/' })
      }));
    const match = { params: { resourceType: 'people', id: '1' } };
    sandbox.stub(Resource.prototype, 'componentWillUnmount');
    mount(<Resource match={match} />).unmount();
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
        json: () => ({ url: 'http://swapi.co/api/whatever/1/' })
      }));
    const match = { params: { resourceType: 'people', id: '1' } };
    let wrapper;
    let stub = sinon
      .stub(api, 'fetchRelatedResources')
      .callsFake(item => {
        stub.restore();
        wrapper.unmount();
        return api.fetchRelatedResources(item);
      });
    wrapper = mount(<Resource match={match} />);
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });

  it('mounting and unmounting not causing errors', () => {
    global.console.error = jest.fn();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => ({ url: 'http://swapi.co/api/whatever/1/' })
      }));
    const match = { params: { resourceType: 'people', id: '1' } };
    mount(<Resource match={match} />).unmount();
    return flushPromises().then(() => {
      expect(console.error.mock.calls.length).toBe(0);
    });
  });
});