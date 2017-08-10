import React from 'react'
import graphqlApi from '../graphql-api'
import './flag-list.scss'
import Modal from './modal'
import UnknownUserOptions from './unknown-user-options'
import NewIndividualInfo from './new-individual-info'
import GroupSelectionForm from './group-selection-form'
import MessagesContainer from './messages-container'


export default class FlagList extends React.Component {
  state = {
    flags: [],
    showModal: false,
    currentFlag: null
  }

  componentWillMount = async () => {
    const query = `{
      audit {
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
      }
    }`

    const response = await graphqlApi.request(query)
    response.data.audit.forEach((flag) => {
      flag.key = `${flag.serviceId}${flag.userIdentity.email || flag.userIdentity.userId || new Date().valueOf()}`
    })
    this.setState({
      flags: response.data.audit
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
    event.preventDefault()

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
      modalContents: <GroupSelectionForm groups={["TODO", "GETGROUPS"]} onGroupFormComplete={this.onGroupFormComplete} individual={this.pendingNewIndividual} />
    })
  }

  onGroupFormComplete = async (selectedGroups) => {
    this.pendingNewIndividual.groups = selectedGroups

    const query = `mutation {
      createIndividual(individual: {
        fullName: ""
        ${this.pendingNewIndividual.primaryEmail ? `primaryEmail: "${this.pendingNewIndividual.primaryEmail}"` : ''}
        groups: [${selectedGroups.map((g) => `"${g}"`).join(',')}]
      })
    }`

    console.log(query)
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save New Individual',
        body: response.error.message
      })
    } else {
      
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
