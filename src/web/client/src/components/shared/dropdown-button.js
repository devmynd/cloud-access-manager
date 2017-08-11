import React from 'react'

export default class DropdownButton extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      down: false,
      title: props.title,
      options: props.options // {text, value}
    }
  }

  componentWillReceiveProps (props) {
    this.setState({
      title: props.title,
      options: props.options
    })
  }

  onOptionClick = (event) => {
    event.preventDefault()
    this.toggle()
    const value = event.target.getAttribute('value')
    this.props.onValueSelected && this.props.onValueSelected(value)
  }

  toggle = () => {
    const down = !this.state.down
    this.setState({ down })
  }

  render () {
    return (
      <div className={this.props.className}>
        <div className={'dropdown ' + (this.state.down ? 'is-active' : '')}>
          <div className='dropdown-trigger' onClick={this.toggle}>
            <button className='button' aria-haspopup='true' aria-controls='dropdown-menu'>
              <span>{this.props.title}</span>
              <span className='icon is-small'>
                <i className='fa fa-angle-down' aria-hidden='true' />
              </span>
            </button>
          </div>
          <div className='dropdown-menu' id='dropdown-menu' role='menu'>
            <div className='dropdown-content'>
              {this.state.options.map((option) => (
                <a key={option.value}
                  value={option.value}
                  onClick={this.onOptionClick}
                  className='dropdown-item'>
                  {option.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
