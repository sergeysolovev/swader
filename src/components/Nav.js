import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'

const Nav = () => (
  <nav className='nav'>
    <div className='container'>
      <ul>
        <li>
          <NavLink to='/' activeOnlyWhenExact>Home</NavLink>
        </li>
        <li>
          <NavLink to='/people' activeOnlyWhenExact>People</NavLink>
        </li>
        <li>
          <NavLink to='/starships'>Starships</NavLink>
        </li>
        <li>
          <NavLink to='/planets'>Planets</NavLink>
        </li>
        <li>
          <NavLink to='/about'>About</NavLink>
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
