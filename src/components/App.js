import React from 'react'
import { BrowserRouter, Match, Miss, Link, Redirect } from 'react-router'
import PeopleContainer from '../containers/PeopleContainer'
import About from '../components/About'
import NoMatch from '../components/NoMatch'

const App = () => (
  <BrowserRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/people">People</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <hr />
      <Match exactly pattern="/" render={() => (<Redirect to="/people" />)} />
      <Match pattern="/people" component={PeopleContainer} />
      <Match pattern="/about" component={About} />
      <Miss component={NoMatch} />
    </div>
  </BrowserRouter>
)

export default App
