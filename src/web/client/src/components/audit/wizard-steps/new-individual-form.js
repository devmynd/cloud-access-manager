import React from 'react'

export default class NewIndividualForm extends React.Component {
  state = {
    fullName: this.props.context.flag.userIdentity.fullName || '',
    primaryEmail: this.props.context.flag.userIdentity.email || ''
  }

  componentDidMount = () => {
    this.fullNameInput.focus()
  }

  updateFullName = (event) => {
    this.setState({
      fullName: event.target.value
    })
  }

  updatePrimaryEmail = (event) => {
    this.setState({
      primaryEmail: event.target.value
    })
  }

  validate = () => {
    if (!this.state.fullName || this.state.fullName.trim() === '') {
      this.setState({
        fullNameInvalid: true
      })
      this.fullNameInput.focus()
      return false
    }
    return true
  }

  save = () => {
    this.props.context.pendingNewIndividual = {
      fullName: this.state.fullName,
      primaryEmail: this.state.primaryEmail
    }
  }

  chooseNextStep = () => {
    return "group-selection-form"
  }

  onSubmit = () => {
    console.log("submit")
  }

  render () {
    return (
      <div>
        <div className='field'>
          <label className='label'>Full Name</label>
          <div className='control'>
            <input
              className={`input ${this.state.fullNameInvalid ? 'is-danger' : ''}`}
              type='text'
              value={this.state.fullName}
              onChange={this.updateFullName}
              ref={(ref) => {this.fullNameInput = ref}}/>
          </div>
        </div>
        <div className='field'>
          <label className='label'>Primary Email Address</label>
          <div className='control'>
            <input className='input' type='text' value={this.state.primaryEmail} onChange={this.updatePrimaryEmail} />
          </div>
        </div>
      </div>
    )
  }
}
