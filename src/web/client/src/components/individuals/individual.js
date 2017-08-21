import React from 'react'
import IndividualSearch from '../shared/individual-search'

export default class Individual extends React.Component {
  state = {
    individual: null
  }

  onIndividualSelected = (individual) => {
    this.setState({
      individual
    })
  }

  render() {
    return (
      <div>
        <IndividualSearch onIndividualSelected={this.onIndividualSelected} />
        {
          this.state.individual &&
            <div>
              <p>{this.state.individual.fullName} {this.state.individual.primaryEmail}</p>
            </div>
        }
      </div>
    )
  }
}
