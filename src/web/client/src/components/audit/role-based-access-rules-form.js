import React from 'react'
import lodash from 'lodash'
import graphqlApi from '../../graphql-api'

export default class RoleBasedAccessRulesForm extends React.Component {
  state = {
    selectedRoles: {}
  }

  save = async () => {
    const rolesHash = this.state.selectedRoles
    const selectedRoles = Object.keys(rolesHash).filter((role) => rolesHash[role])
    const accessRules = selectedRoles.map((role) => {
      return {
        role: role,
        asset: "*"
      }
    })

    let flag = this.props.context.flag
    const hasFullAccess = (selectedRoles.length === 1 && selectedRoles[0] === "*")
    const remainingAssets = hasFullAccess
      ? []
      : flag.assets.filter((a) => !selectedRoles.includes(a.role))

    // IF ASSETS REMAIN, PREPARE FOR NEXT SCREEN
    if (remainingAssets.length > 0) {
      this.props.context.remainingAssets = remainingAssets
      this.props.context.accessRules = accessRules
      this.nextStep = "asset-based-access-rules-form"
      return
    }

    // ELSE, SAVE ACCESS RULES
    const query = `mutation {
      addIndividualAccessRules(
        individualId: "${flag.individual.id}",
        serviceId: "${flag.serviceId}",
        accessRules: [${accessRules.map((rule) => `{
          asset: "${rule.asset}",
          role: "${rule.role}"
        }`).join(',')}])
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.props.context.messagesContainer.push({
        title: 'Failed to add selected access rules',
        body: response.error.message
      })
      throw response.error
    }
    this.props.context.reCheckFlag(flag)
  }

  chooseNextStep = () => {
    return this.nextStep || "save-and-finish"
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
    if (this.props.context.service.roles.length > 0) {
      const flaggedRoles = lodash.uniq(this.props.context.flag.assets.map((a) => a.role))
      roleButtons = flaggedRoles.map((r) => { return { text: r, value: r } })
    } else {
      roleButtons = [{text: 'Full Access', value: '*'}]
    }

    return (
      <div>
        <h2>{ this.props.context.service.displayName }</h2>
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
      </div>
    )
  }
}
