import React from 'react'
import lodash from 'lodash'
import './service-list.scss'

export default class ServiceList extends React.Component {
  constructor () {
    super()
    this.state = {
      services: []
    }
  }

  async componentWillMount () {
    const response = await fetch('/graphql', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        query: '{ services { id, displayName, isConfigured } }'
      })
    })

    const body = await response.json()
    
    this.setState({
      services: body.data.services
    })
  }

  render () {
    const paritionedServices = lodash.partition(this.state.services, (s) => s.isConfigured)
    const configuredServices = paritionedServices[0]
    const unconfiguredServices = paritionedServices[1]

    return (
      <div className='service-list'>
        <h1 className='title'>Configured Services</h1>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th className="options-column">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              configuredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td>Add options</td>
                </tr>
              ))
            }
          </tbody>
        </table>

        <h1 className='title'>Unconfigured Services</h1>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th className="options-column">Options</th>
            </tr>
          </thead>
          <tbody>
            {
              unconfiguredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td>Add options</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}
