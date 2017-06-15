import React from 'react';
import Resource from './Resource';
import { Link } from 'react-router-dom'
import { shallow, mount } from 'enzyme'
import flushPromises from '../utils/flushPromises'
import * as api from '../middleware/api'

describe('Resource', () => {
  const match = { params: { resourceType: '' } };

  let fetchResource;
  let fetchRelated;
  let consoleError;
  let componentWillUnmount;

  beforeEach(() => {
    fetchResource = jest.spyOn(api, 'fetchResource');
    fetchRelated = jest.spyOn(api, 'fetchRelatedResources');
    consoleError = jest.spyOn(global.console, 'error');
    componentWillUnmount = jest.spyOn(Resource.prototype, 'componentWillUnmount');
  });

  afterEach(() => {
    fetchResource.mockRestore();
    fetchRelated.mockRestore();
    consoleError.mockRestore();
    componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    shallow(<Resource match={match} />);
  });

  it('does not crash when fetching of resource rejects', () => {
    fetchResource.mockImplementation(() => Promise.reject(new Error()));
    mount(<Resource match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelated).not.toBeCalled();
    });
  });

  it('does not crash when fetching of related resources rejects', () => {
    fetchResource.mockImplementation(() => Promise.resolve({}));
    fetchRelated.mockImplementation(() => Promise.reject(new Error()));
    mount(<Resource match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelated).toBeCalled();
    })
  });

  it(`renders empty Resource`, () => {
    fetchResource.mockImplementation(() => Promise.resolve({}));
    const wrapper = mount(<Resource match={match} />)
    return flushPromises().then(() => {
      expect(fetchRelated).toBeCalled();
      expect(fetchRelated).toBeCalled();
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.text()).toMatch(/let [\w]+ = {};/);
      expect(wrapper.find(Link)).toHaveLength(0);
    })
  })

  it(`shows two times console error that
      setState can only update mounted/ing component`, () => {
    fetchResource.mockReturnValue(Promise.resolve({}));
    consoleError.mockImplementation(() => {});
    componentWillUnmount.mockImplementation(() => {});
    mount(<Resource match={match} />).unmount();
    return flushPromises().then(() => {
      const msg = 'Warning: setState(...): Can only update a mounted or';
      expect(fetchResource).toBeCalled();
      expect(fetchRelated).toBeCalled();
      expect(componentWillUnmount).toBeCalled();
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError).toBeCalledWith(expect.stringContaining(msg));
      expect(consoleError).toHaveBeenLastCalledWith(expect.stringContaining(msg));
    });
  });

  it('mounts and unmounts without errors', () => {
    fetchResource.mockReturnValue(Promise.resolve({}));
    mount(<Resource match={match} />).unmount();
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelated).not.toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });

  it(`unmounting after @fetchResource and before @fetchRelatedResources
      not causing errors`, () => {
    let wrapper;
    fetchResource.mockReturnValue(Promise.resolve({}));
    fetchRelated.mockImplementation(() => {
      wrapper.unmount();
      return Promise.resolve({});
    });
    wrapper = mount(<Resource match={match} />);
    return flushPromises().then(() => {
      expect(fetchResource).toBeCalled();
      expect(fetchRelated).toBeCalled();
      expect(consoleError).not.toBeCalled();
    });
  });
});