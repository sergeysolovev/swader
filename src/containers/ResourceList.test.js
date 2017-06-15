import React from 'react';
import ResourceList from './ResourceList';
import { StringProp, QuotedProp, AutofetchRelatedResourcesProp } from '../components/Indent'
import { MemoryRouter, Link } from 'react-router-dom'
import { shallow, mount } from 'enzyme'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api.js'

describe('ResourceList', () => {
  const match = { params: { resourceType: '' } }

  let fetchResources;
  let consoleError;
  let componentWillUnmount;

  beforeEach(() => {
    fetchResources = jest.spyOn(api, 'fetchResources');
    consoleError = jest.spyOn(global.console, 'error');
    componentWillUnmount = jest.spyOn(
      ResourceList.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    fetchResources.mockRestore();
    consoleError.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('ResourceList renders without crashing', () => {
    shallow(<ResourceList match={match} />);
  });

  it('does not crash when fetching of resources rejects', () => {
    fetchResources.mockImplementation(() => Promise.reject(new Error()));
    mount(<ResourceList match={match} />);
    return flushPromises().then(() => {
      expect(fetchResources).toBeCalled();
    });
  });

  it('renders empty list of resources', () => {
    const resources = { items: [], count: 0 };
    fetchResources.mockImplementation(() => Promise.resolve(resources));
    const wrapper = mount(<ResourceList match={match} />);
    return flushPromises().then(() => {
      expect(wrapper.find('table')).toHaveLength(2);
      expect(wrapper.text()).toMatch(/let [\w]* = {/);
      expect(wrapper.find(Link)).toHaveLength(0);

      const quotedProp = wrapper
        .find(QuotedProp)
        .filterWhere(w => w.prop("name") === 'query');
      expect(quotedProp).toHaveLength(1);
      expect(quotedProp.first().children().find('input')).toHaveLength(1);

      const countProp = wrapper
        .find(StringProp)
        .filterWhere(w => w.prop("name") === 'count');
      expect(countProp).toHaveLength(1);
      expect(countProp.first().prop("value")).toBe(resources.count);

      const arrayProp = wrapper
        .find(AutofetchRelatedResourcesProp)
        .filterWhere(w => w.prop("name") === 'results');
      expect(arrayProp).toHaveLength(1);
      expect(arrayProp.first().prop("items")).toEqual(resources.items);
    })
  });

  it('renders a list of characters with links', () => {
    const match = { params: { resourceType: 'people' } };
    const lukeSkywalker = { name: "Luke Skywalker", id: 1 };
    const dartVader = { name: "Darth Vader", id: 4 };
    const resources = { items: [lukeSkywalker, dartVader] };
    fetchResources.mockImplementation(() => Promise.resolve(resources));
    const wrapper = mount(
      <MemoryRouter>
        <ResourceList match={match} />
      </MemoryRouter>
    );
    return flushPromises().then(() => {
      expect(wrapper.find('div.container')).toHaveLength(1);
      expect(wrapper.find('table')).toHaveLength(2);
      expect(wrapper.text()).toMatch(/let [\w]* = {/);
      expect(wrapper.text()).toMatch('};');
      expect(wrapper.find(Link).at(0).props().to).toBe('/people/1');
      expect(wrapper.find(Link).at(1).props().to).toBe('/people/4');
      expect(wrapper.containsMatchingElement(
        <a href="/people/1">Luke Skywalker</a>)).toBe(true);
      expect(wrapper.containsMatchingElement(
        <a href="/people/4">Darth Vader</a>)).toBe(true);
    });
  });

  it(`shows console error that
      setState can only update mounted/ing component`, () => {
    fetchResources.mockImplementation(() => Promise.resolve({}));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<ResourceList match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchResources).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchResources.mockImplementation(() => Promise.resolve({}));
    mount(<ResourceList match={match} />).unmount();
    return flushPromises().then(() => {
      expect(fetchResources).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});



