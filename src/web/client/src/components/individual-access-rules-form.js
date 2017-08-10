import React from 'react'
import lodash from 'lodash'

export default class IndividualAccessRulesForm extends React.Component {
  state = {
    selectedAccessRules: [],
    selectedRoles: {}
  }

  updateAccessRuleSelection = (event, targetAsset) => {
    let selectedAccessRules = [...this.state.selectedAccessRules]

    if (event.target.checked) {
      selectedAccessRules.push({ asset: targetAsset.name, role: targetAsset.role })
    } else {
      selectedAccessRules = lodash.remove(selectedAccessRules, (rule) => rule.asset === targetAsset.name && rule.role === targetAsset.role )
    }

    this.setState({ selectedAccessRules })
  }

  saveAccessRules = (e) => {
    e.preventDefault()
    this.props.onAccessRuleSelection(this.state.selectedAccessRules)
  }

  onRoleClicked = (event, role) => {
    event.target.blur()
    const selectedRoles = this.state.selectedRoles
    const selectedAccessRules = this.state.selectedAccessRules

    const enableRole = !selectedRoles[role]
    selectedRoles[role] = enableRole

    if(enableRole) {
      selectedAccessRules.push({ asset: "*", role: role })
    } else {
      lodash.remove(selectedAccessRules, (r) => r.asset === "*" && r.role === role)
    }

    this.setState({
      selectedRoles,
      selectedAccessRules
    })
  }

  isAssetChecked = (asset) => {
    let exactMatch = !!lodash.find(this.state.selectedAccessRules, (r) => r.asset === asset.name && r.role === asset.role)
    let fullAccessEnabledForRole = !!this.state.selectedAccessRules[asset.role]

    console.log(`exact match: ${exactMatch}, fullAccess: ${fullAccessEnabledForRole}`)

    return exactMatch || fullAccessEnabledForRole
  }

  render() {
    let roleButtons
    if (this.props.service.roles.length > 0) {
      const flaggedRoles = lodash.uniq(this.props.assets.map((a) => a.role))
      roleButtons = flaggedRoles.map((r) => { return { text: r, value: r }})
    } else {
      roleButtons = [{text: "Full Access", value: "*"}]
    }


    return(
      <div>
        <h2>{ this.props.service.displayName } </h2>
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
        <ul>
          {
            this.props.assets.map((asset) => {
              return (
                <li key={`${asset.name}-${asset.role}`}>
                    <span>
                      { asset.name } / { asset.role }
                    </span>
                    <label className="checkbox">
                      <input onChange={(e) => this.updateAccessRuleSelection(e, asset)} type="checkbox"/>
                    </label>
                </li>
              )
          })
        }
        </ul>
        <button className="button" onClick={this.saveAccessRules}>Save and Finish</button>
      </div>
    )
  }
}
