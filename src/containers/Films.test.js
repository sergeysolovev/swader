import React from 'react';
import ReactDOM from 'react-dom';
import Films from './Films';
import { mount } from 'enzyme'

describe('Films', () => {
  it('renders without crashing', () => {
    mount(<Films />);
  });
});