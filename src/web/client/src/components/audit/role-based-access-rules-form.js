import React from 'react'
import lodash from 'lodash'

export default class RoleBasedAccessRulesForm extends React.Component {
  state = {
    selectedRoles: {}
  }

  saveRoleSelection = (e) => {
    e.preventDefault()
    const rolesHash = this.state.selectedRoles
    const actualSelectedRoles = Object.keys(rolesHash).filter((role) => rolesHash[role])
    this.props.onRolesSelected(actualSelectedRoles)
  }

  onRoleClicked = (event, role) => {
    event.target.blur()
    this.toggleRole(role)
  }

  toggleRole = (role) => {
    const selectedRoles = this.state.selectedRoles

    const enableRole = !selectedRoles[role]
    selectedRoles[role] = enableRole

    this.setState({
      selectedRoles
    })
  }

  render () {
    let roleButtons
    if (this.props.service.roles.length > 0) {
      const flaggedRoles = lodash.uniq(this.props.assets.map((a) => a.role))
      roleButtons = flaggedRoles.map((r) => { return { text: r, value: r } })
    } else {
      roleButtons = [{text: 'Full Access', value: '*'}]
    }

    return (
      <div>
        <h2>{ this.props.service.displayName }</h2>
        <div className='field is-grouped'>
          {roleButtons.map((button) => (
            <div key={button.value} className='control'>
              <button
                className={`button is-primary ${this.state.selectedRoles[button.value] ? '' : 'is-outlined'}`}
                onClick={(e) => this.onRoleClicked(e, button.value)}>
                {button.text}
              </button>
            </div>
          ))}
        </div>
        <button className='button' onClick={this.saveRoleSelection}>Next</button>
      </div>
    )
  }
}
