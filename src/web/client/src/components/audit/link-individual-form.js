import React from 'react'
import IndividualSearch from '../shared/individual-search'
import './link-individual-form.scss'

export default class LinkIndividualForm extends React.Component {
  render() {
    return (
      <div className="link-individual-form">
        <IndividualSearch onIndividualSelected={this.props.onIndividualSelected} />
      </div>
    )
  }
}
