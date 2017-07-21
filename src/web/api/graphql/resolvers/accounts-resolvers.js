// @flow
import { manager } from '../../../../core/service-providers/manager'
import { Auditor } from '../../../../core/auditor'
import { userStore } from '../../../../core/data/user-store'
import { groupStore } from '../../../../core/data/group-store'

export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}

export async function performAudit () {
  const accounts = await manager.download('all')
  return new Auditor(userStore, groupStore).performAudit(accounts)
}
