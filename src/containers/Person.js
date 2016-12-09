import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Api, { fetchResource } from '../middleware/api'
import * as Routes from '../routes'

const RESOURCE_TYPE = 'people'

export default class Person extends React.Component {
  static propTypes = {
    onGetBackToListClick: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      item: undefined,
      isLoading: false,
      isError: false
    }
  }
  componentWillMount() {
    const {params} = this.props;
    this.setState({isLoading: true});
    fetchResource(RESOURCE_TYPE, params.personId)
      .then(data => this.setState(
        Object.assign({}, data, {isLoading: false})
      ));
  }
  render() {
    const {location} = this.props;
    const {isLoading, isError} = this.state;
    const item = this.state.item || {name: '', gender: '', heigth: ''};
    return (
      <div>
        <h1>Name: {item.name}</h1>
        <h2>Gender: {item.gender}</h2>
        <h2>Height: {item.height}</h2>
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
