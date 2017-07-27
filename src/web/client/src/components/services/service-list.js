import React from 'react'
import lodash from 'lodash'
import './service-list.scss'
import Modal from '../modal'

export default class ServiceList extends React.Component {
  constructor () {
    super()
    this.state = {
      services: [],
      selectedService: null
    }
    this.removeConfigurationModal = this.removeConfigurationModal.bind(this)
  }

  async componentWillMount () {
    const response = await fetch('/graphql', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        query: '{ services { id, displayName, isConfigured, configKeys } }'
      })
    })

    const body = await response.json()

    this.setState({
      services: body.data.services
    })
  }

  selectConfigurationModal(service) {
    this.setState({
      selectedService: service
    })
  }

  removeConfigurationModal() {
    console.log('removing')
    this.setState({
      selectedService: null
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
                  <td>
                    <button className="button is-primary is-small" onClick={() => this.selectConfigurationModal(s)}>Turn On</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {
          this.state.selectedService &&
          <Modal show={this.state.selectedService !== null} onClose={this.removeConfigurationModal}>
            {
              this.state.selectedService.configKeys.map((key) => {
                return (
                  <div className="field" key={key}>
                    <div className="control">
                      <input className="input" type="text" placeholder={key} />
                    </div>
                  </div>
                )
              }
            )}
          </Modal>
        }
      </div>
    )
  }
}
