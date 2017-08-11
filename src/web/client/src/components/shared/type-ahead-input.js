import React from 'react'

export default class TypeAheadInput extends React.Component {
  state = {
    down: false,
    text: "",
    matches: []
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

  onQueryComplete = (matches) => {
    this.setState({
      matches,
      down: matches.length > 0
    })
  }

  onMatchSelected = (match) => {
    this.props.onMatchSelected(match)

    this.setState({
      down: false,
      text: ""
    })
  }

  render() {
    return (
      <div className="type-ahead-input">
        <div className={'dropdown ' + (this.state.down ? 'is-active' : '')}>
          <div className='dropdown-trigger'>
            <input className="input" type="text" value={this.state.text} onChange={this.onInputChange} placeholder={this.props.placeholder}/>
          </div>
          <div className='dropdown-menu' id='dropdown-menu' role='menu' >
            <div className='dropdown-content'>
              {this.state.matches.map((match) => (
                <a key={Math.random()}
                  onClick={() => this.onMatchSelected(match)}
                  className='dropdown-item'>
                  {this.props.matchRenderer(match)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
