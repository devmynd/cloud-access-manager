import React from 'react'

export default class IndividualAccessRulesForm extends React.Component {
  state = {
    selectedAccessRules: []
  }

  updateAccessRuleSelection = (event, targetAsset) => {
    let selectedAccessRules = [...this.state.selectedAccessRules]

    if (event.target.checked) {
      selectedAccessRules.push({ asset: targetAsset.name, role: targetAsset.role })
    } else {
      selectedAccessRules = lodash.remove(selectedAccessRules, (rule) => rule.asset === targetAsset.name && rule.role === targetAsset.role )
    }

    this.setState({ selectedAccessRules })
  }

  saveAccessRules = (e) => {
    e.preventDefault()
    this.props.onAccessRuleSelection(this.state.selectedAccessRules)
  }

  render() {
    const flag = this.props.flag
    return(
      <div>
        <h2>{ flag.serviceId } </h2>
        <ul>
          {
            flag.assets.map((asset) => {
              return (
                <li key={`${asset.name}-${asset.role}`}>
                    <span>
                      { asset.name } / { asset.role }
                    </span>
                    <label className="checkbox">
                      <input onChange={(e) => this.updateAccessRuleSelection(e, asset)} type="checkbox"/>
                    </label>
                </li>
              )
          })
        }
        </ul>
        <button className="button" onClick={this.saveAccessRules}>Save and Finish</button>
      </div>
    )
  }
}
