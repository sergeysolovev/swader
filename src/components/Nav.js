import React from 'react'
import { Link } from 'react-router'

const Nav = () => (
  <nav>
    <ul>
      <li>
        <Link to='/' isActive={location => location.pathname === '/'}>Home</Link>
      </li>
      <li>
        <Link to='/people'>People</Link>
      </li>
      <li>
        <Link to='/starships'>Starships</Link>
      </li>
      <li>
        <Link to='/planets'>Planets</Link>
      </li>
      <li>
        <Link to='/about'>About</Link>
      </li>
    </ul>
  </nav>
)

export default Nav
