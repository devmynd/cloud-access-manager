import React from 'react'
import graphqlApi from '../graphql-api'
import './flag-list.scss'
// import lodash from 'lodash'


export default class FlagList extends React.Component {
  state = {
    flags: []
  }

  componentWillMount = async () => {
    const query = `{
      audit {
        individual {
          primaryEmail
          serviceUserIdentities {
            serviceId
            userIdentity {
              email
              userId
            }
          }
          accessRules {
            service {
              id
            }
            accessRules {
              asset
              role
            }
          }
          groups
        }
        serviceId
        userIdentity {
          email
          userId
          fullName
        }
        assets {
          name
          role
        }
      }
    }`

    const response = await graphqlApi.request(query)
    this.setState({
      flags: response.data.audit
    })
  }

  render() {
    const flags = this.state.flags
    return (
      <div>
        { flags.length > 0  &&
          <h2>
            {flags.length} SERVICE ACCOUNTS
          </h2>
        }

        <table className='table flag-table'>
          <tbody className='uppercase-text'>
            {flags.map((flag, index) => (
              <tr key={index}>
                <td className='column-padding'><span className='service-name column-padding'>{ flag.serviceId } { flag.userIdentity.email ? "EMAIL" : "USERNAME" }:</span> <span className='user-identity'>{ flag.userIdentity.email || flag.userIdentity.userId || flag.userIdentity.fullName }</span></td>
                <td>
                  <span className='service-name'>SERVICE:</span>
                    <span className='service-id'>{ flag.serviceId }</span> / { flag.assets.map((asset) => { asset.name }).length } PROJECTS PENDING
                </td>
              </tr>
            )
            )}
          </tbody>
        </table>
      </div>
    )
  }
}
