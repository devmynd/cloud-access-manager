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
import lodash from 'lodash'


export default class FlagList extends React.Component {
  state = {
    flags: [],
    showModal: false,
    currentFlag: null,
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
    await this.performAudit()
  }

  showModal = (flag) => {
    this.setState({
      showModal: true,
      currentFlag: flag,
      modalTitle: flag.individual
        ? "Set Individual Access Rules"
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
      modalTitle: `Manage ${flag.userIdentity.email || flag.userIdentity.userId || "blah"}`,
      modalContents: <NewIndividualForm flag={flag} onNewIndividualFormComplete={this.onNewIndividualFormComplete} onNewIndividualSelected={this.onNewIndividualSelected} />
    })
  }

  onNewIndividualFormComplete = (fullName, primaryEmail) => {
    if (!fullName || fullName.trim() === "") {
      this.messagesContainer.push({
        title: "Invalid Name",
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
      modalContents: <LinkIndividualForm onIndividualSelected={this.onIndividualSelectedToLink}/>
    })
  }

  onIndividualSelectedToLink =  async (individual) => {
    const flag = this.state.currentFlag

    // TODO: fullName should be flag.userIdentity.fullName, because we are linking the fullName from the service identity to the existing individual
    // As that is clearly confusing, how might we make this mutation more clear?
    const query = `mutation {
      linkServiceToIndividual(
        serviceId: "${flag.serviceId}",
        individualId:"${individual.id}",
        fullName: "${individual.fullName}",
        ${flag.userIdentity.email? `email: "${flag.userIdentity.email}"`: ""},
        ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"`: ""}
      )
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Failed to link to existing individual",
        body: response.error.message
      })
    } else {
      // TODO: Why overwrite the flag.individual?
      flag.individual = individual
      const newFlag = await this.reCheckFlag(flag)
      /// TODO: [...this.state.flags], because what if state changes and the flagIndex is no longer accurate?
      const flags = this.state.flags
      const flagIndex = lodash.findIndex(flags, (f) => f.key === flag.key)
      if (newFlag) {
        flags[flagIndex] = newFlag
        this.setState({
          flags,
          currentFlag: newFlag,
          modalTitle: "Set Individual Access Rules",
          modalContents: <IndividualAccessRulesForm service={this.serviceLookup[newFlag.serviceId]} assets={newFlag.assets} onAccessRuleSelection={this.setIndividualAccessRules} />
        })
      } else {
        // TODO: prefer `delete flags[flagIndex]`. Directly deletes the one property we care about, rather than iterating over the array and mapping to a new array.
        flags.splice(flagIndex, 1)
        this.setState({
          flags,
          showModal: false
        })
      }
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
        title: "Failed to add selected access rules",
        body: response.error.message
      })
    } else {
      const newFlag = await this.reCheckFlag(flag)
      const flags = this.state.flags
      const flagIndex = lodash.findIndex(flags, (f) => f.key === flag.key)
      if (newFlag) {
        flags[flagIndex] = newFlag
      } else {
        flags.splice(flagIndex, 1)
      }

      this.setState({
        showModal: false,
        flags
      })
    }
  }

  reCheckFlag = async (flag) => {
    const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"`  : `userId: "${flag.userIdentity.userId}"`

    const query = `{
      auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.flagQueryResponse}
    }`
    const response = await graphqlApi.request(query)

    if(response.error) {
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
    // TODO: perform audit is doing more than just an audit, update the graphql query.
    const query = `{
      auditAll ${this.flagQueryResponse}
      groups {
        name
      }
      services(isConfigured:true){
        id
        displayName
        roles
      }
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Failed to run audit",
        body: response.error.message
      })
      return
    }
    response.data.auditAll.forEach((flag) => {
      flag.key = `${flag.serviceId}${flag.userIdentity.email || flag.userIdentity.userId || new Date().valueOf()}`
    })
    this.groups = response.data.groups.map((g) => g.name)
    this.serviceLookup = {}
    response.data.services.forEach((s) => { this.serviceLookup[s.id] = s })
    this.setState({
      flags: response.data.auditAll
    })
  }

  onGroupFormComplete = async (selectedGroups) => {
    this.pendingNewIndividual.groups = selectedGroups
    const flag = this.state.currentFlag

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
      // TODO: fullName should be flag.userIdentity.fullName
      const query = `mutation {
        linkServiceToIndividual(serviceId: "${flag.serviceId}",
          individualId:"${individualId}",
          fullName: "${this.pendingNewIndividual.fullName}",
          ${flag.userIdentity.email? `email: "${flag.userIdentity.email}"`: ""},
          ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"`: ""}
        )
      }`
      const linkServiceResponse = await graphqlApi.request(query)
      const newFlag = await this.reCheckFlag(flag)
      // TODO: this is similar to a few other places in the code, can we reuse? also, [...]
      const flags = this.state.flags
      const flagIndex = lodash.findIndex(flags, (f) => f.key == flag.key)
      if (newFlag) {
        flags[flagIndex] = newFlag
        this.setState({
          flags,
          currentFlag: newFlag,
          modalTitle: "Set Individual Access Rules",
          modalContents: <IndividualAccessRulesForm service={this.serviceLookup[newFlag.serviceId]} assets={newFlag.assets} onAccessRuleSelection={this.setIndividualAccessRules} />
        })
      } else {
        // prefer delete
        flags.splice(flagIndex, 1)
        this.setState({
          showModal: false,
          flags
        })
      }
      await this.performAudit()
    }
  }

  render() {
    const flags = this.state.flags
    return (
      <div className="flag-list">
        { flags.length > 0  &&
          <h2>
            {flags.length} SERVICE ACCOUNTS
          </h2>
        }

        <table className='table'>
          <tbody className='uppercase-text'>
            {flags.map((flag) => (
              <tr key={flag.key} onClick={() => this.showModal(flag)}>
                <td className='column-padding'>
                  <span className='service-name column-padding'>{ this.serviceLookup[flag.serviceId].displayName } Username:</span>
                  <span className='user-identity'>{ flag.userIdentity.email || flag.userIdentity.userId }</span>
                  <span className='user-full-name'>{ flag.userIdentity.fullName || (flag.individual && flag.individual.fullName)}</span>
                </td>
                <td>
                  <span className='service-name'>Service:</span>
                    <span className='service-id'>{ flag.serviceId }</span> / { flag.assets.map((asset) => { asset.name }).length } Project Pending
                </td>
              </tr>
            )
            )}
          </tbody>
        </table>

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
