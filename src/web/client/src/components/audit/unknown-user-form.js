import React from 'react'

export default class UnknownUserForm extends React.Component {

  onNewIndividualSelected = () => {
    this.props.context.goToStep("new-individual-form")
  }

  onLinkToIndividualSelected = () => {
    this.props.context.goToStep("link-individual-form")
  }

  rollback = () => {
    this.props.context.flag = this.props.context.originalFlag
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
