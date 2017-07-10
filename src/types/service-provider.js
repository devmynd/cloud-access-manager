// @flow
import type { UserAccount } from './user-account'

export interface ServiceProvider {
  listAccounts(): Array<UserAccount>
}
