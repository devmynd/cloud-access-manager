import React from 'react'
import IndividualSearch from '../shared/individual-search'
import graphqlApi from '../../graphql-api'
import lodash from 'lodash'
import MessagesContainer from '../shared/messages-container'
import DropdownButton from '../shared/dropdown-button'

export default class Individual extends React.Component {
  state = {
    individual: null,
    groups: []
  }

  componentDidMount = async () => {
    const query = `{
     groups {
      name
      serviceAccessRules {
        service {
          id
          displayName
        }
        accessRules {
          asset
          role
        }
      }
     }
    }`

    const response = await graphqlApi.request(query)

    if (!response.error) {
      this.setState({
        groups: response.data.groups
      })
    }
  }

  onIndividualSelected = (individual) => {
    this.setState({
      individual
    })
  }

  createAccessRuleDescription = (service, rule) => {
    let desc = service.displayName
    if (rule.asset !== "*") {
      desc += ` / ${rule.asset}`
    }
    if (rule.role !== "*") {
      desc += ` / ${rule.role}`
    }
    return desc
  }

  removeAccessRule = (serviceId, accessRule) => {
    const individual = this.state.individual
    const serviceIndex = lodash.findIndex(individual.accessRules, (serviceAccessRule) => {
      return serviceAccessRule.service.id === serviceId
    })

    lodash.remove(individual.accessRules[serviceIndex].accessRules, (r) => r === accessRule)

    this.save(individual)
  }

  removeGroup = (groupName) => {
    const individual = this.state.individual
    const groupIndex = lodash.findIndex(individual.groups, (g) => g === groupName)
    individual.groups.splice(groupIndex, 1)
    this.save(individual)
  }

  mapServiceAccessRuleToMutation = (serviceAccessRule) => {
    return `{
      serviceId:"${serviceAccessRule.service.id}",
      accessRules: [${serviceAccessRule.accessRules.map(this.mapAccessRuleToMutation).join(',')}]
    }`
  }

  mapAccessRuleToMutation = (accessRule) => {
    return `{
      asset: "${accessRule.asset}",
      role: "${accessRule.role}"
    }`
  }

  addGroup = (groupName) => {
    let individual = this.state.individual
    individual.groups.push(groupName)
    this.save(individual)
  }

  unlinkService = async (serviceId) => {
    let individual = this.state.individual
    const query = `mutation {
      unlinkService(
        serviceId: "${serviceId}",
        individualId: "${individual.id}") }`
    const response = await graphqlApi.request(query)
    if(response.error) {
      this.messagesContainer.push({
        title: "Error unlinking service",
        body: response.error.message
      })
      return
    }

    lodash.remove(individual.serviceUserIdentities, (id) => id.serviceId === serviceId)
    this.setState({
      individual
    })
  }

  // TODO: break up into seperate save methods to be consistent with other mutations
  save = async (individual) => {
    const query = `mutation {
      updateIndividual(individual: {
        individualId: "${individual.id}",
        fullName: "${individual.fullName}",
        accessRules: [${individual.accessRules.map(this.mapServiceAccessRuleToMutation).join(',')}],
        groups: [${individual.groups.map((g) => `"${g}"`).join(',')}],
        primaryEmail: "${individual.primaryEmail}"
      })
    }`


    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Error saving changes to individual",
        body: response.error.message
      })
    } else {
      this.setState({ individual })
    }
  }

  render() {
    const individual = this.state.individual
    let memberOfGroups = []
    let addGroupOptions = []
    let primaryLinkedAccounts = []
    let alternateLinkedAccounts = []
    if (individual) {

      const membershipPartition = lodash.partition(this.state.groups, (group) => individual.groups.includes(group.name))
      memberOfGroups = membershipPartition[0]
      addGroupOptions = membershipPartition[1].map((g) => { return { text: g.name, value: g.name }})

      const linkedAccountPartition = lodash.partition(
        individual.serviceUserIdentities,
        (sid) => sid.userIdentity.email && sid.userIdentity.email === individual.primaryEmail)
      primaryLinkedAccounts = linkedAccountPartition[0]
      alternateLinkedAccounts = linkedAccountPartition[1]
    }

    return (
      <div>
        <IndividualSearch onIndividualSelected={this.onIndividualSelected} />
        {
          individual &&
          <div>
            <section className="section">
              <div className="container">
                <h2 className="subtitle">Name</h2>
                <p>{individual.fullName}</p>
                <p>{individual.primaryEmail}</p>
              </div>
            </section>

            <section className="section">
              <div className="container">
                <h2 className="subtitle">Linked Service Accounts</h2>


                {
                  primaryLinkedAccounts.length > 0 &&
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Primary Email</th>
                        <th>Accounts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        primaryLinkedAccounts.map((serviceIdentity, index) => (
                          <tr key={serviceIdentity.serviceId}>
                            <td>{index === 0 && serviceIdentity.userIdentity.email}</td>
                            <td>{serviceIdentity.serviceId}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                }
                {
                  alternateLinkedAccounts.length > 0 &&
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Identity</th>
                        <th>Account</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        alternateLinkedAccounts.map((serviceIdentity) => (
                          <tr key={serviceIdentity.serviceId}>
                            <td>
                              <ul>
                                { serviceIdentity.userIdentity.fullName &&
                                  <li>Full Name: {serviceIdentity.userIdentity.fullName}</li>
                                }
                                { serviceIdentity.userIdentity.email &&
                                  <li>Email: {serviceIdentity.userIdentity.email}</li>
                                }
                                { serviceIdentity.userIdentity.userId &&
                                  <li>Username: {serviceIdentity.userIdentity.userId}</li>
                                }
                              </ul>
                            </td>
                            <td>{serviceIdentity.serviceId}</td>
                            <td>
                              <a className="button" onClick={() => this.unlinkService(serviceIdentity.serviceId)}>Unlink</a>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                }
              </div>
            </section>

            <section className="section">
              <div className="container">
                <h2 className="subtitle">Individual Access Rules</h2>
                <ul>
                  {
                    individual.accessRules.map((serviceAccess) =>
                      serviceAccess.accessRules.map((rule) => {
                        const desc = this.createAccessRuleDescription(serviceAccess.service, rule)
                        return (<li key={desc}>{desc}
                                  <a className="button" onClick={() => this.removeAccessRule(serviceAccess.service.id, rule)}>Delete</a>
                                </li>)
                      }))
                  }
                </ul>
              </div>
            </section>

            { addGroupOptions.length > 0 } {
              <DropdownButton className='is-pulled-right'
                title={`Add ${individual.fullName} to a group`}
                options={addGroupOptions}
                onValueSelected={this.addGroup} />
            }

            {
              memberOfGroups.map((group) => (
                <section key={group.name} className="section">
                  <div className="container">
                    <h2 className="subtitle">Group '{group.name}' Access Rules</h2>
                    <ul>
                      {
                        group.serviceAccessRules.map((serviceAccess) =>
                          serviceAccess.accessRules
                            .map((r) => this.createAccessRuleDescription(serviceAccess.service, r))
                            .map((d) => <li key={d}>{d}</li>)
                        )
                      }
                    </ul>
                    <a className="button" onClick={() => this.removeGroup(group.name)}>Remove from {group.name} group</a>
                  </div>
                </section>
              ))
            }


          </div>
        }
        <MessagesContainer ref={(m) => { this.messagesContainer = m}} />
      </div>
    )
  }
}
