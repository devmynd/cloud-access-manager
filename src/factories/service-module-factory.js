import { dummyConfigKeys, DummyProvider } from '../services/dummy'

export function factory (moduleName: string): { config: any, provider: any } {
  switch (moduleName) {
    case 'dummy':
      return { configKeys: dummyConfigKeys, Provider: DummyProvider }
    default:
      let err: string = `undefined module: '${moduleName}'`
      throw err
  }
}
