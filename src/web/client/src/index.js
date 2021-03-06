// @flow

import React from 'react'
import {render} from 'react-dom'
import 'bulma/bulma.sass'
import 'font-awesome/scss/font-awesome.scss'
import { Switch, Link, Route, BrowserRouter } from 'react-router-dom'
import ServiceList from './components/services/service-list'
import GroupList from './components/groups/group-list'
import Group from './components/groups/group'
import Audit from './components/audit/audit'
import Individual from './components/individuals/individual'

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
            <NavBarLink to='/'>Audit</NavBarLink>
            <NavBarLink to='/groups'>Groups</NavBarLink>
            <NavBarLink to='/individuals'>Individuals</NavBarLink>
            <NavBarLink to='/services'>Services</NavBarLink>
          </NavBar>
          <Switch>
            <Route exact path='/' component={Audit} />
            <Route exact path='/services' component={ServiceList} />
            <Route exact path='/groups' component={GroupList} />
            <Route path='/groups/:groupName' component={GroupMatcher} />
            <Route exact path='/individuals' component={Individual} />
            <Route component={() => <p>not found</p>} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

render(<App />, document.getElementById('app'))
