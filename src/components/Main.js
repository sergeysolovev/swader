import React from 'react'

import { Match, Miss } from 'react-router'
import * as Routes from '../routes'

import Film from '../containers/Film'
import Films from '../containers/Films'
import ResourceList from '../containers/ResourceList'
import Resource from '../containers/Resource'

import About from '../components/About'
import NoMatch from '../components/NoMatch'

const Main = () => (
  <main>
    <Miss component={NoMatch} />
    <Match exactly pattern='/' component={About} />

    <Match pattern={`${Routes.FILMS}/:filmId`} component={Film} />
    <Match pattern={`${Routes.PEOPLE}/:id`} render={(matchProps) =>
      <Resource {...matchProps} resourceType='people' />
    } />
    <Match pattern={`${Routes.PLANETS}/:id`} render={(matchProps) =>
      <Resource {...matchProps} resourceType='planets' />
    } />
    <Match pattern={`${Routes.STARSHIPS}/:id`} render={(matchProps) =>
      <Resource {...matchProps} resourceType='starships' />
    } />
    <Match pattern={`${Routes.VEHICLES}/:id`} render={(matchProps) =>
      <Resource {...matchProps} resourceType='vehicles' />
    } />
    <Match pattern={`${Routes.SPECIES}/:id`} render={(matchProps) =>
      <Resource {...matchProps} resourceType='species' />
    } />

    <Match exactly pattern={Routes.FILMS} component={Films} />
    <Match exactly pattern={Routes.PEOPLE} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='people' />} />
    <Match exactly pattern={Routes.PLANETS} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='planets' />} />
    <Match exactly pattern={Routes.STARSHIPS} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='starships' />} />
    <Match exactly pattern={Routes.VEHICLES} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='vehicles' />} />
    <Match exactly pattern={Routes.SPECIES} render={(matchProps) =>
      <ResourceList {...matchProps} resourceType='species' />} />
  </main>
)

export default Main
