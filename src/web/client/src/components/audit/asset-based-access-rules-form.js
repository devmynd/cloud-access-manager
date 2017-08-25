import React from 'react'
import lodash from 'lodash'
import graphqlApi from '../../graphql-api'

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
    const accessRules = this.state.selectedAssets.map((asset) => {
      return {
        role: asset.role,
        asset: asset.name
      }
    })

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

  render() {
    return (
      <div>
        <h2>{ this.props.context.service.displayName }</h2>
        <div className='field is-grouped'>
          <ul>
          {
            this.props.context.flag.assets.map((asset) => {
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
        </div>
      </div>
    )
  }
}
