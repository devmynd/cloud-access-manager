import React from 'react'
import lodash from 'lodash'

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

  saveAssetSelection = () => {
    this.props.onAssetsSelected(this.state.selectedAssets)
  }

  render() {
    return (
      <div>
        <h2>{ this.props.service.displayName }</h2>
        <div className='field is-grouped'>
          <ul>
          {
            this.props.assets.map((asset) => {
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
          <button className='button' onClick={this.saveAssetSelection}>Finish</button>
        </div>
      </div>
    )
  }
}
