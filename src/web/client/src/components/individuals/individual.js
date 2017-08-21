import React from 'react'
import IndividualSearch from '../shared/individual-search'

export default class Individual extends React.Component {
  state = {
    individual: null
  }

  onIndividualSelected = (individual) => {
    this.setState({
      individual
    })
  }

  render() {
    const individual = this.state.individual
    let accessRuleDescriptions = []
    if (individual) {
      individual.accessRules.forEach((serviceAccess) => {
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
          </div>
        }
      </div>
    )
  }
}
