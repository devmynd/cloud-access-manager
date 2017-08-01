import React from 'react'
import { graphqlApi } from '../graphql-api'
import Modal from './modal'
import MessagesContainer from './messages-container'
import lodash from 'lodash'

export default class GroupList extends React.Component {

  state = {
    groups: [],
    showModal: false,
    editMode: false,
    selectedGroup: null
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

  showGroupModal = (group, editMode = true) => {
    this.setState({
      showModal: true,
      editMode: editMode,
      selectedGroup: group
    })
  }

  closeGroupModal = () => {
    this.setState({
      showModal: false
    })
  }

  nameDidChange = (event) => {
    const selectedGroup = this.state.selectedGroup
    selectedGroup.name = event.target.value
    this.setState({ selectedGroup })
  }

  onModalMounted = () => {
    if (!this.state.editMode) {
      this.refs.groupName.focus()
    }
  }

  submitGroup = async (event) => {
    event.preventDefault()


    const groups = [...this.state.groups]
    const selectedGroup = this.state.selectedGroup
    const foundIndex = lodash.findIndex(groups, (group) => group.name === selectedGroup.name)

    if (!this.state.editMode && foundIndex !== -1) {
      this.messagesContainer.push({
        title: "Group Name Already in Use",
        body: (<p>The group name you entered already exists.<br/>Please change the name or edit the existing group instead.</p>)
      })
      this.refs.groupName.select()
      return
    }

    this.closeGroupModal()
    const query = `mutation {
                    setGroupAccessRules(name: "${this.state.selectedGroup.name}", serviceAccessRules: [])
                  }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save Group',
        body: response.error.message
      })
    } else {

      if (foundIndex === -1) {
        groups.push(selectedGroup)
      } else {
        groups[foundIndex] = selectedGroup
      }
      this.setState({ groups })
    }
  }

  deleteGroup = async (name) => {
    const query = `mutation { deleteGroup(name: "${name}") }`
    const response = await graphqlApi.request(query)

    if (response.error) {
      this.messagesContainer.push({
        title: "Failed to Delete Group",
        body: response.error.message
      })
    } else {
      const groups = this.state.groups
      lodash.remove(groups, (group) => group.name === name)
      this.setState({ groups })
    }
  }

  render () {
    const groups = this.state.groups

    return (
      <div>
        <button className='button is-primary is-pulled-right' onClick={() => this.showGroupModal({ name: '', accessRules: [] }, false)}>Add New Group</button>
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
                      <button className='button is-danger is-small' onClick={() => this.deleteGroup(group.name)} >Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        { this.state.showModal &&
          <Modal title={`Configure Group: ${this.state.selectedGroup.name}`} closeHandler={this.closeGroupModal} onMounted={this.onModalMounted} >
            <form onSubmit={this.submitGroup}>
              <div className="field">
                <div className="control">
                  <input disabled={this.state.editMode} ref="groupName" className="input" type="text" placeholder="Group Name" value={this.state.selectedGroup.name} onChange={this.nameDidChange} />
                </div>
              </div>
              <div className='field is-grouped'>
                <div className='control'>
                  <button className='button is-success' type='submit'>Save</button>
                </div>
                <div className='control'>
                  <button className='button' onClick={this.closeGroupModal}>Cancel</button>
                </div>
              </div>
            </form>
          </Modal>
        }
        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
