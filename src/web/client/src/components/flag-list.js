import React from 'react'
import graphqlApi from '../graphql-api'
import './flag-list.scss'
import Modal from './modal'
import UnknownUserOptions from './unknown-user-options'
import NewIndividualInfo from './new-individual-info'
import GroupSelectionForm from './group-selection-form'
import MessagesContainer from './messages-container'
import lodash from 'lodash'


export default class FlagList extends React.Component {
  state = {
    flags: [],
    showModal: false,
    currentFlag: null,
    groups: []
  }

  flagQueryResponse = `{
    individual {
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
      auditAll ${this.flagQueryResponse}
      groups {
        name
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
    this.setState({
      flags: response.data.auditAll,
      groups: response.data.groups.map((g) => g.name)
    })
  }

  showModal = (flag) => {
    this.setState({
      showModal: true,
      currentFlag: flag,
      modalTitle: `Manage ${flag.userIdentity.email || flag.userIdentity.userId}`,
      modalContents: flag.individual
        ? <h1>Existing user</h1>
        : <UnknownUserOptions flag={flag} onNewIndividualSelected={this.onNewIndividualSelected} />
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
      modalContents: <NewIndividualInfo flag={flag} onNewIndividualFormComplete={this.onNewIndividualFormComplete} onNewIndividualSelected={this.onNewIndividualSelected} />
    })
  }

  onNewIndividualFormComplete = (fullName, primaryEmail) => {
    this.pendingNewIndividual = {
      fullName,
      primaryEmail
    }
    this.setState({
      modalTitle: `Select groups`,
      modalContents: <GroupSelectionForm groups={this.state.groups} onGroupFormComplete={this.onGroupFormComplete} individual={this.pendingNewIndividual} />
    })
  }

  onGroupFormComplete = async (selectedGroups) => {
    this.pendingNewIndividual.groups = selectedGroups
    const flag = this.state.currentFlag

    const query = `mutation {
      createIndividual(individual: {
        fullName: ""
        ${this.pendingNewIndividual.primaryEmail ? `primaryEmail: "${this.pendingNewIndividual.primaryEmail}"` : ''}
        groups: [${selectedGroups.map((g) => `"${g}"`).join(',')}]
      })
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save New Individual',
        body: response.error.message
      })
    } else {
      const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"`  : `userId: "${flag.userIdentity.userId}"`

      const query = `{
        auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.flagQueryResponse}
      }`
      const response = await graphqlApi.request(query)

      if(response.error) {
        this.messagesContainer.push({
          title: 'Failed to Audit Service Account',
          body: response.error.message
        })
      } else {
        const newFlag = response.data.auditServiceUserAccount
        if (newFlag) {
          // todo: show access rules
          console.log("TODO: Show access rules")
        } else {
          const flags = this.state.flags
          lodash.remove(flags, (f) => f.key == flag.key)
          this.setState({
            showModal: false,
            flags: flags
          })
        }
      }
    }
  }

  render() {
    const flags = this.state.flags
    return (
      <div>
        { flags.length > 0  &&
          <h2>
            {flags.length} SERVICE ACCOUNTS
          </h2>
        }

        <table className='table flag-table'>
          <tbody className='uppercase-text'>
            {flags.map((flag) => (
              <tr key={flag.key} onClick={() => this.showModal(flag)}>
                <td className='column-padding'><span className='service-name column-padding'>{ flag.serviceId } { flag.userIdentity.email ? "EMAIL" : "USERNAME" }:</span> <span className='user-identity'>{ flag.userIdentity.email || flag.userIdentity.userId || flag.userIdentity.fullName }</span></td>
                <td>
                  <span className='service-name'>SERVICE:</span>
                    <span className='service-id'>{ flag.serviceId }</span> / { flag.assets.map((asset) => { asset.name }).length } PROJECTS PENDING
                </td>
              </tr>
            )
            )}
          </tbody>
        </table>

        { this.state.showModal &&
          <Modal title={this.state.modalTitle} closeHandler={this.closeModal}>
            { this.state.modalContents }
            {/* <GroupSelectionForm groups={this.state.groups} fullName={this.state.fullName} primaryEmail={this.state.primaryEmail} flag={this.props.flag} /> */}
          </Modal>
        }

        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
