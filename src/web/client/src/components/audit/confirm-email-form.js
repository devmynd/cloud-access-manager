import React from 'react'
import graphqlApi from '../../graphql-api'

export default class ConfirmEmailForm extends React.Component {

  onConfirm = () => {
    this.confirmed = true
    this.props.context.goToNext()
  }

  onReject = () => {
    this.confirmed = false
    this.props.context.goToNext()
  }

  save = async () => {
    const individual = this.props.context.linkedIndividual
    const previousEmail = individual.primaryEmail
    const flag = this.props.context.flag
    const newEmail = flag.userIdentity.email
    const shouldAssign = this.confirmed

    if (shouldAssign) {
      const query = `mutation { updatePrimaryEmail(individualId: "${individual.id}", primaryEmail: "${newEmail}") }`
      const response = await graphqlApi.request(query)
      if (response.error) {
        this.props.context.messagesContainer.push({
          title: 'Failed to save primary email',
          body: response.error.message
        })
        throw response.error
      }
      // NOTIFY PARENT TO REFRESH AUDIT SINCE EMAIL MAY CHANGE AUTO-MATCHING
      this.props.context.refreshAudit()
    }

    const newFlag = await this.props.context.reCheckFlag(flag)
    this.props.context.flag = newFlag
    if (newFlag) {
      this.nextStep = "role-based-access-rules-form"
    }
  }

  rollback = async () => {
    const individual = this.props.context.linkedIndividual
    const previousEmail = individual.primaryEmail

    const query = `mutation { updatePrimaryEmail(individualId: "${individual.id}", primaryEmail: ${previousEmail ? `"${previousEmail}"` : `null`}) }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to roll back primary email',
        body: response.error.message
      })
      throw response.error
    }

    // NOTIFY PARENT TO REFRESH AUDIT SINCE EMAIL MAY CHANGE AUTO-MATCHING
    this.props.context.refreshAudit()
  }

  chooseNextStep = () => {
    return this.nextStep
  }

  render() {
    return (
      <div>
        <p>Do you want to use '{this.props.context.flag.userIdentity.email}' as the primary email for {this.props.context.linkedIndividual.fullName}?</p>
        <button className='button' onClick={this.onConfirm}>Yes</button>
        <button className='button' onClick={this.onReject}>No</button>
      </div>
    )
  }
}
