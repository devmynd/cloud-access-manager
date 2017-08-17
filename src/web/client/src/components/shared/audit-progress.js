import React from 'react'
import './audit-progress.scss'

export default class AuditProgress extends React.Component {
  render () {
    const progressColumns = []
    for (let i = 0; i < this.props.outOfCount; i++) {
      let isComplete = i + 1 <= this.props.completeCount
      progressColumns[i] = isComplete
    }
    return (
      <div className='audit-progress message'>
        <div className='message-body'>
          <div className='progress-bar columns'>
            {
              progressColumns.map((isComplete, index) => {
                return <div key={index} className={`column${isComplete ? ' complete' : ''}`} />
              })
            }
          </div>
          <p className='status-text '>
            Auditing services ({this.props.completeCount} of {this.props.outOfCount} complete).
            Currently downloading {this.props.currentService}.
          </p>
        </div>
      </div>
    )
  }
}
