import React from 'react'
import graphqlApi from '../graphql-api'


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
            {flags.length} Service Accounts
          </h2>
        }

        <table className='table'>
          <tbody>
            {flags.map((flag, index) => (
              <tr key={index}>
                <td>{ flag.serviceId } { flag.userIdentity.email ? "email" : "user id" }</td>
                <td className='has-text-left'> { flag.userIdentity.email || flag.userIdentity.userId || flag.userIdentity.fullName } </td>
              </tr>
            )
            )}
          </tbody>
        </table>
      </div>
    )
  }
}
