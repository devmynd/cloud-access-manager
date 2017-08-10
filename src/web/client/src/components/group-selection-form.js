import React from 'react'
import graphqlApi from '../graphql-api'

export default class GroupSelectionForm extends React.Component {
  state = {
    groups: []
  }

  componentWillMount = async () => {
    const query = `{ groups { name } }`
    const response = await graphqlApi.request(query)

    this.setState({
      groups: response.data.groups
    })
  }

  saveGroups = (e) => {
    e.preventDefault()
    console.log("todo:implement")
  }

  render() {
    const groups = this.state.groups
    return (
      <div>
        <h3 className="is-centered">
          Add { this.props.fullName } to a group
        </h3>
        <h4>
          { this.props.primaryEmail }
        </h4>
        {
          groups.length > 0 &&
          <div>
            <ul>
              {
                groups.map((group) => {
                  return (
                    <li key={group.name}>
                      <label className="checkbox">
                        <input type="checkbox"/>
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
