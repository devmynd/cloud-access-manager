import React from 'react'
import { graphqlApi } from '../graphql-api'

export default class GroupList extends React.Component {
  constructor () {
    super()
    this.state = {
      groups: [],
      showModal: false,
      selectedGroup: null
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

  showGroupModal = (group) => {
    this.setState({
      showModal: true,
      selectedGroup: group
    })
  }

  render () {
    const groups = this.state.groups

    return (
      <div>
        <button className='button is-primary is-pulled-right' onClick={() => this.showGroupModal({ name: '', accessRules: [] })}>Add New Group</button>
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
                      <button className='button is-primary is-small' onClick={() => this.showGroupModal(group)}>Edit</button>
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

        {/* { this.state.showModal &&
          <Modal title={`Configure Group: ${this.state.selectedGroup.name}`} />
        } */}
      </div>
    )
  }
}
