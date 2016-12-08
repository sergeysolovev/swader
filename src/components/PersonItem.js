import React from 'react'
import { Link } from 'react-router'
import { getPersonPath } from '../routes'

const PersonItem = ({person, location}) => (
  <tr>
    <td>
      <Link to={{
        pathname: getPersonPath(person.id),
        state: location.state
      }}>{person.name}</Link>
    </td>
    <td>{person.gender}</td>
    <td>{person.height}</td>
  </tr>
);

export default PersonItem
