import React from 'react'
import lodash from 'lodash'
import Modal from './modal'
import MessagesContainer from './messages-container'
import graphqlApi from '../graphql-api'

export default class ServiceList extends React.Component {
  state = {
    services: [],
    editingService: null,
    editingConfiguration: {},
    showModal: false,
    message: null
  }

  componentWillMount = async () => {
    const query = '{ services { id, displayName, isConfigured, configKeys } }'
    const response = await graphqlApi.request(query)

    this.setState({
      services: response.data.services
    })
  }

  disableService = async (serviceId) => {
    const query = `mutation {
      disableService(serviceId: "${serviceId}")
    }`
    const response = await graphqlApi.request(query)

    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Disable Service',
        body: response.error.message
      })
    } else {
      let services = this.state.services
      const serviceIndex = lodash.findIndex(services, (service) => service.id === serviceId)
      services[serviceIndex].isConfigured = false
      this.setState({ services })
    }
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

  onModalMounted = () => {
    this.refs.config0 && this.refs.config0.focus()
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

    const query = `mutation {
      configureService(
        serviceId: "${this.state.editingService.id}",
        configJson: "${configJson}")
    }`

    const response = await graphqlApi.request(query)

    if (!response.ok) {
      this.messagesContainer.push({
        title: 'Configuration Failed',
        body: response.error.message
      })
    } else {
      if (response.error) {
        this.messagesContainer.push({
          title: 'Invalid Configuration',
          body: (<div>
            <p>{this.state.editingService.displayName} configuration failed.</p>
            <p>Service test responded with: {response.error.message}</p>
          </div>)
        })
      }

      let services = this.state.services
      const serviceIndex = lodash.findIndex(services, (service) => service.id === this.state.editingService.id)
      services[serviceIndex].isConfigured = !response.error
      this.setState({ services })
    }
  }

  render () {
    const paritionedServices = lodash.partition(this.state.services, (s) => s.isConfigured)
    const configuredServices = paritionedServices[0]
    const unconfiguredServices = paritionedServices[1]

    return (
      <div>
        <h1 className='title'>Configured Services</h1>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='has-text-right'>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              configuredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td className='field is-grouped is-grouped-right'>
                    <div className='control'>
                      <button className='button is-primary is-small' onClick={() => this.showConfigurationModal(s)}>Edit</button>
                    </div>
                    <div className='control'>
                      <button className='button is-danger is-small' onClick={() => this.disableService(s.id)}>Turn Off</button>
                    </div>
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
              <th className='has-text-right'>Options</th>
            </tr>
          </thead>
          <tbody>
            {
              unconfiguredServices.map((s) => (
                <tr key={s.id}>
                  <td>{s.displayName}</td>
                  <td>
                    <button className='button is-primary is-small is-pulled-right' onClick={() => this.showConfigurationModal(s)}>Turn On</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        { this.state.showModal &&
          <Modal title={`Configure ${this.state.editingService.displayName}`} closeHandler={this.closeConfiguration} onMounted={this.onModalMounted}>
            <form onSubmit={this.submitConfiguration}>
              {
                this.state.editingService.configKeys.map((key, index) => (
                  <div className='field' key={key}>
                    <div className='control'>
                      <input ref={'config' + index} className='input' type='text' placeholder={key} value={this.state.editingConfiguration[key]}
                        onChange={(e) => this.configValueDidChange(e, key)} />
                    </div>
                  </div>))
              }
              <div className='field is-grouped'>
                <div className='control'>
                  <button className='button is-success' type='submit'>Save</button>
                </div>
                <div className='control'>
                  <button className='button' onClick={this.closeConfiguration}>Cancel</button>
                </div>
              </div>
            </form>
          </Modal>
        }

        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
