// @flow

import React from 'react'
import {render} from 'react-dom'
import './index.scss'
import 'bulma/bulma.sass'
import { Switch, Link, Route, BrowserRouter } from 'react-router-dom'
import ServiceList from './components/services/service-list'

const NavBar = (props) => {
  return (
    <nav className='navbar '>
      <div className='navbar-menu'>
        <div className='navbar-start'>
          {props.children}
        </div>
      </div>
    </nav>
  )
}

const NavBarLink = (props) => {
  const isActive = props.to === window.location.pathname
  return <Link className={`navbar-item ${isActive ? 'is-active' : ''}`} to={props.to}>{props.children}</Link>
}

class App extends React.Component {
  render () {
    return (
      <BrowserRouter>
        <div className='container'>
          <NavBar>
            <NavBarLink to='/'>Home</NavBarLink>
            <NavBarLink to='/audit'>Audit</NavBarLink>
            <NavBarLink to='/groups'>Groups</NavBarLink>
            <NavBarLink to='/individuals'>Individuals</NavBarLink>
            <NavBarLink to='/services'>Services</NavBarLink>
          </NavBar>
          <Switch>
            <Route exact path='/' component={() => <h1>Welcome to CAM</h1>} />
            <Route exact path='/services' component={ServiceList} />
            <Route component={() => <p>not found</p>} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

render(<App />, document.getElementById('app'))
