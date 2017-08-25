import React from 'react'
import ModalWizard from '../shared/modal-wizard'
import UnknownUserForm from './unknown-user-form'
import NewIndividualForm from './new-individual-form'
import GroupSelectionForm from './group-selection-form'
import RoleBasedAccessRulesForm from './role-based-access-rules-form'
import AssetBasedAccessRulesForm from './asset-based-access-rules-form'
import LinkIndividualForm from './link-individual-form'
import MessagesContainer from '../shared/messages-container'
import ConfirmEmailForm from './confirm-email-form'
import lodash from 'lodash'

export default class AuditFlags extends React.Component {
  state = { }

  wizardSteps = {
    "unknown-user-form": (ref, context) => {
      return {
        title: `Unknown User`,
        hideNextButton: true,
        component: <UnknownUserForm ref={ref} context={context} />
      }
    },
    "link-individual-form": (ref, context) => {
      return {
        title: "Link Service to Existing Individual",
        hideNextButton: true,
        component: <LinkIndividualForm ref={ref} context={context} />
      }
    },
    "confirm-email-form": (ref, context) => {
      return {
        title: "New Email Found",
        hideNextButton: true,
        component: <ConfirmEmailForm ref={ref} context={context} />
      }
    },
    "new-individual-form": (ref, context) => {
      return {
        title: "Create New Individual",
        component: <NewIndividualForm ref={ref} context={context} />
      }
    },
    "group-selection-form": (ref, context) => {
      return {
        title: "Add New Individual to Groups",
        component: <GroupSelectionForm ref={ref} context={context} />
      }
    },
    "role-based-access-rules-form": (ref, context) => {
      return {
        title: "Grant Access for Any Asset by Role",
        component: <RoleBasedAccessRulesForm ref={ref} context={context} />
      }
    },
    "asset-based-access-rules-form": (ref, context) => {
      return {
        title: "Grant Access for Specific Assets",
        component: <AssetBasedAccessRulesForm ref={ref} context={context} />
      }
    },
  }

  startWizard = (flag) => {
    const context = {
      flag: flag,
      originalFlag: flag,
      service: this.props.serviceLookup[flag.serviceId],
      groups: this.props.groups,
      individualResponseFormat: this.props.individualResponseFormat,
      messagesContainer: this.messagesContainer,
      refreshAudit: this.props.performAudit,
      refreshAuditForService: this.props.performAuditForService,
      reCheckFlag: this.props.reCheckFlag
    }
    const firstStep = flag.individual ? "role-based-access-rules-form" : "unknown-user-form"
    this.wizard.start(firstStep, context)
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
                      <tr key={flag.key} onClick={() => this.startWizard(flag)}>
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

        <MessagesContainer ref={(container) => { this.messagesContainer = container }} />

        <ModalWizard ref={(wiz) => { this.wizard = wiz }} steps={this.wizardSteps}/>
      </div>
    )
  }
}
