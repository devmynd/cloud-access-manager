import React from 'react'
import graphqlApi from '../graphql-api'
import lodash from 'lodash'

export default class GroupSelectionForm extends React.Component {
  state = {
    availableGroups: [],
    selectedGroups: []
  }

  componentWillMount = async () => {
    const query = `{ groups { name } }`
    const response = await graphqlApi.request(query)

    this.setState({
      availableGroups: response.data.groups
    })
  }

  saveGroups = (e) => {
    e.preventDefault()
    console.log("todo:implement")
  }

  updateGroupSelection = (event, groupName) => {
    //TODO: This is not working as expected. Need to fix.
    let selectedGroups = [...this.state.selectedGroups]
    event.target.checked ? selectedGroups.push({name: groupName}) : lodash.remove(selectedGroups, (group) => group.name === groupName)

    this.setState({
      selectedGroups: selectedGroups
    })
  }

  render() {
    const availableGroups = this.state.availableGroups
    return (
      <div>
        <h3 className="is-centered">
          Add { this.props.fullName } to a group
        </h3>
        <h4>
          { this.props.primaryEmail }
        </h4>
        {
          availableGroups.length > 0 &&
          <div>
            <ul>
              {
                availableGroups.map((group) => {
                  return (
                    <li key={group.name}>
                      <label className="checkbox">
                        <input onChange={(e) => this.updateGroupSelection(e, group.name)} type="checkbox"/>
                        {group.name}
                      </label>
                    </li>
                  )
                })
              }
            </ul>
            <button className="button" onClick={this.saveGroups}>Save and Continue</button>
          </div>
        }
      </div>
    )
  }
}
