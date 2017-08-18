import React from 'react'
import graphqlApi from '../../graphql-api'

export default class ReviewFlags extends React.Component {
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
            )
          })
        }
      </div>
    )
  }
}
