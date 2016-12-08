import React from 'react'

const NoMatch = ({ location }) => (
  <div>
    <h1>Oooopps</h1>
    <p>Location {location.pathname} didn't match any pages</p>
  </div>
)

export default NoMatch
