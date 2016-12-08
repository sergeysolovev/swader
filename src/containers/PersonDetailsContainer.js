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
      person: undefined,
      isLoading: false,
      isError: false
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
    console.log(this.state);
    const {person, isLoading, isError} = this.state;
    return <PersonDetails person={person}
      isLoading={isLoading}
      isError={isError}
      onGetBackToListClick={this.props.onGetBackToListClick} />;
  }
}
