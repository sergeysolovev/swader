import React from 'react'

const PersonItem = ({person, onClick}) => (
  <tr>
    <td>
      <a href='#' onClick={onClick}>{person.name}</a>
    </td>
    <td>{person.gender}</td>
    <td>{person.height}</td>
  </tr>
);

export default PersonItem
