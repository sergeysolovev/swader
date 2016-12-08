import React from 'react'
import { BrowserRouter, Match, Miss, Link, Redirect } from 'react-router'
import People from '../components/People'
import About from '../components/About'
import NoMatch from '../components/NoMatch'
import * as Routes from '../routes'

const App = () => (
  <BrowserRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/people">People</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <hr />
      <Match exactly pattern="/" render={() => (<Redirect to={Routes.PEOPLE} />)} />
      <Match pattern={Routes.PEOPLE} component={People} />
      <Match pattern={Routes.ABOUT} component={About} />
      <Miss component={NoMatch} />
    </div>
  </BrowserRouter>
)

export default App
