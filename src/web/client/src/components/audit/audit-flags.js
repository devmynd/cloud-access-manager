import React from 'react'
import graphqlApi from '../../graphql-api'
import Modal from '../shared/modal'
import UnknownUserForm from './unknown-user-form'
import NewIndividualForm from './new-individual-form'
import GroupSelectionForm from './group-selection-form'
import RoleBasedAccessRulesForm from './role-based-access-rules-form'
import AssetBasedAccessRulesForm from './asset-based-access-rules-form'
import LinkIndividualForm from './link-individual-form'
import MessagesContainer from '../shared/messages-container'
import lodash from 'lodash'

export default class AuditFlags extends React.Component {
  state = { }

  showModal = (flag) => {
    this.pendingNewIndividual = null
    this.setState({
      showModal: true,
      currentFlag: flag,
      originalFlag: flag,
      modalTitle: flag.individual
        ? 'Select Roles'
        : `Unknown User: ${flag.userIdentity.email || flag.userIdentity.userId}`,
      modalBackBehavior: () => { this.closeModal() },
      modalContents: flag.individual
        ? <RoleBasedAccessRulesForm service={this.props.serviceLookup[flag.serviceId]} assets={flag.assets} onRolesSelected={this.onRolesSelected} />
        : <UnknownUserForm flag={flag} onNewIndividualSelected={this.onNewIndividualSelected} onLinkToIndividualSelected={this.onLinkToIndividualSelected} />
    })
  }

  closeModal = (event) => {
    if (event) { event.preventDefault() }

    this.setState({
      showModal: false
    })
  }

  onNewIndividualSelected = () => {
    const flag = this.state.currentFlag
    this.setState({
      modalTitle: `Manage ${flag.userIdentity.email || flag.userIdentity.userId || 'blah'}`,
      modalBackBehavior: () => { this.showModal(this.state.originalFlag) },
      modalContents: <NewIndividualForm flag={flag} onNewIndividualFormComplete={this.onNewIndividualFormComplete} onNewIndividualSelected={this.onNewIndividualSelected} />
    })
  }

  onNewIndividualFormComplete = (fullName, primaryEmail) => {
    if (!fullName || fullName.trim() === '') {
      this.messagesContainer.push({
        title: 'Invalid Name',
        body: "Please fill out the individual's name."
      })
      return
    }

    this.pendingNewIndividual = {
      fullName,
      primaryEmail
    }
    this.setState({
      modalTitle: `Select groups`,
      modalBackBehavior: () => { this.onNewIndividualSelected() },
      modalContents: <GroupSelectionForm groups={this.props.groups} onGroupFormComplete={this.onGroupFormComplete} individual={this.pendingNewIndividual} />
    })
  }

  onLinkToIndividualSelected = () => {
    this.setState({
      modalTitle: 'Link to an individual',
      modalBackBehavior: () => { this.showModal(this.state.originalFlag) },
      modalContents: <LinkIndividualForm onIndividualSelected={this.onIndividualSelectedToLink} />
    })
  }

  onIndividualSelectedToLink = (individual) => {
    this.linkIndividual(individual.id)
  }

  linkIndividual = async (individualId) => {
    const flag = this.state.currentFlag

    const query = `mutation {
      linkServiceToIndividual(
        serviceId: "${flag.serviceId}",
        individualId:"${individualId}",
        ${flag.userIdentity.fullName ? `fullName: "${flag.userIdentity.fullName}"` : ''},
        ${flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : ''},
        ${flag.userIdentity.userId ? `userId: "${flag.userIdentity.userId}"` : ''}
      )
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to link to existing individual',
        body: response.error.message
      })
    }
    const newFlag = await this.reCheckFlag(flag)
    this.props.updateFlag(flag, newFlag)
    if (newFlag) {
      this.showRoleBasedAccessRules(newFlag)
    } else {
      this.setState({
        showModal: false
      })
    }
  }

  rollbackNewIndividual = async (individual) => {
    const query = `mutation { deleteIndividual(individualId: "${individual.id}")}`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Error rolling back newly created individual",
        body: response.error.message
      })
    } else {
      this.onNewIndividualFormComplete(individual.fullName, individual.primaryEmail)
    }
  }

  rollbackLinkIndividual = async () => {
    const flag = this.state.currentFlag
    const query = `mutation { unlinkService(serviceId: "${flag.serviceId}", individualId: "${flag.individual.id}")}`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: "Error rolling back link to individual",
        body: response.error.message
      })
    } else {
      this.onLinkToIndividualSelected()
    }
  }

  showRoleBasedAccessRules = (flag) => {
    this.setState({
      currentFlag: flag,
      modalTitle: 'Select Roles',
      modalBackBehavior: this.pendingNewIndividual
        ? () => { this.rollbackNewIndividual(flag.individual) }
        : () => { this.rollbackLinkIndividual() },
      modalContents: <RoleBasedAccessRulesForm
        service={this.props.serviceLookup[flag.serviceId]}
        assets={flag.assets}
        onRolesSelected={this.onRolesSelected} />
    })
  }

  onRolesSelected = (selectedRoles) => {
    const flag = this.state.currentFlag

    const onAssetsSelected = (selectedAssets) => {
      const rules = this.createAccessRules(selectedRoles, selectedAssets)
      this.setIndividualAccessRules(rules)
    }

    const hasFullAccess = (selectedRoles.length === 1 && selectedRoles[0] === "*")

    const remainingAssets = hasFullAccess
      ? []
      : flag.assets.filter((a) => !selectedRoles.includes(a.role))

    if (remainingAssets.length < 1) {
      onAssetsSelected([])
      return
    }

    this.setState({
      modalTitle: 'Select Assets',
      modalBackBehavior: () => { this.showRoleBasedAccessRules(flag) },
      modalContents: <AssetBasedAccessRulesForm
        service={this.props.serviceLookup[flag.serviceId]}
        assets={remainingAssets}
        onAssetsSelected={onAssetsSelected} />
    })
  }

  createAccessRules = (selectedRoles, selectedAssets) => {
    return selectedRoles.map((role) => {
      return {
        role: role,
        asset: "*"
      }
    }).concat(selectedAssets.map((asset) => {
      return {
        role: asset.role,
        asset: asset.name
      }
    }))
  }

  setIndividualAccessRules = async (selectedAccessRules) => {
    const flag = this.state.currentFlag
    const query = `mutation {
      addIndividualAccessRules(
        individualId: "${flag.individual.id}",
        serviceId: "${flag.serviceId}",
        accessRules: [${selectedAccessRules.map((rule) => `{
          asset: "${rule.asset}",
          role: "${rule.role ? rule.role : '*'}"
        }`).join(',')}])
    }`
    const response = await graphqlApi.request(query)
    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to add selected access rules',
        body: response.error.message
      })
    } else {
      const newFlag = await this.reCheckFlag(flag)
      this.props.updateFlag(flag, newFlag)
      this.setState({
        showModal: false
      })
    }
  }

  onGroupFormComplete = async (selectedGroups) => {
    this.pendingNewIndividual.groups = selectedGroups

    const query = `mutation {
      createIndividual(individual: {
        fullName: "${this.pendingNewIndividual.fullName}"
        ${this.pendingNewIndividual.primaryEmail ? `primaryEmail: "${this.pendingNewIndividual.primaryEmail}"` : ''}
        groups: [${selectedGroups.map((g) => `"${g}"`).join(',')}]
      })
    }`

    const response = await graphqlApi.request(query)
    const individualId = response.data.createIndividual

    if (response.error) {
      this.messagesContainer.push({
        title: 'Failed to Save New Individual',
        body: response.error.message
      })
    } else {
      await this.linkIndividual(individualId)
      await this.props.performAudit()
    }
  }

  reCheckFlag = async (flag) => {
    const secondParameter = flag.userIdentity.email ? `email: "${flag.userIdentity.email}"` : `userId: "${flag.userIdentity.userId}"`

    const query = `{
      auditServiceUserAccount(serviceId: "${flag.serviceId}", ${secondParameter}) ${this.props.flagResponseFormat}
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
        return newFlag
      }
    }
  }

  render() {
    const flagsByService = this.props.flagsByService
    const flaggedServices = Object.keys(flagsByService).map((id) => this.props.serviceLookup[id])
    const oldestCachedDate = lodash.first(flaggedServices.map((s) => new Date(s.cachedDate)).sort()) || 'never'
    const flagCount = lodash.sumBy(flaggedServices, (service) => flagsByService[service.id].length)
    return (
      <div className="audit-flags">
        { flagCount > 0 &&
          <h2 className="title">
            {flagCount} Flagged Accounts
          </h2>
        }
        {
          this.props.showRefresh &&
          <span>
            <a className='button' onClick={() => this.props.performAudit(true)}>
              <i className="fa fa-refresh fa-2x" aria-hidden="true"></i>
              Update Cached Accounts
            </a>
            <span>
              Last update: {oldestCachedDate.toString()}
            </span>
          </span>
        }
        {
          flaggedServices.map((service) => {
            return (
              <div key={service.id} className='container'>
                <h3 className='title'>{service.displayName}</h3>

                <table className='table'>
                  <tbody>
                    {flagsByService[service.id].map((flag) => (
                      <tr key={flag.key} onClick={() => this.showModal(flag)}>
                        <td>
                          <div className='columns'>
                            <div className='column is-one-quarter'>{ service.displayName }</div>
                            { flag.userIdentity.userId &&
                              <div className='column is-one-quarter'>Username: {flag.userIdentity.userId}</div>
                            }
                            { flag.userIdentity.email &&
                              <div className='column is-one-quarter'>Email: {flag.userIdentity.email}</div>
                            }
                            { flag.userIdentity.fullName &&
                              <div className='column is-one-quarter'>Full Name: {flag.userIdentity.fullName}</div>
                            }
                          </div>

                        </td>
                      </tr>
                    )
                  )}
                  </tbody>
                </table>
              </div>
            )
          })
        }

        { this.state.showModal &&
          <Modal title={this.state.modalTitle} closeHandler={this.closeModal} onBackButtonClicked={this.state.modalBackBehavior}>
            { this.state.modalContents }
          </Modal>
        }

        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />
      </div>
    )
  }
}
