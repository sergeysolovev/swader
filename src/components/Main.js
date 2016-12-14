import React from 'react'

import { Match, Miss } from 'react-router'
import * as Routes from '../routes'

import ResourceList from '../containers/ResourceList'
import PlanetItem from '../components/PlanetItem'
import PeopleItem from '../components/PeopleItem'
import StarshipItem from '../components/StarshipItem'
import Person from '../containers/Person'
import About from '../components/About'
import Home from '../components/Home'
import NoMatch from '../components/NoMatch'

const Main = () => (
  <div>
    <Match exactly pattern="/" component={Home} />
    <Match pattern={`${Routes.PEOPLE}/:personId`} component={Person} />
    <Match exactly pattern={Routes.PEOPLE} render={(matchProps) =>
      <ResourceList {...matchProps}
        resourceType='people'
        itemComponent={PeopleItem} />} />
    <Match exactly pattern={Routes.PLANETS} render={(matchProps) =>
      <ResourceList {...matchProps}
        resourceType='planets'
        itemComponent={PlanetItem} />} />
    <Match exactly pattern={Routes.STARSHIPS} render={(matchProps) =>
      <ResourceList {...matchProps}
        resourceType='starships'
        itemComponent={StarshipItem} />} />
    <Match pattern={Routes.ABOUT} component={About} />
    <Miss component={NoMatch} />
  </div>
)

export default Main
