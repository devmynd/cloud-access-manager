import React from 'react'
import lodash from 'lodash'
import graphqlApi from '../../../graphql-api'

export default class AssetBasedAccessRulesForm extends React.Component {
  state = {
    selectedAssets: []
  }

  assetToggled = (event, asset) => {
    const selectedAssets = this.state.selectedAssets

    if (event.target.checked) {
      selectedAssets.push(asset)
    } else {
      lodash.remove(selectedAssets, (a) =>  a === asset)
    }

    this.setState({
      selectedAssets
    })
  }

  save = async () => {
    const flag = this.props.context.flag
    let accessRules = this.props.context.accessRules
    accessRules = accessRules.concat(this.state.selectedAssets.map((asset) => {
      return {
        role: asset.role,
        asset: asset.name
      }
    }))
    this.props.context.accessRules = accessRules

    const query = `mutation {
      addIndividualAccessRules(
        individualId: "${flag.individual.id}",
        serviceId: "${flag.serviceId}",
        accessRules: [${accessRules.map((rule) => `{
          asset: "${rule.asset}",
          role: "${rule.role ? rule.role : '*'}"
        }`).join(',')}])
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to add selected access rules',
        body: response.error.message
      })
      throw response.error
    }

    this.props.context.reCheckFlag(flag)
  }

  rollback = () => {
    let accessRules = this.props.context.accessRules
    throw new Error("TODO: rollback newly added access rules")
  }

  onFinishClick = () => {
    this.props.context.goToNext()
  }

  render() {
    return (
      <div>
        <h2>{ this.props.context.service.displayName }</h2>
        <div className='field is-grouped'>
          <ul>
          {
            this.props.context.remainingAssets.map((asset) => {
              return (
                <li key={`${asset.name}-${asset.role}`}>
                  <span>
                    { asset.name } / { asset.role }
                  </span>
                  <label className='checkbox'>
                    <input onChange={(e) => this.assetToggled(e, asset)} type='checkbox' />
                  </label>
                </li>
              )
            })
          }
          </ul>
          <a className="button" onClick={this.onFinishClick}>Save and Finish</a>
        </div>
      </div>
    )
  }
}
