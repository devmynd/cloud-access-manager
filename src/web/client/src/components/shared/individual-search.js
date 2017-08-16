import React from 'react'
import TypeAheadInput from './type-ahead-input'
import MessagesContainer from './messages-container'
import graphqlApi from '../../graphql-api'

export default class IndividualSearch extends React.Component {

  query = async (text, callback) => {
    const query = `{
    	individuals(fuzzySearch:"${text}", limit: ${10}) {
        id
          primaryEmail
        	fullName
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
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Could not access existing individuals",
        body: response.error.message
      })
      return
    }
    callback(response.data.individuals)
  }

  renderIndividual = (individual) => {
    return (
      <div>
        <span>{individual.fullName}</span>
        <span>{ individual.primaryEmail || "" }</span>
      </div>
    )
  }

  render() {
    return (
      <div>
        <TypeAheadInput
          placeholder="Search for individual by name or email"
          query={this.query}
          matchRenderer={this.renderIndividual}
          onMatchSelected={this.props.onIndividualSelected}
        />
        {/* TODO: does this work okay? Does it cause any wierd issues having 2 message containers on the same page?  */}
        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}