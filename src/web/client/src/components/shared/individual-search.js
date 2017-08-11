import React from 'react'
import TypeAheadInput from './type-ahead-input'

export default class IndividualSearch extends React.Component {


  query = (text, callback) => {
    callback([
      {
        fullName: "bob"
      },
      {
        fullName: "john"
      }
    ])
  }

  renderIndividual = (individual) => {
    return (
      <span>{individual.fullName}!!!</span>
    )
  }

  render() {
    return (
      <TypeAheadInput
        placeholder="Search for individual by name or email"
        query={this.query}
        matchRenderer={this.renderIndividual}
        onMatchSelected={this.props.onIndividualSelected}
      />
    )
  }
}
