import React from 'react'
import { Match } from 'react-router'
import PeopleListContainer from '../containers/PeopleListContainer'
import PersonDetailsContainer from '../containers/PersonDetailsContainer'

const PeopleContainer = ({pathname}) => (
  <div>
    <Match pattern={pathname} exactly component={PeopleListContainer} />
    <Match pattern={`${pathname}/:personId`} component={PersonDetailsContainer} />
  </div>
)

export default PeopleContainer
