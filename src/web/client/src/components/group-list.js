import React from 'react'
import { graphqlApi } from '../graphql-api'
import Modal from './modal'
import MessagesContainer from './messages-container'
import lodash from 'lodash'
import { Link } from 'react-router-dom'

export default class GroupList extends React.Component {

  state = {
    groups: [],
    showModal: false,
    newGroupName: null
  }

  componentWillMount = async () => {
    const query = `{ groups { name } }`
    const response = await graphqlApi.request(query)

    this.setState({
      groups: response.data.groups
    })
  }

  showGroupModal = () => {
    this.setState({
      showModal: true,
      newGroupName: ""
    })
  }

  closeGroupModal = () => {
    this.setState({
      showModal: false
    })
  }

  nameDidChange = (event) => {
    const newGroupName = event.target.value
    this.setState({ newGroupName })
  }

  onModalMounted = () => {
    if (!this.state.editMode) {
      this.refs.groupName.focus()
    }
  }

  submitGroup = async (event) => {
    event.preventDefault()
    const groups = [...this.state.groups]
    const newGroupName = this.state.newGroupName
    const foundIndex = lodash.findIndex(groups, (group) => group.name === newGroupName)

    if (foundIndex !== -1) {
      this.messagesContainer.push({
        title: "Group Name Already in Use",
        body: (<p>The group name you entered already exists.<br/>Please change the name or edit the existing group instead.</p>)
      })
      this.refs.groupName.select()
      return
    }

    this.closeGroupModal()
    const query = `mutation {
                    setGroupAccessRules(name: "${newGroupName}", serviceAccessRules: [])
                  }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save Group',
        body: response.error.message
      })
    } else {
      groups.push({ name: newGroupName })
      this.setState({ groups })
      this.props.history.push(`/groups/${newGroupName}`)
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
        <button className='button is-primary is-pulled-right' onClick={this.showGroupModal}>Add New Group</button>
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
                      <Link className="button is-primary is-small" to={`/groups/${group.name}`}>Edit</Link>
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
          <Modal title="Name New Group" closeHandler={this.closeGroupModal} onMounted={this.onModalMounted} >
            <form onSubmit={this.submitGroup}>
              <div className="field">
                <div className="control">
                  <input ref="groupName" className="input" type="text" placeholder="Group Name" value={this.state.newGroupName} onChange={this.nameDidChange} />
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
