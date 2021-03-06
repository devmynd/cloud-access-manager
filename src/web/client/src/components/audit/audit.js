import React from 'react'
import graphqlApi from '../../graphql-api'
import './audit.scss'
import AuditFlags from './audit-flags'
import ReviewFlags from './review-flags'
import AuditProgress from '../shared/audit-progress'
import lodash from 'lodash'
import MessagesContainer from '../shared/messages-container'

export default class Audit extends React.Component {
  state = {
    flagsByService: {},
    showModal: false,
    progressCount: 0,
    progressTotalCount: 0,
    progressCurrentService: null,
    currentFlag: null,
    allCached: false,
    serviceLookup: {},
    summaryMode: false
  }

  individualResponseFormat = `{
    id
    fullName
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
  }`

  flagResponseFormat = `{
    individual ${this.individualResponseFormat}
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
  }`

  componentWillMount = async () => {
    const query = `{
      groups {
        name
      }
      services(isConfigured:true){
        id
        displayName
        roles
        cachedDate
      }
    }`

    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to load group and service info',
        body: response.error.message
      })
      return
    }
    let services = response.data.services
    let serviceLookup = {}
    services.forEach((s) => { serviceLookup[s.id] = s })
    this.setState({
      groups: response.data.groups.map((g) => g.name),
      progressTotalCount: services.length,
      allCached: lodash.every(services, (s) => s.cachedDate),
      serviceLookup
    })
    await this.performAudit()
  }

  performAudit = async (skipCache) => {
    this.setState({
      progressCount: 0,
      flagsByService: skipCache ? {} : this.state.flagsByService,
      allCached: skipCache ? false : this.state.allCached
    })

    for (let serviceId in this.state.serviceLookup) {
      await this.performAuditForService(serviceId, skipCache)
    }

    this.setState({
      allCached: true
    })
  }

  performAuditForService = async (serviceId, skipCache) => {
    const service = this.state.serviceLookup[serviceId]
    const wasAllCached = this.state.allCached
    this.setState({
      progressCurrentService: service.displayName,
      allCached: skipCache ? false : wasAllCached
    })

    const query = `{
      auditService(serviceId: "${serviceId}", skipCache: ${skipCache ? true : false}) ${this.flagResponseFormat}
    }`

    const response = await graphqlApi.request(query)
    let flags
    if (response.error) {
      this.messagesContainer.push({
        title: `Failed to run audit for service: ${service.displayName}`,
        body: response.error.message
      })
      flags = []
    } else {
      flags = response.data.auditService
      flags.forEach((flag) => {
        flag.key = `${flag.serviceId}${flag.userIdentity.email || flag.userIdentity.userId || new Date().valueOf()}`
      })
      if (skipCache || !service.cachedDate) {
        let serviceLookup = this.state.serviceLookup
        service.cachedDate = new Date().toString()
        serviceLookup[service.id] = service
        this.setState({
          serviceLookup
        })
      }
    }

    let flagsByService = this.state.flagsByService
    if (flags.length > 0) {
      flagsByService[serviceId] = flags
    } else {
      delete flagsByService[serviceId]
    }

    let progressCount = this.state.progressCount + 1
    this.setState({
      flagsByService,
      progressCount,
      allCached: (skipCache && wasAllCached) ? true : this.state.allCached
    })
  }

  reCheckFlag = async (flag) => {
    const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : `userId: "${flag.userIdentity.userId}"`

    const query = `{
      auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.flagResponseFormat}
    }`
    const response = await graphqlApi.request(query)

    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to check flag',
        body: response.error.message
      })
    } else {
      const newFlag = response.data.auditServiceUserAccount
      if (newFlag) {
        newFlag.key = flag.key
      }
      this.updateFlag(flag, newFlag)
      return newFlag
    }
  }

  updateFlag = (oldFlag, newFlag) => {
    let flagsByService = this.state.flagsByService
    const flags = [...flagsByService[oldFlag.serviceId]]
    const flagIndex = lodash.findIndex(flags, (f) => f.key === oldFlag.key)
    if (newFlag) {
      flags[flagIndex] = newFlag
    } else {
      flags.splice(flagIndex, 1)
    }
    flagsByService[oldFlag.serviceId] = flags
    this.setState({
      flagsByService
    })
  }

  toggleSummary = () => {
    let mode = this.state.summaryMode
    this.setState({
      summaryMode: !mode
    })
  }

  render () {
    const showProgress = !this.state.allCached && this.state.progressCount < this.state.progressTotalCount

    return (
      <div className='audit'>
        {
           showProgress &&
           <AuditProgress
             completeCount={this.state.progressCount}
             outOfCount={this.state.progressTotalCount}
             currentService={this.state.progressCurrentService} />
        }
        <button className='button is-pulled-right' onClick={this.toggleSummary}>
          { this.state.summaryMode ? "Back to Audit" : "Show Summary" }
        </button>
        {
          this.state.summaryMode
            ? <ReviewFlags
              flagsByService={this.state.flagsByService}
              serviceLookup={this.state.serviceLookup}
              performAuditForService={this.performAuditForService}
              />
            : <AuditFlags
              flagsByService={this.state.flagsByService}
              serviceLookup={this.state.serviceLookup}
              performAudit={this.performAudit}
              performAuditForService={this.performAuditForService}
              updateFlag={this.updateFlag}
              flagResponseFormat={this.flagResponseFormat}
              individualResponseFormat={this.individualResponseFormat}
              showRefresh={!showProgress}
              groups={this.state.groups}
              reCheckFlag={this.reCheckFlag}
            />
        }
        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
