// @flow

import React from 'react'
import {render} from 'react-dom'
import '../styles/index.scss'
import 'bulma/bulma.sass'

function sayHello (to: string): string {
  return `hello ${to}`
}

class App extends React.Component {
  render () {
    return <p className='hello-world title'>{sayHello('Shamyle')}</p>
  }
}

render(<App />, document.getElementById('app'))
