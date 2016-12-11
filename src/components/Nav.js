import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router'

const Nav = () => (
  <Menu>
    <Link to='/' isActive={location => location.pathname === '/'}>{
      ({isActive, onClick}) =>
        <Menu.Item onClick={onClick} active={isActive}>Home</Menu.Item>
    }</Link>
    <Link to='/people'>{
      ({isActive, onClick}) =>
        <Menu.Item onClick={onClick} active={isActive}>People</Menu.Item>
    }</Link>
    <Link to='/starships'>{
      ({isActive, onClick}) =>
        <Menu.Item onClick={onClick} active={isActive}>Starships</Menu.Item>
    }</Link>
    <Link to='/planets'>{
      ({isActive, onClick}) =>
        <Menu.Item onClick={onClick} active={isActive}>Planets</Menu.Item>
    }</Link>
    <Link to='/about'>{
      ({isActive, onClick}) =>
        <Menu.Item onClick={onClick} active={isActive}>About</Menu.Item>
    }</Link>
  </Menu>
)

export default Nav
