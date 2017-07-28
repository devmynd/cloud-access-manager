import React from 'react'

export default class Modal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      show: props.show
    }
  }

  componentWillReceiveProps = (props) => {
    if (props.show !== this.state.show) {
      this.setState({
        show: props.show
      })
    }
  }

  close = (e) => {
    this.setState({
      show: false
    })
  }

  render () {
    if (!this.state.show) { return null }

    return (
      <div className='modal is-active'>
        <div className='modal-background' onClick={this.close} />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title'>{this.props.title}</p>
            <button className='delete' onClick={this.close} />
          </header>
          <section className='modal-card-body'>
            {this.props.children}
          </section>
        </div>
      </div>
    )
  }
}
