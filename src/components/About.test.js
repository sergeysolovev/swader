import React from 'react';
import About from './About';
import { LetObj, StringProp } from './Indent'
import { MemoryRouter, Link } from 'react-router-dom'
import { shallow, mount } from 'enzyme'

describe('About', () => {
  it('renders without crashing', () => {
    shallow(<About />);
  });

  it('renders the same name and version as in package.json', () => {
    const wrapper = shallow(<About />);
    const packageJson = require('../../package.json');
    expect(packageJson).toHaveProperty('version');
    expect(packageJson).toHaveProperty('name');
    expect(wrapper.find(LetObj).prop('name')).toBe(packageJson.name);
    const versionProp = wrapper
      .find(StringProp)
      .filterWhere(w => w.prop("name") === 'version');
    expect(versionProp).toHaveLength(1);
    expect(versionProp.first().prop("value")).toBe(packageJson.version);
  });

  it('renders links to all pages', () => {
    const pathes = [
      '/films',
      '/people',
      '/planets',
      '/starships',
      '/vehicles',
      '/species'
    ]
    const wrapper = mount(<MemoryRouter><About/></MemoryRouter>);
    pathes.forEach(path => {
      const link = wrapper
        .find(Link)
        .findWhere(w => w.prop('to') === path);
      expect(link).toHaveLength(1);
      expect(link.text()).toBe(path);
    });
  });
});
