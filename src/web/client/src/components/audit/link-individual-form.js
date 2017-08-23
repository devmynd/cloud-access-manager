import React from 'react'
import IndividualSearch from '../shared/individual-search'
import './link-individual-form.scss'
import lodash from 'lodash'

export default class LinkIndividualForm extends React.Component {

  renderLinkedServiceDetails = (individual) => {
    if(this.isAlreadyLinked(individual)) {
      return (
        <span className="is-pulled-right">Already linked to {this.props.linkToService.displayName}</span>
      )
    }
  }

  isAlreadyLinked = (individual) => {
    const individualHasServiceIdentity = !!lodash.find(
      individual.serviceUserIdentities,
      (identity) => identity.serviceId === this.props.linkToService.id)
    return individualHasServiceIdentity
  }

  render () {
    return (
      <div className='link-individual-form'>
        <IndividualSearch
          onIndividualSelected={this.props.onIndividualSelected}
          additionalDetailsRenderer={this.renderLinkedServiceDetails}
          shouldDisableIndividual={this.isAlreadyLinked} />
      </div>
    )
  }
}
