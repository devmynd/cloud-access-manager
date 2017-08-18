import React from 'react'
import graphqlApi from '../../graphql-api'
import Modal from '../shared/modal'
import UnknownUserForm from './unknown-user-form'
import NewIndividualForm from './new-individual-form'
import GroupSelectionForm from './group-selection-form'
import IndividualAccessRulesForm from './individual-access-rules-form'
import LinkIndividualForm from './link-individual-form'
import MessagesContainer from '../shared/messages-container'
import lodash from 'lodash'

export default class AuditFlags extends React.Component {
  state = { }

  showModal = (flag) => {
    this.setState({
      showModal: true,
      currentFlag: flag,
      modalTitle: flag.individual
        ? 'Set Individual Access Rules'
        : `Unknown User: ${flag.userIdentity.email || flag.userIdentity.userId}`,
      modalContents: flag.individual
        ? <IndividualAccessRulesForm service={this.props.serviceLookup[flag.serviceId]} assets={flag.assets} onAccessRuleSelection={this.setIndividualAccessRules} />
        : <UnknownUserForm flag={flag} onNewIndividualSelected={this.onNewIndividualSelected} onLinkToIndividualSelected={this.onLinkToIndividualSelected} />
    })
  }

  closeModal = (event) => {
    if (event) { event.preventDefault() }

    this.setState({
      showModal: false
    })
  }

  onNewIndividualSelected = () => {
    const flag = this.state.currentFlag
    this.setState({
      modalTitle: `Manage ${flag.userIdentity.email || flag.userIdentity.userId || 'blah'}`,
      modalContents: <NewIndividualForm flag={flag} onNewIndividualFormComplete={this.onNewIndividualFormComplete} onNewIndividualSelected={this.onNewIndividualSelected} />
    })
  }

  onNewIndividualFormComplete = (fullName, primaryEmail) => {
    if (!fullName || fullName.trim() === '') {
      this.messagesContainer.push({
        title: 'Invalid Name',
        body: "Please fill out the individual's name."
      })
      return
    }

    this.pendingNewIndividual = {
      fullName,
      primaryEmail
    }
    this.setState({
      modalTitle: `Select groups`,
      modalContents: <GroupSelectionForm groups={this.props.groups} onGroupFormComplete={this.onGroupFormComplete} individual={this.pendingNewIndividual} />
    })
  }

  onLinkToIndividualSelected = () => {
    this.setState({
      modalTitle: 'Link to an individual',
      modalContents: <LinkIndividualForm onIndividualSelected={this.onIndividualSelectedToLink} />
    })
  }

  onIndividualSelectedToLink = (individual) => {
    this.linkIndividual(individual.id)
  }

  linkIndividual = async (individualId) => {
    const flag = this.state.currentFlag

    const query = `mutation {
      linkServiceToIndividual(
        serviceId: "${flag.serviceId}",
        individualId:"${individualId}",
        ${flag.userIdentity.fullName ? `fullName: "${flag.userIdentity.fullName}"` : ''},
        ${flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : ''},
        ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"` : ''}
      )
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to link to existing individual',
        body: response.error.message
      })
    }
    const newFlag = await this.reCheckFlag(flag)
    this.props.updateFlag(flag, newFlag)
    if (newFlag) {
      this.setState({
        currentFlag: newFlag,
        modalTitle: 'Set Individual Access Rules',
        modalContents: <IndividualAccessRulesForm
          service={this.props.serviceLookup[newFlag.serviceId]}
          assets={newFlag.assets}
          onAccessRuleSelection={this.setIndividualAccessRules} />
      })
    } else {
      this.setState({
        showModal: false
      })
    }
  }

  setIndividualAccessRules = async (selectedAccessRules) => {
    const flag = this.state.currentFlag
    const query = `mutation {
      addIndividualAccessRules(
        individualId: "${flag.individual.id}",
        serviceId: "${flag.serviceId}",
        accessRules: [${selectedAccessRules.map((rule) => `{
          asset: "${rule.asset}",
          role: "${rule.role}"
        }`).join(',')}])
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to add selected access rules',
        body: response.error.message
      })
    } else {
      const newFlag = await this.reCheckFlag(flag)
      this.props.updateFlag(flag, newFlag)
      this.setState({
        showModal: false
      })
    }
  }

  onGroupFormComplete = async (selectedGroups) => {
    this.pendingNewIndividual.groups = selectedGroups

    const query = `mutation {
      createIndividual(individual: {
        fullName: "${this.pendingNewIndividual.fullName}"
        ${this.pendingNewIndividual.primaryEmail ? `primaryEmail: "${this.pendingNewIndividual.primaryEmail}"` : ''}
        groups: [${selectedGroups.map((g) => `"${g}"`).join(',')}]
      })
    }`

    const response = await graphqlApi.request(query)
    const individualId = response.data.createIndividual

    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save New Individual',
        body: response.error.message
      })
    } else {
      await this.linkIndividual(individualId)
      await this.props.performAudit()
    }
  }

  reCheckFlag = async (flag) => {
    const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : `userId: "${flag.userIdentity.userId}"`

    const query = `{
      auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.props.flagResponseFormat}
    }`
    const response = await graphqlApi.request(query)

    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to check flag',
        body: response.error.message
      })
    } else {
      const newFlag = response.data.auditServiceUserAccount
      if (newFlag) {
        newFlag.key = flag.key
        return newFlag
      }
    }
  }

  render() {
    const flagsByService = this.props.flagsByService
    const flaggedServices = Object.keys(flagsByService).map((id) => this.props.serviceLookup[id])
    const oldestCachedDate = lodash.first(flaggedServices.map((s) => new Date(s.cachedDate)).sort()) || 'never'
    const flagCount = lodash.sumBy(flaggedServices, (service) => flagsByService[service.id].length)
    return (
      <div className="audit-flags">
        { flagCount > 0 &&
          <h2>
            {flagCount} Flagged Accounts
          </h2>
        }
        {
          this.props.showRefresh &&
          <span>
            <a className='button' onClick={() => this.props.performAudit(true)}>
              <i className="fa fa-refresh fa-2x" aria-hidden="true"></i>
              Update Cached Accounts
            </a>
            <span>
              Last update: {oldestCachedDate.toString()}
            </span>
          </span>
        }
        {
          flaggedServices.map((service) => {
            return (
              <div key={service.id} className='container'>
                <h2 className='title'>{service.displayName}</h2>

                <table className='table'>
                  <tbody>
                    {flagsByService[service.id].map((flag) => (
                      <tr key={flag.key} onClick={() => this.showModal(flag)}>
                        <td>
                          <div className='columns'>
                            <div className='column is-one-quarter'>{ service.displayName }</div>
                            { flag.userIdentity.userId &&
                              <div className='column is-one-quarter'>Username: {flag.userIdentity.userId}</div>
                            }
                            { flag.userIdentity.email &&
                              <div className='column is-one-quarter'>Email: {flag.userIdentity.email}</div>
                            }
                            { flag.userIdentity.fullName &&
                              <div className='column is-one-quarter'>Full Name: {flag.userIdentity.fullName}</div>
                            }
                          </div>

                        </td>
                      </tr>
                    )
                  )}
                  </tbody>
                </table>
              </div>
            )
          })
        }

        { this.state.showModal &&
          <Modal title={this.state.modalTitle} closeHandler={this.closeModal}>
            { this.state.modalContents }
          </Modal>
        }

        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
