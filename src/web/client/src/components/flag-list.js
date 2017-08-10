import React from 'react'
import graphqlApi from '../graphql-api'
import './flag-list.scss'
import Modal from './modal'
import UnknownUserOptions from './unknown-user-options'
import NewIndividualInfo from './new-individual-info'


export default class FlagList extends React.Component {
  state = {
    flags: [],
    showModal: false,
    currentFlag: null,
    step: 1
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
    this.setState({
      flags: response.data.audit
    })
  }

  showIndividualModal = (flag) => {
    this.setState({
      showModal: true,
      currentFlag: flag
    })
  }

  onModalMounted = () => {
    console.log("Implement")
  }

  closeConfiguration = (event) => {
    event.preventDefault()

    this.setState({
      showModal: false,
      step: 1
    })
  }

  nextStep = () => {
    this.setState(
      {
        step: this.state.step + 1
      }
    )
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
            {flags.map((flag, index) => (
              <tr key={index} onClick={() => this.showIndividualModal(flag)}>
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
          <Modal title={`Manage ${this.state.currentFlag.userIdentity.email || this.state.currentFlag.userIdentity.userId}`} closeHandler={this.closeConfiguration} onMounted={this.onModalMounted}>
          { this.state.step === 1 && !this.state.currentFlag.individual && <UnknownUserOptions flag={this.state.currentFlag} nextStep={this.nextStep} /> }
          { this.state.step === 2 && !this.state.currentFlag.individual && <NewIndividualInfo  flag={this.state.currentFlag} nextStep={this.nextStep} /> }
          </Modal>
        }
      </div>
    )
  }
}
