import React, { PropTypes } from 'react'

const PersonDetails = ({person, onGetBackToListClick}) => (
  <div>
    <h1>{person.name}</h1>
    <h2>Gender: {person.gender}</h2>
    <h2>Height: {person.height}</h2>
    <a href='#' onClick={onGetBackToListClick}>Get back to the list</a>
  </div>
);

PersonDetails.propTypes = {
  person: PropTypes.shape({
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired
  }).isRequired
}

export default PersonDetails
