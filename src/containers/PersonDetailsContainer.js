import React, { Component, PropTypes } from 'react'
import PersonDetails from '../components/PersonDetails'
import Api, {fetchPerson} from '../middleware/api'

export default class PersonDetailsContainer extends React.Component {
  static propTypes = {
    onGetBackToListClick: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      person: null,
      isLoading: false
    }
  }
  componentWillMount() {
    this.setState({isLoading: true});
    fetchPerson(this.props.personId)
      .then(data => this.setState(
        Object.assign({}, data, {isLoading: false})
      ));
  }
  render() {
    const {person, isLoading} = this.state;
    return <PersonDetails person={person}
      isLoading={isLoading}
      onGetBackToListClick={this.props.onGetBackToListClick} />;
  }
}
