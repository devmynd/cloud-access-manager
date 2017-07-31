// @flow

export type ApiResponse = {
  status: number,
  ok: boolean,
  data: ?Object,
  error: ?Object
}

class GraphqlApi {
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

    if (response.ok) {
      const body = await response.json()
      return {
        status: 200,
        ok: true,
        data: body.data,
        error: (body.errors && body.errors.length > 0) ? body.errors[0] : null
      }
    } else {
      return {
        status: response.status,
        ok: response.ok,
        data: null,
        error: { message: `Server responded with status: ${response.status}` }
      }
    }
  }
}

export const graphqlApi = new GraphqlApi()
