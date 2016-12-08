import React, { PropTypes } from 'react'

export default class PersonDetails extends React.Component {
  static propTypes = {
    person: PropTypes.shape({
      name: PropTypes.string.isRequired,
      gender: PropTypes.string.isRequired,
      height: PropTypes.string.isRequired
    }),
    onGetBackToListClick: PropTypes.func,
    isLoading: PropTypes.bool
  }
  render() {
    const {onGetBackToListClick, isLoading} = this.props;
    const person = this.props.person || {name: '', gender: '', heigth: ''};
    return (
      <div>
        <h1>Name: {person.name}</h1>
        <h2>Gender: {person.gender}</h2>
        <h2>Height: {person.height}</h2>
        <a href='#' onClick={onGetBackToListClick}>Get back to the list</a>
        <br />
        {isLoading ? <span>loading...</span> : ''}
      </div>
    );
  }
}
