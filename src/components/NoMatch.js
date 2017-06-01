import React from 'react'

const NoMatch = ({ location }) => (
  <div className='container'>
    <h2>Oooopps</h2>
    <p>Location {location.pathname} didn't match any pages</p>
  </div>
)

export default NoMatch
