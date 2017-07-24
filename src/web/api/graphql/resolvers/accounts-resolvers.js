// @flow
import { manager } from '../../../../core/service-providers/manager'
import { Auditor } from '../../../../core/auditor'
import { individualStore } from '../../../../core/data/individual-store'
import { groupStore } from '../../../../core/data/group-store'

export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}

export async function performAudit () {
  const accounts = await manager.download('all')
  const flaggedAccounts = new Auditor(individualStore, groupStore).performAudit(accounts)
}
