import React from 'react'

export default class Modal extends React.Component {
  render() {
    if (!this.props.show) {
      return null
    }

    return (
      <div className="is-active modal">
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Modal title</p>
            <button className="delete" onClick={this.props.onClose}></button>
          </header>
          <section className="modal-card-body">
            {this.props.children}
          </section>
          <footer className="modal-card-foot">
            <a className="button is-success">Save changes</a>
            <a className="button">Cancel</a>
          </footer>
        </div>
      </div>
    )
  }
}
