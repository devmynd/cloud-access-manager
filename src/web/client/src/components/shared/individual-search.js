import React from 'react'
import TypeAheadInput from './type-ahead-input'
import MessagesContainer from './messages-container'
import graphqlApi from '../../graphql-api'

export default class IndividualSearch extends React.Component {
  query = async (text, callback) => {
    const query = `{ individuals(fuzzySearch:"${text}", limit: ${10})
      {
        id, primaryEmail, fullName
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
            displayName
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
        title: 'Could not access existing individuals',
        body: response.error.message
      })
      return
    }
    callback(response.data.individuals)
  }

  renderIndividual = (individual) => {
    const additionalDetails = this.props.additionalDetailsRenderer
      ? this.props.additionalDetailsRenderer(individual)
      : false

    return (
      <div>
        <span>{individual.fullName}</span>
        { individual.primaryEmail &&
          <span> ({ individual.primaryEmail })</span>
        }
        { additionalDetails }
      </div>
    )
  }

  render () {
    return (
      <div className="indvidual-search">
        <TypeAheadInput
          placeholder='Search for individual by name or email'
          query={this.query}
          isMatchDisabled={this.props.shouldDisableIndividual}
          matchRenderer={this.renderIndividual}
          onMatchSelected={this.props.onIndividualSelected}
        />
        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
