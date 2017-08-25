import React from 'react'
import IndividualSearch from '../../shared/individual-search'
import lodash from 'lodash'
import graphqlApi from '../../../graphql-api'

export default class UnknownUserForm extends React.Component {

  onNewIndividualSelected = () => {
    this.nextStep = "new-individual-form"
    this.props.context.linkedIndividual = null
    this.props.context.goToNext()
  }

  renderLinkedServiceDetails = (individual) => {
    if(this.isAlreadyLinked(individual)) {
      return (
        <span className="is-pulled-right">Already linked to {this.props.context.service.displayName}</span>
      )
    }
  }

  isAlreadyLinked = (individual) => {
    const individualHasServiceIdentity = !!lodash.find(
      individual.serviceUserIdentities,
      (identity) => identity.serviceId === this.props.context.service.id)
    return individualHasServiceIdentity
  }

  onIndividualSelected = (individual) => {
    this.props.context.linkedIndividual = individual
    this.props.context.goToNext()
  }

  save = async () => {
    const individual = this.props.context.linkedIndividual
    if(individual) {
      const flag = this.props.context.flag

      const query = `mutation {
        linkServiceToIndividual(
          serviceId: "${flag.serviceId}",
          individualId:"${individual.id}",
          ${flag.userIdentity.fullName ? `fullName: "${flag.userIdentity.fullName}"` : ''},
          ${flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : ''},
          ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"` : ''}
        )
      }`

      const response = await graphqlApi.request(query)
      if (response.error) {
        this.props.context.messagesContainer.push({
          title: 'Failed to link to existing individual',
          body: response.error.message
        })
        throw response.error
      }

      const hasIdentityEmail = flag.userIdentity.email && flag.userIdentity.email.trim() !== ""
      if (hasIdentityEmail && flag.userIdentity.email !== individual.primaryEmail) {
        this.nextStep = "confirm-email-form"
      } else {
        const newFlag = await this.props.context.reCheckFlag(flag)
        this.props.context.flag = newFlag
        if (newFlag) {
          this.nextStep = "role-based-access-rules-form"
        }
      }
    }
  }

  rollback = async () => {
    this.props.context.flag = this.props.context.originalFlag
    const individual = this.props.context.linkedIndividual
    if (individual) {
      const flag = this.props.context.flag

      const query = `mutation { unlinkService(serviceId: "${flag.serviceId}", individualId: "${individual.id}")}`
      const response = await graphqlApi.request(query)
      if (response.error) {
        this.messagesContainer.push({
          title: "Error rolling back link to individual",
          body: response.error.message
        })
        throw response.error
      }

      // NOTIFY PARENT TO REFRESH AUDIT FOR THIS SERVICE
      this.props.context.refreshAuditForService(flag.serviceId)
    }
  }

  chooseNextStep = () => {
    return this.nextStep || "save-and-finish"
  }

  render () {
    return (
      <div>
        <div>
          <IndividualSearch
            onIndividualSelected={this.onIndividualSelected}
            additionalDetailsRenderer={this.renderLinkedServiceDetails}
            shouldDisableIndividual={this.isAlreadyLinked} />
        </div>
        <p className="subtitle">OR</p>
        <div className='field is-grouped'>
          <div className='control'>
            <button className='button' onClick={this.onNewIndividualSelected}>Create New Individual</button>
          </div>
        </div>
      </div>
    )
  }
}
