import React from 'react'

export default class NewIndividualInfo extends React.Component {
  updateFullName = (event) => {
    console.log("Todo: Implement")
  }

  render() {
    return (
      <div>
        <form>
          <div className='field'>
            <label className="label">Full Name</label>
            <div className='control'>
              <input className='input' type='text' value={this.props.flag.userIdentity.fullName ? this.props.flag.userIdentity.fullName : ""} onChange={this.updateFullName}/>
            </div>
          </div>
          <div className='field'>
            <label className="label">Primary Email Address</label>
            <div className='control'>
              <input className='input' type='text' value={this.props.flag.userIdentity.email ? this.props.flag.userIdentity.email : ''}/>
            </div>
          </div>
          <div className='control'>
            <button className='button'>Save and Continue</button>
          </div>
        </form>
      </div>
    )
  }
}
