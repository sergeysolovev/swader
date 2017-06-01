import React from 'react'
import { BrowserRouter } from 'react-router-dom'
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
