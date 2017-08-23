import React from 'react'
import './type-ahead-input.scss'

export default class TypeAheadInput extends React.Component {
  state = {
    down: false,
    text: '',
    matches: [],
    cursor: 0
  }

  componentDidMount = () => {
    this.input.focus()
  }

  onInputChange = (e) => {
    const text = e.target.value
    if (text.length > 0) {
      this.props.query(text, this.onQueryComplete)
    } else {
      this.onQueryComplete([])
    }

    this.setState({
      text: e.target.value
    })
  }

  onKeyDown = (event) => {
    // Enter key
    if (event.keyCode === 13 && this.state.cursor > 0) {
      event.preventDefault()
      this.onMatchSelected(this.state.matches[this.state.cursor - 1])
    }
    // Up key
    else if (event.keyCode === 38 && this.state.cursor > 0) {
      event.preventDefault()
      this.setState({
        cursor: this.state.cursor - 1
      })
    }
    // Down key
    else if (event.keyCode === 40 && this.state.cursor < this.state.matches.length) {
      event.preventDefault()
      this.setState({
        cursor: this.state.cursor + 1
      })
    }
  }

  onQueryComplete = (matches) => {
    this.setState({
      matches,
      down: matches.length > 0,
      cursor: 0
    })
  }

  onMatchSelected = (match) => {
    const isDisabled = this.props.isMatchDisabled ? this.props.isMatchDisabled(match) : false
    if(isDisabled) {
      return
    }

    this.props.onMatchSelected(match)

    this.setState({
      down: false,
      text: ''
    })
  }

  render () {
    return (
      <div className='type-ahead-input' >
        <div className={'dropdown ' + (this.state.down ? 'is-active' : '')}>
          <div className='dropdown-trigger'>
            <input
              className='input'
              type='text'
              value={this.state.text}
              onChange={this.onInputChange}
              onKeyDown={this.onKeyDown}
              placeholder={this.props.placeholder}
              ref={(input) => { this.input = input } }/>
          </div>
          <div className='dropdown-menu' id='dropdown-menu' role='menu' >
            <div className='dropdown-content'>
              {
                this.state.matches.map((match, index) => {
                  const isDisabled = this.props.isMatchDisabled ? this.props.isMatchDisabled(match) : false
                  const isSelected = this.state.cursor === index + 1
                  return (
                    <a key={Math.random()}
                      onClick={() => this.onMatchSelected(match)}
                      className={'dropdown-item' + (isDisabled ? " disabled" : "") + (isSelected ? " selected" : "") }>
                      {this.props.matchRenderer(match)}
                    </a>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
