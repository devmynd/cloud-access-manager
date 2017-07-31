import React from 'react'
import { graphqlApi } from '../graphql-api'

export default class GroupList extends React.Component {
  constructor () {
    super()
    this.state = {
      groups: []
    }
  }

  componentWillMount = async () => {
    const query = `
      { groups {
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

    this.setState({
      groups: response.data.groups
    })
  }

  render () {
    const groups = this.state.groups

    return (
      <div className='group-list'>
        <h1 className='title'>Groups</h1>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='options-column has-text-right'>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              groups.map((group) => (
                <tr key={group.name}>
                  <td>{ group.name }</td>
                  <td className='field is-grouped is-grouped-right'>
                    <div className='control'>
                      <button className='button is-primary is-small'>Edit</button>
                    </div>
                    <div className='control'>
                      <button className='button is-danger is-small'>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}
