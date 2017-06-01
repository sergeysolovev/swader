import React from 'react'
import { Switch, Route } from 'react-router-dom'
import About from '../components/About'
import Film from '../containers/Film'
import Films from '../containers/Films'
import ResourceList from '../containers/ResourceList'
import Resource from '../containers/Resource'
import NoMatch from '../components/NoMatch'

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={About} />
      <Route exact path='/films/:id' component={Film} />
      <Route exact path='/films' component={Films} />
      <Route exact path='/:resourceType/:id' component={Resource} />
      <Route exact path='/:resourceType' component={ResourceList}/>
      <Route component={NoMatch} />
    </Switch>
  </main>
)

export default Main
