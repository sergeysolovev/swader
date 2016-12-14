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
      <section className='container'>
        <Main />
      </section>
      <footer className='container'>
      </footer>
    </div>
  </BrowserRouter>
)

export default App
