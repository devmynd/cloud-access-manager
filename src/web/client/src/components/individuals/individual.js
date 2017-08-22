import React from 'react'
import IndividualSearch from '../shared/individual-search'
import graphqlApi from '../../graphql-api'
import lodash from 'lodash'

export default class Individual extends React.Component {
  state = {
    individual: null,
    groups: [],
    // TODO: Not used
    individualAccessRules: {}
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

  mapToAccessRuleDescriptions = (serviceAccessRules) => {
    let accessRuleDescriptions = []
    serviceAccessRules.forEach((serviceAccess) => {
      serviceAccess.accessRules.forEach((rule) => {
        let desc = serviceAccess.service.displayName
        if (rule.asset !== "*") {
          desc += ` / ${rule.asset}`
        }
        if (rule.role !== "*") {
          desc += ` / ${rule.role}`
        }
        accessRuleDescriptions.push(desc)
      })
    })

    return accessRuleDescriptions
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
    //TODO: Groups do get removed but when the last remaining group is removed, the individual
    // is saved in json file with a groups array of [""] instead of []. Need to figure out where and why
    // this is happening
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
    const query = `mutation {
      updateIndividual(individual: {
        individualId: "${individual.id}",
        fullName: "${individual.fullName}",
        accessRules: [${individual.accessRules.map(this.mapServiceAccessRuleToMutation).join(',')}],
        groups: "${individual.groups}",
        primaryEmail: "${individual.primaryEmail}"
      })
    }`

    //TODO: Implement error handling for response with errors
    await graphqlApi.request(query)

    this.setState({ individual })
  }

  render() {
    const individual = this.state.individual
    let accessRuleDescriptions = []
    let memberOfGroups = []
    if (individual) {
      accessRuleDescriptions = this.mapToAccessRuleDescriptions(individual.accessRules)
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
                    individual.accessRules.map((serviceAccessRule) =>
                      serviceAccessRule.accessRules.map((rule) =>
                      <li key={serviceAccessRule.service.id + rule.asset + rule.role}>
                        {/* TODO: Why not use the mapToAccessRuleDescriptions helper here?  */}
                        {serviceAccessRule.service.displayName} { rule.asset === "*" ? null : ` / ${rule.asset}`} { rule.role === "*" ? null  : ` / ${rule.role}` }
                        <a className="button" onClick={() => this.removeAccessRule(serviceAccessRule.service.id, rule)}>Delete</a>
                      </li>))
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
                        this.mapToAccessRuleDescriptions(group.serviceAccessRules).map((d) => <li key={d}>{d}</li>)
                      }
                    </ul>
                    <a className="button" onClick={() => this.removeGroup(group.name)}>Delete</a>
                  </div>
                </section>
              ))
            }
          </div>
        }
      </div>
    )
  }
}
