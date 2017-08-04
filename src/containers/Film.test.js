import React from 'react';
import Film from './Film';
import { MemoryRouter, Link } from 'react-router-dom'
import { StringProp, RelatedResourcesProp } from '../components/Indent'
import { shallow, mount } from 'enzyme'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api'

describe('Film', () => {
  const match = { params: { id: '' } };

  let consoleError;
  let fetchResource;
  let fetchRelatedResources;
  let componentWillUnmount;

  beforeEach(() => {
    consoleError = jest.spyOn(global.console, 'error');
    fetchResource = jest.spyOn(api, 'fetchResource');
    fetchRelatedResources = jest.spyOn(api, 'fetchRelatedResources');
    componentWillUnmount = jest.spyOn(Film.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    consoleError.mockRestore();
    fetchResource.mockRestore();
    fetchRelatedResources.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    shallow(<Film match={match} />);
  });

  it('does not crash when fetching of film rejects', () => {
    fetchResource.mockImplementation(() => Promise.reject(new Error()));
    mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).not.toBeCalled();
    });
  });

  it('does not crash when fetching of film resources rejects', () => {
    fetchResource.mockImplementation(() => Promise.resolve({}));
    fetchRelatedResources.mockImplementation(() => Promise.reject(new Error()));
    mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).toBeCalled();
    })
  });

  it(`renders without crashing and errors when offline`, () => {
    fetchResource.mockImplementation(() =>
      Promise.resolve({ notAvailableOffline: true })
    );
    const wrapper = mount(<Film match={match} />)
    return flushPromises().then(() => {
      expect(consoleError).not.toHaveBeenCalled();
    })
  })

  it(`doesn't show related resources not available offline`, () => {
    fetchResource.mockImplementation(() => Promise.resolve({
      people: [
        api.API_ROOT + 'people/1/',
        api.API_ROOT + 'people/2/',
      ]
    }));
    fetchRelatedResources.mockImplementation(() => Promise.resolve({
      characters: [
        { notAvailableOffline: true },
        { name: 'Someone' }
      ]
    }));
    const wrapper = mount(
      <MemoryRouter>
        <Film match={match} />
      </MemoryRouter>
    );
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).toBeCalled();
      expect(wrapper.text()).toMatch(
        /characters: \[Someone\]/
      );
    })
  })

  it(`renders DOM of empty Film`, () => {
    fetchResource.mockReturnValue(Promise.resolve({}));
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
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).toBeCalled();
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.text()).toMatch('let film = {');
      expect(wrapper.text()).toMatch('};');
      expect(wrapper.find(Link).exists()).toBeFalsy();
      stringProps.forEach(name => {
        const matchingProps = wrapper
          .find(StringProp)
          .filterWhere(w => w.prop("name") === name);
        expect(matchingProps).toHaveLength(1);
        expect(matchingProps.first().prop("value")).toBeFalsy();
      });
      relatedResourcesProps.forEach(name => {
        const matchingProps = wrapper
          .find(RelatedResourcesProp)
          .filterWhere(w => w.prop("name") === name);
        expect(matchingProps).toHaveLength(1);
        expect(matchingProps.first().prop("value")).toBeFalsy();
      });
    });
  });

  it(`shows two times console error that
      setState can only update mounted/ing component`, () => {
    fetchResource.mockReturnValue(Promise.resolve({}));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
      expect(consoleError).toHaveBeenLastCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchResource.mockReturnValue(Promise.resolve({}));
    mount(<Film match={match} />).unmount();
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).not.toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });

  it(`unmounting after @fetchResource and before @fetchRelatedResources
      not causing errors`, () => {
    let wrapper;
    fetchResource.mockReturnValue(Promise.resolve({}));
    fetchRelatedResources.mockImplementation(() => {
      wrapper.unmount();
      return Promise.resolve({});
    });
    wrapper = mount(<Film match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelatedResources).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});
