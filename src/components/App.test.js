import React from 'react';
import App from './App';
import { shallow } from 'enzyme'
import Nav from './Nav'
import Main from './Main'

describe('App', () => {
  it('renders without crashing', () => {
    shallow(<App />);
  });

  it('App has Nav and Main components', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(Nav)).toHaveLength(1);
    expect(wrapper.find(Main)).toHaveLength(1);
  });
});
