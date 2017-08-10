import React from 'react'
import graphqlApi from '../graphql-api'
import lodash from 'lodash'

export default class GroupSelectionForm extends React.Component {
  state = {
    selectedGroups: []
  }

  saveGroups = (e) => {
    e.preventDefault()
    this.props.onGroupFormComplete(this.state.selectedGroups)
  }

  updateGroupSelection = (event) => {
    const targetGroup = event.target.value
    let selectedGroups = [...this.state.selectedGroups]

    if (event.target.checked) {
      selectedGroups.push({name: targetGroup})
    } else {
      selectedGroups = lodash.remove(selectedGroups, (group) => group === targetGroup)
    }

    this.setState({
       selectedGroups
    })
  }

  render() {
    return (
      <div>
        <h3 className="is-centered">
          Add { this.props.individual.fullName || "this user" } to a group
        </h3>
        <h4>
          { this.props.individual.primaryEmail }
        </h4>
        {
          this.props.groups.length > 0 &&
          <div>
            <ul>
              {
                this.props.groups.map((group) => {
                  return (
                    <li key={group}>
                      <label className="checkbox">
                        <input onChange={this.updateGroupSelection} type="checkbox" value={group}/>
                        {group}
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
