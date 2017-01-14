import React from 'react'
import { BrowserRouter } from 'react-router'
import Nav from './Nav'
import Main from './Main'

const App = () => (
  <BrowserRouter>
    <div>
      <header>
        <Nav />
      </header>
      <Main />
      <footer>
      </footer>
    </div>
  </BrowserRouter>
)

export default App
