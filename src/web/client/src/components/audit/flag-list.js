import React from 'react'
import graphqlApi from '../../graphql-api'
import './flag-list.scss'
import Modal from '../shared/modal'
import UnknownUserForm from './unknown-user-form'
import NewIndividualForm from './new-individual-form'
import GroupSelectionForm from './group-selection-form'
import IndividualAccessRulesForm from './individual-access-rules-form'
import LinkIndividualForm from './link-individual-form'
import MessagesContainer from '../shared/messages-container'
import AuditProgress from '../shared/audit-progress'
import lodash from 'lodash'

export default class FlagList extends React.Component {
  state = {
    flagsByService: {},
    showModal: false,
    progressCount: 0,
    progressTotalCount: 0,
    progressCurrentService: null,
    currentFlag: null
  }

  flagQueryResponse = `{
    individual {
      id
      fullName
      primaryEmail
      serviceUserIdentities {
        serviceId
        userIdentity {
          email
          userId
        }
      }
      accessRules {
        service {
          id
        }
        accessRules {
          asset
          role
        }
      }
      groups
    }
    serviceId
    userIdentity {
      email
      userId
      fullName
    }
    assets {
      name
      role
    }
  }`

  componentWillMount = async () => {
    const query = `{
      groups {
        name
      }
      services(isConfigured:true){
        id
        displayName
        roles
        isCached
      }
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to load group and service info',
        body: response.error.message
      })
      return
    }
    this.groups = response.data.groups.map((g) => g.name)
    this.services = response.data.services
    this.serviceLookup = {}
    this.services.forEach((s) => { this.serviceLookup[s.id] = s })
    this.setState({
      progressTotalCount: this.services.length
    })
    await this.performAudit()
  }

  showModal = (flag) => {
    this.setState({
      showModal: true,
      currentFlag: flag,
      modalTitle: flag.individual
        ? 'Set Individual Access Rules'
        : `Unknown User: ${flag.userIdentity.email || flag.userIdentity.userId}`,
      modalContents: flag.individual
        ? <IndividualAccessRulesForm service={this.serviceLookup[flag.serviceId]} assets={flag.assets} onAccessRuleSelection={this.setIndividualAccessRules} />
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
      modalContents: <GroupSelectionForm groups={this.groups} onGroupFormComplete={this.onGroupFormComplete} individual={this.pendingNewIndividual} />
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
    let flagsByService = this.state.flagsByService
    const flags = [...flagsByService[flag.serviceId]]
    const flagIndex = lodash.findIndex(flags, (f) => f.key === flag.key)
    if (newFlag) {
      flags[flagIndex] = newFlag
      flagsByService[flag.serviceId] = flags
      this.setState({
        flagsByService,
        currentFlag: newFlag,
        modalTitle: 'Set Individual Access Rules',
        modalContents: <IndividualAccessRulesForm service={this.serviceLookup[newFlag.serviceId]} assets={newFlag.assets} onAccessRuleSelection={this.setIndividualAccessRules} />
      })
    } else {
      flags.splice(flagIndex, 1)
      flagsByService[flag.serviceId] = flags
      this.setState({
        flagsByService,
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
      let flagsByService = this.state.flagsByService
      const flags = [...flagsByService[flag.serviceId]]
      const flagIndex = lodash.findIndex(flags, (f) => f.key === flag.key)
      if (newFlag) {
        flags[flagIndex] = newFlag
      } else {
        flags.splice(flagIndex, 1)
      }
      flagsByService[flag.serviceId] = flags

      this.setState({
        showModal: false,
        flagsByService
      })
    }
  }

  reCheckFlag = async (flag) => {
    const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : `userId: "${flag.userIdentity.userId}"`

    const query = `{
      auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.flagQueryResponse}
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

  performAudit = async () => {
    this.setState({
      progressCount: 0
    })
    for (let serviceId in this.serviceLookup) {
      this.setState({
        progressCurrentService: this.serviceLookup[serviceId].displayName
      })
      const flags = await this.performAuditForService(serviceId)

      let flagsByService = this.state.flagsByService
      if (flags.length > 0) {
        flagsByService[serviceId] = flags
      } else {
        delete flagsByService[serviceId]
      }

      let progressCount = this.state.progressCount + 1
      this.setState({
        flagsByService,
        progressCount
      })
    }
  }

  performAuditForService = async (serviceId) => {
    const query = `{
      auditService(serviceId: "${serviceId}") ${this.flagQueryResponse}
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: `Failed to run audit for service: ${this.serviceLookup[serviceId].displayName}`,
        body: response.error.message
      })
      return []
    } else {
      let flags = response.data.auditService
      flags.forEach((flag) => {
        flag.key = `${flag.serviceId}${flag.userIdentity.email || flag.userIdentity.userId || new Date().valueOf()}`
      })
      return flags
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
      await this.performAudit()
    }
  }

  render () {
    const flagsByService = this.state.flagsByService
    const flaggedServices = Object.keys(flagsByService).map((id) => this.serviceLookup[id])
    const flagCount = lodash.sumBy(flaggedServices, (service) => flagsByService[service.id].length)
    const allCached = lodash.every(this.services, (s) => s.isCached)
    const showProgress = !allCached && this.state.progressCount < this.state.progressTotalCount
    return (
      <div className='flag-list'>
        {
           showProgress &&
           <AuditProgress
             completeCount={this.state.progressCount}
             outOfCount={this.state.progressTotalCount}
             currentService={this.state.progressCurrentService} />
        }
        { flagCount > 0 &&
          <h2>
            {flagCount} Flagged Accounts
          </h2>
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
