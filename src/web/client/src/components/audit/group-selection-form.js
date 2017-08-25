import React from 'react'
import lodash from 'lodash'
import graphqlApi from '../../graphql-api'

export default class GroupSelectionForm extends React.Component {
  state = {
    selectedGroups: []
  }

  save = async () => {
    let individual = this.props.context.pendingNewIndividual
    const selectedGroups = this.state.selectedGroups

    // CREATE INDIVIDUAL
    let query = `mutation {
      createIndividual(individual: {
        fullName: "${individual.fullName}"
        ${individual.primaryEmail ? `primaryEmail: "${individual.primaryEmail}"` : ''}
        groups: [${selectedGroups.map((g) => `"${g}"`).join(',')}]
      }) ${this.props.context.individualResponseFormat}
    }`

    let response = await graphqlApi.request(query)
    if (response.error) {
      this.props.context.messagesContainer.push({
        title: 'Failed to Save New Individual',
        body: response.error.message
      })
      throw response.error
    }

    let flag = this.props.context.flag
    individual = response.data.createIndividual
    this.props.context.createdIndividual = individual

    // LINK SERVICE IDENTITY
    query = `mutation {
      linkServiceToIndividual(
        serviceId: "${flag.serviceId}",
        individualId:"${individual.id}",
        ${flag.userIdentity.fullName ? `fullName: "${flag.userIdentity.fullName}"` : ''},
        ${flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : ''},
        ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"` : ''}
      )
    }`
    response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to link to existing individual',
        body: response.error.message
      })
      throw response.error
    }

    // RECHECK FLAG
    const newFlag = await this.props.context.reCheckFlag(flag)
    this.props.context.flag = newFlag

    // NOTIFY PARENT TO REFRESH ENTIRE AUDIT
    this.props.context.refreshAudit()
  }

  rollback = async () => {
    const individual = this.props.context.createdIndividual
    const query = `mutation { deleteIndividual(individualId: "${individual.id}")}`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Error rolling back newly created individual",
        body: response.error.message
      })
      throw response.error
    }

    delete this.props.context.createdIndividual
    this.props.context.refreshAudit()
  }

  chooseNextStep = () => {
    if (this.props.context.flag) {
      return "role-based-access-rules-form"
    }
  }

  updateGroupSelection = (event) => {
    const targetGroup = event.target.value
    let selectedGroups = [...this.state.selectedGroups]

    if (event.target.checked) {
      selectedGroups.push(targetGroup)
    } else {
      selectedGroups = lodash.remove(selectedGroups, (group) => group === targetGroup)
    }

    this.setState({
      selectedGroups
    })
  }

  render () {
    return (
      <div>
        <h3 className='is-centered'>
          Add { this.props.context.pendingNewIndividual.fullName || 'this user' } to a group
        </h3>
        <h4>
          { this.props.context.pendingNewIndividual.primaryEmail }
        </h4>
        {
          this.props.context.groups.length > 0 &&
          <div>
            <ul>
              {
                this.props.context.groups.map((group) => {
                  return (
                    <li key={group}>
                      <label className='checkbox'>
                        <input onChange={this.updateGroupSelection} type='checkbox' value={group} />
                        {group}
                      </label>
                    </li>
                  )
                })
              }
            </ul>
          </div>
        }
      </div>
    )
  }
}
