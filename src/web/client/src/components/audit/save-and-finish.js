import React from 'react'

export default class SaveAndFinish extends React.Component {
  onFinishClick = () => {
    this.props.context.goToNext()
  }

  render() {
    return (
      <div>
        <p>No more flagged assets remaining for this account</p>
        <a className="button" onClick={this.onFinishClick}>Save and Finish</a>
      </div>
    )
  }
}
