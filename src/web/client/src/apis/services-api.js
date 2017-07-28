// @flow
import { BaseApi } from './base-api'
import type { ApiResponse } from './base-api'

class ServicesApi extends BaseApi {
  getServices (): Promise<ApiResponse> {
    const query = '{ services { id, displayName, isConfigured, configKeys } }'
    return this.request(query)
  }

  configureService (serviceId: string, config: { [string]: string }): Promise<ApiResponse> {
    const configJson = JSON
      .stringify(config)
      .replace(/"/g, '\\"')

    const query = `mutation {
      configureService(
        serviceId: "${serviceId}",
        configJson: "${configJson}")
    }`
    return this.request(query)
  }
}

export default new ServicesApi()
