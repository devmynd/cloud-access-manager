import React from 'react'

export default class UnknownUserForm extends React.Component {

  onNewIndividualSelected = () => {
    this.nextStep = "new-individual-form"
    this.props.context.goToNext()
  }

  onLinkToIndividualSelected = () => {
    this.nextStep = "link-individual-form"
    this.props.context.goToNext()
  }

  rollback = () => {
    this.props.context.flag = this.props.context.originalFlag
  }

  chooseNextStep = () => {
    return this.nextStep
  }

  render () {
    return (
      <div>
        <div className='field is-grouped'>
          <div className='control'>
            <button className='button' onClick={this.onNewIndividualSelected}>Create New Individual</button>
          </div>
          <div className='control'>
            <button className='button' onClick={this.onLinkToIndividualSelected}>Link To An Existing Individual</button>
          </div>
        </div>
      </div>
    )
  }
}
