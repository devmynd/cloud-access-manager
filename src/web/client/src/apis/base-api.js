// @flow

export type ApiResponse = {
  status: number,
  ok: boolean,
  body: Object
}

export class BaseApi {
  async request (query: string): Promise<ApiResponse> {
    const response = await fetch('/graphql', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        query: query
      })
    })

    return {
      status: response.status,
      ok: response.ok,
      body: await response.json()
    }
  }
}
