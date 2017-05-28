import React from 'react'

import { Match, Miss } from 'react-router'
import * as Routes from '../routes'

import Film from '../containers/Film'
import Films from '../containers/Films'
import ResourceList from '../containers/ResourceList'
import PlanetItem from '../components/PlanetItem'
import PeopleItem from '../components/PeopleItem'
import StarshipItem from '../components/StarshipItem'
import Person from '../containers/Person'
import About from '../components/About'
import NoMatch from '../components/NoMatch'

const Main = () => (
  <main>
    <Match exactly pattern='/' component={About} />

    <Match exactly pattern={Routes.FILMS} component={Films} />
    <Match pattern={`${Routes.FILMS}/:filmId`} component={Film} />

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
    <Miss component={NoMatch} />
  </main>
)

export default Main
