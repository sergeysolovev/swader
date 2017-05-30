import React from 'react'

import { Match, Miss } from 'react-router'
import * as Routes from '../routes'

import Film from '../containers/Film'
import Films from '../containers/Films'
import ResourceList from '../containers/ResourceList'
import About from '../components/About'
import NoMatch from '../components/NoMatch'

const Main = () => (
  <main>
    <Match exactly pattern='/' component={About} />
    <Match exactly pattern={Routes.FILMS} component={Films} />
    <Match pattern={`${Routes.FILMS}/:filmId`} component={Film} />
    <Match exactly pattern={Routes.PEOPLE} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='people' />} />
    <Match exactly pattern={Routes.PLANETS} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='planets' />} />
    <Match exactly pattern={Routes.STARSHIPS} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='starships' />} />
    <Miss component={NoMatch} />
  </main>
)

export default Main
