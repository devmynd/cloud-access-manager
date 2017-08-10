import React from 'react'
import GroupSelectionForm from './group-selection-form'

export default class NewIndividualInfo extends React.Component {
  state = {
    fullName: this.props.flag.userIdentity.fullName || "",
    primaryEmail: this.props.flag.userIdentity.email || "",
    groups: [],
    showGroupForm: false,
    showIndividualInfoFields: true
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

  showGroupForm = (e) => {
    e.preventDefault()

    this.setState({
      showIndividualInfoFields: false,
      showGroupSelectionForm: true
    })
  }



  render() {
    return (
      <div>
        {
          this.state.showIndividualInfoFields &&
          <div>
            <div className='field'>
              <label className="label">Full Name</label>
              <div className='control'>
                <input className='input' type='text' value={this.state.fullName} onChange={ this.updateFullName }/>
              </div>
            </div>
            <div className='field'>
              <label className="label">Primary Email Address</label>
              <div className='control'>
                <input className='input' type='text' value={ this.state.primaryEmail } onChange={ this.updatePrimaryEmail }/>
              </div>
            </div>
            <div className='control'>
              <button className='button' onClick={this.showGroupForm}>Save and Continue</button>
            </div>
          </div>
        }
        {
          this.state.showGroupSelectionForm && <GroupSelectionForm groups={this.state.groups} fullName={this.state.fullName} primaryEmail={this.state.primaryEmail} flag={this.props.flag} />
        }
      </div>
    )
  }
}
