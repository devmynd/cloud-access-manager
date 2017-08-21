import React from 'react'
import graphqlApi from '../../graphql-api'

export default class ReviewFlags extends React.Component {
  state= {
    showUpdateButtonText: true
  }

  handleSelectedServiceToAudit = async (event, serviceId) => {
    this.setState({
      showUpdateButtonText: false
    })

    const flags = await this.props.performAuditForService(serviceId, true)
    this.props.flagsByService[serviceId] = flags

    this.setState({
      showUpdateButtonText: true
    })
  }

  render() {
    const flagsByService = this.props.flagsByService
    const flaggedServices = Object.keys(flagsByService).map((id) => this.props.serviceLookup[id])
    const assetsByService = {}

    flaggedServices.forEach((service) => {
      const flags = flagsByService[service.id]

      let accountsByAsset = {}

      flags.forEach((flag) => {
        flag.assets.forEach((asset) => {
          if(!accountsByAsset.hasOwnProperty(asset.name)) {
            accountsByAsset[asset.name] = []
          }
          accountsByAsset[asset.name].push({ role: asset.role, identity: flag.userIdentity })
        })
      })

      assetsByService[service.id] = accountsByAsset
    })

    return (
      <div className="review-flags">
        <h2 className="title">
          Flagged Accounts Summary
        </h2>
        {
          flaggedServices.map((service) => {
            const assets = assetsByService[service.id]
            return (
              <div key={service.id} className='container'>
                <h3 className='title'>{service.displayName}</h3>
                <div>
                  { this.state.showUpdateButtonText &&
                  <span>
                    <a className='button' onClick={(e) => this.handleSelectedServiceToAudit(e,service.id)}>
                      <i className="fa fa-refresh" aria-hidden="true"></i>
                      <span>Update {service.displayName}</span>
                    </a>
                    <span>
                      Last update: {service.cachedDate.toString()}
                    </span>
                  </span>
                  }

                  {
                    !this.state.showUpdateButtonText &&
                      <p> Updating {service.displayName} </p>
                  }
                  { Object.keys(assets).map((asset) => {
                    const accounts = assets[asset]
                    return (
                      <div key={asset}>
                        <h3 className='subtitle'>{asset}</h3>


                        { accounts.map((account) => {
                          return (
                            <div className='columns' key={Math.random()}>
                              { account.identity.userId && <div className='column is-one-quarter'>Username: { account.identity.userId }</div> }
                              { account.identity.email && <div className='column is-one-quarter'>Email: { account.identity.email }</div> }
                              { account.identity.fullName && <div className='column is-one-quarter'>Full Name: { account.identity.fullName }</div> }
                              { account.role && <div className='column is-one-quarter'>Role: { account.role }</div> }
                            </div>
                          )
                        })}
                        <hr/>
                      </div>
                    )
                  })}
                  <hr/>
                </div>
            </div>
            )
          })
        }
      </div>
    )
  }
}
