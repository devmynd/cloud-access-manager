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

  render() {
    const groups = this.state.groups
    return (
      <div>
        <h3 className="is-centered">
          Add { this.props.fullName } to a group
          { this.props.primaryEmail }
        </h3>
        {
          groups.length > 0 &&
          <ul>
            {
              groups.map((group) => {
                return <label key={group.name} className="checkbox">
                        <input type="checkbox"/>
                        {group.name}
                      </label>
              })
            }
          </ul>
        }
      </div>
    )
  }
}
