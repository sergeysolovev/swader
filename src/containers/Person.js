import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Api, { fetchResource, getUrlId } from '../middleware/api'
import * as Routes from '../routes'
import ResourceSimpleList from '../components/ResourceSimpleList'
import StarshipItem from '../components/StarshipItem'

export default class Person extends React.Component {
  static propTypes = {
    onGetBackToListClick: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      person: undefined,
      starships: [],
      isLoading: false,
      isError: false
    }
  }
  componentWillMount() {
    const {params} = this.props;
    this.setState({isLoading: true});
    fetchResource('people', params.personId)
      .then(person => {
        this.setState({person, isLoading: false});
        this.loadPersonStarships(person);
      });
  }
  loadPersonStarships(person) {
    if (person.starships) {
      Promise
        .all(person.starships
          .map(starshipUrl => getUrlId(starshipUrl))
          .map(starshipId => fetchResource('starships', starshipId)))
        .then(starships => this.setState({starships}));
    }
  }
  render() {
    const {location} = this.props;
    const {isLoading, isError, starships} = this.state;
    const person = this.state.person || {name: '', gender: '', heigth: ''};
    return (
      <div>
        <h2>{person.name}</h2>
        <h3>Gender: {person.gender}</h3>
        <h3>Height: {person.height}</h3>
        <h3>Starships</h3>
        <ResourceSimpleList resourceType='starships'
          itemComponent={StarshipItem}
          items={starships}
          location={location} />
        <br />
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
