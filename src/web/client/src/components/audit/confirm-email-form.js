import React from 'react'

export default class ConfirmEmailForm extends React.Component {
  render() {
    return (
      <div>
        <p>Do you want to use '{this.props.email}' as the primary email for {this.props.individual.fullName}?</p>
        <button className='button' onClick={this.props.onConfirm}>Yes</button>
        <button className='button' onClick={this.props.onReject}>No</button>
      </div>
    )
  }
}
