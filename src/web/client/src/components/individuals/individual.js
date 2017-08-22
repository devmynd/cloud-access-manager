import React from 'react'
import IndividualSearch from '../shared/individual-search'
import graphqlApi from '../../graphql-api'
import lodash from 'lodash'
import MessagesContainer from '../shared/messages-container'

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

  save = async (individual) => {
    console.log(individual.groups)
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
    if (individual) {
      memberOfGroups = this.state.groups.filter((group) => individual.groups.includes(group.name))
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
                    <a className="button" onClick={() => this.removeGroup(group.name)}>Delete</a>
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
