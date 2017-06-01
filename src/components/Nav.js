import React from 'react'
import { NavLink } from 'react-router-dom'

const Nav = () => (
  <nav className='nav'>
    <div className='container'>
      <ul>
        <li>
          <span>const {'{ '}</span>
          <NavLink to='/films' activeClassName='nav-link-active'>
            films
          </NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/people' activeClassName='nav-link-active'>
            chars
          </NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/starships' activeClassName='nav-link-active'>
            ships
          </NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/planets' activeClassName='nav-link-active'>
            planets
          </NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/vehicles' activeClassName='nav-link-active'>
            vehicles
          </NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/species' activeClassName='nav-link-active'>
            species
          </NavLink>
          <span>{' } ='}</span>
        </li>
        <li>
          <span>&nbsp;getNav(</span>
          <NavLink exact to='/' activeClassName='nav-link-active'>
            swader
          </NavLink>
          <span>);</span>
        </li>
      </ul>
    </div>
  </nav>
)

export default Nav
