import React from 'react'

export default class UnknownUserOptions extends React.Component {

  render() {
    return (
      <div>
        <div className='field is-grouped'>
          <div className='control'>
            <button className='button' onClick={this.props.onNewIndividualSelected}>Create New Individual</button>
          </div>
          <div className='control'>
            <button className='button'>Link To An Existing Individual</button>
          </div>
        </div>
      </div>
    )
  }
}
