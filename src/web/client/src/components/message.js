import React from 'react'
import './message.scss'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class Message extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      show: true
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    // only allow going from visible to hidden
    if (this.state.show === true && nextState.show === false) {
      return true
    }
    // otherwise decide based on if the properties themselves have actually changed
    return nextProps.title !== this.props.title || nextProps.children !== this.props.children
  }

  componentDidMount = () => {
    this.setFadeOut()
  }

  componentWillUpdate = () => {
    this.setState({
      show: true
    })
  }

  componentDidUpdate = () => {
    this.setFadeOut()
  }

  setFadeOut = () => {
    if(this.state.show) {
      setTimeout(() => {
        this.setState({
          show: false
        })
      }, 10000)
    }
  }

  close = (e) => {
    this.setState({
      show: false
    })
  }

  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName="message-component"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        { this.state.show &&
          <div key="message" className="column is-one-third message-component">
            <div className="message is-danger">
              <div className="message-header">
                <p><strong>{this.props.title}</strong></p>
                <button className="delete" onClick={this.close}></button>
              </div>
              <div className="message-body">
                {this.props.children}
              </div>
            </div>
          </div>
        }
      </ReactCSSTransitionGroup>

    )
  }
}
