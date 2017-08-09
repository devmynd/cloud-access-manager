// @flow

import React from 'react'
import {render} from 'react-dom'
import 'bulma/bulma.sass'
import 'font-awesome/scss/font-awesome.scss'
import { Switch, Link, Route, BrowserRouter } from 'react-router-dom'
import ServiceList from './components/service-list'
import GroupList from './components/group-list'
import Group from './components/group'
import FlagList from './components/flag-list'

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

const GroupMatcher = ({ match }) => {
  return <Group name={match.params.groupName} />
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
            <Route exact path='/groups' component={GroupList} />
            <Route exact path='/audit' component={FlagList} />
            <Route path='/groups/:groupName' component={GroupMatcher} />
            <Route component={() => <p>not found</p>} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

render(<App />, document.getElementById('app'))
