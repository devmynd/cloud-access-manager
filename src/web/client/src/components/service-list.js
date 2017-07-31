import React from 'react'
import lodash from 'lodash'
import './service-list.scss'
import Modal from './modal'
import servicesApi from '../apis/services-api'
import MessagesContainer from './messages-container'

export default class ServiceList extends React.Component {
  constructor () {
    super()
    this.state = {
      services: [],
      editingService: null,
      editingConfiguration: {},
      showModal: false,
      message: null
    }
  }

  async componentWillMount () {
    const response = await servicesApi.getServices()

    this.setState({
      services: response.body.data.services
    })
  }

  showConfigurationModal = (service) => {
    const config = {}
    service.configKeys.forEach(function (key) {
      config[key] = ''
    })

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
    const response = await servicesApi.configureService(this.state.editingService.id, this.state.editingConfiguration)

    if (!response.ok) {
      this.messagesContainer.push({
        title: "Configuration Failed",
        body: `Server responded with: ${response.status}`
      })
    } else {
      const hasErrors = response.body.hasOwnProperty('errors')
      if (hasErrors) {
        this.messagesContainer.push({
          title: "Invalid Configuration",
          body: (<div>
                  <p>{this.state.editingService.displayName} configuration failed.</p>
                  <p>Service test responded with: {response.body.errors[0].message}</p>
                </div>)
        })
      }

      let services = this.state.services
      const serviceIndex = lodash.findIndex(services, (service) => service.id === this.state.editingService.id)
      services[serviceIndex].isConfigured = !hasErrors
      this.setState({ services })
    }
  }

  render () {
    const paritionedServices = lodash.partition(this.state.services, (s) => s.isConfigured)
    const configuredServices = paritionedServices[0]
    const unconfiguredServices = paritionedServices[1]
    const modalTitle = this.state.editingService
      ? this.state.editingService.displayName
      : ''

    return (
      <div className='service-list'>
        <h1 className='title'>Configured Services</h1>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='options-column'>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              configuredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td>
                    <button className='button is-primary is-small' onClick={() => this.showConfigurationModal(s)}>Edit</button>
                  </td>
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
              <th className='options-column'>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              unconfiguredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td>
                    <button className='button is-primary is-small' onClick={() => this.showConfigurationModal(s)}>Turn On</button>
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
                  <div className='field' key={key}>
                    <div className='control'>
                      <input className='input' type='text' placeholder={key} value={this.state.editingConfiguration[key]}
                        onChange={(e) => this.configValueDidChange(e, key)} />
                    </div>
                  </div>
                )
              )}
              <div className='field is-grouped'>
                <div className='control'>
                  <button className='button is-success' type='submit'>Configure</button>
                </div>
                <div className='control'>
                  <button className='button' onClick={this.closeConfiguration}>Cancel</button>
                </div>
              </div>
            </form>
          }
        </Modal>

        <MessagesContainer ref={(container) => this.messagesContainer = container}/>
      </div>
    )
  }
}
