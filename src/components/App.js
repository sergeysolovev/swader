import React from 'react'
import { BrowserRouter, Match, Miss, Link, Redirect } from 'react-router'
import ResourceList from '../containers/ResourceList'
import PlanetItem from '../components/PlanetItem'
import PeopleItem from '../components/PeopleItem'
import StarshipItem from '../components/StarshipItem'
import Person from '../containers/Person'
import About from '../components/About'
import NoMatch from '../components/NoMatch'
import * as Routes from '../routes'

const App = () => (
  <BrowserRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to={Routes.PEOPLE}>People</Link></li>
        <li><Link to={Routes.PLANETS}>Planets</Link></li>
        <li><Link to={Routes.STARSHIPS}>Starships</Link></li>
        <li><Link to={Routes.ABOUT}>About</Link></li>
      </ul>
      <hr />
      <Match exactly pattern="/" render={() => (<Redirect to={Routes.PEOPLE} />)} />
      <Match pattern={`${Routes.PEOPLE}/:personId`} component={Person} />
      <Match exactly pattern={Routes.PEOPLE} render={() =>
        <ResourceList resourceType='people' itemComponent={PeopleItem} />} />
      <Match exactly pattern={Routes.PLANETS} render={() =>
        <ResourceList resourceType='planets' itemComponent={PlanetItem} />} />
      <Match exactly pattern={Routes.STARSHIPS} render={() =>
        <ResourceList resourceType='starships' itemComponent={StarshipItem} />} />
      <Match pattern={Routes.ABOUT} component={About} />
      <Miss component={NoMatch} />
    </div>
  </BrowserRouter>
)

export default App
