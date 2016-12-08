import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import * as Routes from '../routes'

export default class PersonDetails extends React.Component {
  static propTypes = {
    person: PropTypes.shape({
      name: PropTypes.string.isRequired,
      gender: PropTypes.string.isRequired,
      height: PropTypes.string.isRequired
    }),
    isLoading: PropTypes.bool,
    isError: PropTypes.bool
  }
  render() {
    const {isLoading, isError, location} = this.props;
    const person = this.props.person || {name: '', gender: '', heigth: ''};
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
