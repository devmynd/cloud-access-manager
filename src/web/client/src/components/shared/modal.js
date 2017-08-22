import React from 'react'

export default class Modal extends React.Component {
  componentDidMount = () => {
    this.props.onMounted && this.props.onMounted()
  }

  render () {
    return (
      <div className='modal is-active'>
        <div className='modal-background' onClick={this.props.closeHandler} />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <a className="icon" onClick={this.props.onBackButtonClicked}>
              <i className="fa fa-chevron-left"></i>
              Back
            </a>
            <p className='modal-card-title'>{this.props.title}</p>
            <button className='delete' onClick={this.props.closeHandler} />
          </header>
          <section className='modal-card-body'>
            {this.props.children}
          </section>
        </div>
      </div>
    )
  }
}
