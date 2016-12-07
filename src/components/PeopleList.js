import PersonItem from './PersonItem'
import React from 'react'

const PeopleList = ({
    people,
    page,
    onNextClick,
    onPrevClick,
    onPersonClick}) => (
  <div>
    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>gender</th>
          <th>height (cm)</th>
        </tr>
      </thead>
      <tbody>
        {people.map(person => {
          return (<PersonItem key={person.id} person={person}
            onClick={() => { onPersonClick(person.id) }} />)
          }
        )}
      </tbody>
    </table>
    {onPrevClick ?
      <a href='#' onClick={onPrevClick}>prev page</a> :
      <span>prev page</span>
    }
    <span> | </span>
    {onNextClick ?
      <a href='#' onClick={onNextClick}>next page</a> :
      <span>next page</span>
    }
    <span> | page #{page}</span>
  </div>
);

export default PeopleList
