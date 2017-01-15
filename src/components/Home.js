import React from 'react'
import { Link } from 'react-router'

const Home = () => (
  <div className='hero'>
    <h2>Swader</h2>
    <p>
      Stands for The Star Wars API's Data Explorer,
      an open source <a href="https://facebook.github.io/react/">React</a> app for exloring the data provided by <a href="http://swapi.co">The Star Wars API</a>.
    </p>
    <Link to='/films' className='btn btn-alt'>Start exploring</Link>
  </div>
)

export default Home
