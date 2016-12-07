import React, { Component, PropTypes } from 'react'
import PersonDetails from '../components/PersonDetails'
import api from '../middleware/api'

export default class PersonDetailsContainer extends React.Component {
  static propTypes = {
    onGetBackToListClick: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      person: null
    }
  }
  componentWillMount() {
    api(this.props.personUrl)
      .then(data => this.setState({person: data}));
  }
  render() {
    let person = this.state.person;
    if (person) {
      return <PersonDetails person={person}
        onGetBackToListClick={this.props.onGetBackToListClick} />;
    } else {
      return <h1>Loading person...</h1>;
    }
  }
}
