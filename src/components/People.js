import React from 'react'
import { Match } from 'react-router'
import PeopleList from '../containers/PeopleList'
import Person from '../containers/Person'

const People = ({pathname}) => (
  <div>
    <Match pattern={pathname} exactly component={PeopleList} />
    <Match pattern={`${pathname}/:personId`} component={Person} />
  </div>
)

export default People
