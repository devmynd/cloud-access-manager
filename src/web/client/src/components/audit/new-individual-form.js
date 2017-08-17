import React from 'react'

export default class NewIndividualForm extends React.Component {
  state = {
    fullName: this.props.flag.userIdentity.fullName || '',
    primaryEmail: this.props.flag.userIdentity.email || ''
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

  save = (e) => {
    e.preventDefault()
    this.props.onNewIndividualFormComplete(this.state.fullName, this.state.primaryEmail)
  }

  render () {
    return (
      <div>
        <div className='field'>
          <label className='label'>Full Name</label>
          <div className='control'>
            <input className='input' type='text' value={this.state.fullName} onChange={this.updateFullName} />
          </div>
        </div>
        <div className='field'>
          <label className='label'>Primary Email Address</label>
          <div className='control'>
            <input className='input' type='text' value={this.state.primaryEmail} onChange={this.updatePrimaryEmail} />
          </div>
        </div>
        <div className='control'>
          <button className='button' onClick={this.save}>Save and Continue</button>
        </div>
      </div>
    )
  }
}
