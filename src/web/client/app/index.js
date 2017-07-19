// @flow

import React from 'react'
import {render} from 'react-dom'

function sayHello (to: string): string {
  return `hello ${to}`
}

class App extends React.Component {
  render () {
    return <p>{sayHello('Shamyle')}</p>
  }
}

render(<App />, document.getElementById('app'))
