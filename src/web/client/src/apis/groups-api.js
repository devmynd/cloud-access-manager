// @flow
import { BaseApi } from './base-api'
import type { ApiResponse } from './base-api'

class GroupsApi extends BaseApi {
  getGroups (): Promise<ApiResponse> {
    const query = `{
                  	groups {
                      name
                      serviceAccessRules {
                        service {
                          id
                          displayName
                        }
                        accessRules {
                          asset
                          role
                        }
                      }
                    }
                  }`
    return this.request(query)
  }
}

export default new GroupsApi()
