import React from 'react'
import { BrowserRouter, Match, Miss, Link } from 'react-router'
import PeopleContainer from '../containers/PeopleContainer.js'
import About from '../components/About.js'
import NoMatch from '../components/NoMatch.js'

const App = () => (
  <BrowserRouter>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <hr />
      <Match exactly pattern="/" component={PeopleContainer} />
      <Match pattern="/about" component={About} />
      <Miss component={NoMatch} />
    </div>
  </BrowserRouter>
)

export default App
