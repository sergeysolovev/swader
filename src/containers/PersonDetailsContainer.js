import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Api, {fetchPerson} from '../middleware/api'
import * as Routes from '../routes'

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
    const {params} = this.props;
    this.setState({isLoading: true});
    fetchPerson(params.personId)
      .then(data => this.setState(
        Object.assign({}, data, {isLoading: false})
      ));
  }
  render() {
    const {location} = this.props;
    const {isLoading, isError} = this.state;
    const person = this.state.person || {name: '', gender: '', heigth: ''};
    return (
      <div>
        <h1>Name: {person.name}</h1>
        <h2>Gender: {person.gender}</h2>
        <h2>Height: {person.height}</h2>
        <Link to={{
          pathname: Routes.PEOPLE,
          state: location.state
        }}>Get back to the list</Link>
        <br />
        {isLoading ? <span>loading...</span> : ''}
        {isError ? <span>error!</span> : ''}
      </div>
    );
  }
}
