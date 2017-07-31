import React from 'react'
import lodash from 'lodash'
import './message.scss'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class Message extends React.Component {
  componentDidMount() {
    setTimeout(this.props.closeHandler, 10000)
  }

  render() {
    return (
      <div className={`message ${ this.props.type === "error" ? "is-danger" : "is-info"}`}>
        <div className="message-header">
          <p><strong>{this.props.title}</strong></p>
          <button className="delete" onClick={this.props.closeHandler}></button>
        </div>
        <div className="message-body">
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default class MessagesContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      messages: []
    }
  }

  push = (message) => {
    const messages = this.state.messages
    message.key = Math.random()
    message.type = message.type || "error"
    messages.push(message)
    this.setState({
      messages: messages
    })
  }

  close = (messageKey) => {
    const messages = this.state.messages
    lodash.remove(messages, (m) => {
      return m.key === messageKey
    })
    this.setState({ messages })
  }

  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName="message"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        className="messages-container">
        {this.state.messages.map((m) =>
          <Message title={m.title} type={m.type} key={m.key} closeHandler={() => this.close(m.key)}>
            {m.body}
          </Message>
        )}
      </ReactCSSTransitionGroup>
    )
  }
}
