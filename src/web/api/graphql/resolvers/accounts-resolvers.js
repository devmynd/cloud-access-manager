// @flow
import { manager } from '../../../../core/service-providers/manager'


export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}
