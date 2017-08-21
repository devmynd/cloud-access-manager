import React from 'react'
import IndividualSearch from '../shared/individual-search'
import graphqlApi from '../../graphql-api'

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

  removeAccessRule = (event, rule) => {
    console.log(rule)
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
                    accessRuleDescriptions.map((d) => <li key={d}>{d}</li>)
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
                        this.mapToAccessRuleDescriptions(group.serviceAccessRules).map((d) =>
                        <li key={d}>
                          <a className="button" onClick={() => this.removeAccessRule(e, d)}>Delete</a>
                          {d}
                        </li>)
                      }
                    </ul>
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
