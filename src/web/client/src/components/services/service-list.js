import React from 'react'
import lodash from 'lodash'
import './service-list.scss'
import Modal from '../modal'

export default class ServiceList extends React.Component {
  constructor () {
    super()
    this.state = {
      services: [],
      editingService: null,
      editingConfiguration: {},
      showModal: false
    }
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

  showConfigurationModal = (service) => {
    const config = {}
    service.configKeys.forEach((key) => config[key] = '')

    this.setState({
      editingService: service,
      editingConfiguration: config,
      showModal: true
    })
  }

  configValueDidChange = (event, configKey) => {
    const value = event.target.value
    let config = this.state.editingConfiguration
    config[configKey] = value
    this.setState({
      editingConfiguration: config
    })
  }

  closeConfiguration = (event) => {
    event.preventDefault()

    this.setState({
      showModal: false
    })
  }

  submitConfiguration = async (event) => {
    this.closeConfiguration(event)

    const configJson = JSON
    .stringify(this.state.editingConfiguration)
    .replace(/"/g, '\\"')

    const response = await fetch('/graphql', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        query: `mutation {
          configureService(
            serviceId: "${this.state.editingService.id}",
            configJson: "${configJson}")
        }`
      })
    })

    if(response.ok) {
      let services = this.state.services
      const serviceIndex = lodash.findIndex(services, (service) => service.id === this.state.editingService.id)
      services[serviceIndex].isConfigured = true
      this.setState({
        services
      })
    } else {
      console.log("TODO: show a real error to the user")
    }
  }

  render () {
    const paritionedServices = lodash.partition(this.state.services, (s) => s.isConfigured)
    const configuredServices = paritionedServices[0]
    const unconfiguredServices = paritionedServices[1]
    const modalTitle = this.state.editingService
      ? this.state.editingService.displayName
      : ""

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
                    <button className="button is-primary is-small" onClick={() => this.showConfigurationModal(s)}>Turn On</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        <Modal title={`Configure ${modalTitle}`} show={this.state.showModal}>
          { this.state.showModal &&
            <form onSubmit={this.submitConfiguration}>
              {
                this.state.editingService.configKeys.map((key) => (
                  <div className="field" key={key}>
                    <div className="control">
                      <input className="input" type="text" placeholder={key} value={this.state.editingConfiguration[key]}
                      onChange={(e) => this.configValueDidChange(e, key) } />
                    </div>
                  </div>
                )
              )}
              <div className="field is-grouped">
                <div className="control">
                  <button className="button is-success" type="submit">Configure</button>
                </div>
                <div className="control">
                  <button className="button" onClick={this.closeConfiguration}>Cancel</button>
                </div>
              </div>
            </form>
          }
        </Modal>

      </div>
    )
  }
}
