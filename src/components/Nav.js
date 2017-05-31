import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'

const Nav = () => (
  <nav className='nav'>
    <div className='container'>
      <ul>
        <li>
          <span>const {'{ '}</span>
          <NavLink to='/films'>films</NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/people'>chars</NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/starships'>ships</NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/planets'>planets</NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/vehicles'>vehicles</NavLink>
          <span>,</span>
        </li>
        <li>
          <span>&nbsp;</span>
          <NavLink to='/species'>species</NavLink>
          <span>{' } ='}</span>
        </li>
        <li>
          <span>&nbsp;getNav(</span>
          <NavLink to='/' activeOnlyWhenExact>swader</NavLink>
          <span>);</span>
        </li>
      </ul>
    </div>
  </nav>
)

const NavLink = ({to, text, activeOnlyWhenExact, children}) => (
  <Link to={to} activeOnlyWhenExact={activeOnlyWhenExact}>{
    ({isActive, href, onClick}) =>
      <span className={classNames({'nav-link': true, 'nav-link-active': isActive})}>
        <a href={href} onClick={onClick}>{children}</a>
      </span>
  }</Link>
)

export default Nav
