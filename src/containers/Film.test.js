import React from 'react';
import ReactDOM from 'react-dom';
import Film from './Film';
import { mount } from 'enzyme'

describe('Film', () => {
  it('renders without crashing', () => {
    const match = { params: {} };
    mount(<Film match={match} />);
  });
});
