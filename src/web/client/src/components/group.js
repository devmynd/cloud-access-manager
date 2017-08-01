import React from 'react'
import graphqlApi from '../graphql-api'
import lodash from 'lodash'


export default class Group extends React.Component {
  state = {
    group: null
  }

  componentWillMount = async () => {
    const query = `{
                	group(name: "${this.props.name}") {
                    name
                    serviceAccessRules {
                      service {
                        id
                        displayName
                        roles
                      }
                      accessRules {
                        asset
                        role
                      }
                    }
                  }
                }`
    const response = await graphqlApi.request(query)

    this.setState({
      group: response.data.group
    })
  }

  removeService = (serviceId) => {
    console.log("todo: remove servcie")
  }

  isRoleEnabled = (role, accessRules) => {
    return !!lodash.find(accessRules, (rule) => rule.asset === "*" && (rule.role === "*" || rule.role === role))
  }

  render() {
    return (
    <div>
      <h1 className='title'>{this.props.name}</h1>
      { this.state.group &&
        <div>
          <h2 className='subtitle'>Access Rules</h2>
          <table className='table'>
            <thead>
              <tr>
                <th>Service</th>
                <th>Roles</th>
                <th className="has-text-right">Options</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.group.serviceAccessRules.map((serviceAccessRule) => (
                  <tr key={serviceAccessRule.service.id}>
                    <td>{serviceAccessRule.service.displayName}</td>
                    <td>
                      <div className='field is-grouped'>
                        {serviceAccessRule.service.roles.map((role) => (
                          <div key={role} className='control'>
                            <button className={`button is-primary ${this.isRoleEnabled(role, serviceAccessRule.accessRules) ? '' : 'is-outlined'}`}>{role}</button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className='field is-grouped is-grouped-right'>
                        <div className='control'>
                          <button className='button is-danger is-small' onClick={() => this.removeService(serviceAccessRule.service.id)}>Remove Service</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) )
              }
            </tbody>
          </table>
        </div>
      }
    </div>)
  }
}
