/* eslint global-require: 0, @typescript-eslint/no-var-requires: 0 */
import {Env, p} from './mocks/env'
let env: Env // env object

beforeAll(() => { env = new Env({}, {githubToken: 'TestToken'}, 'push')})
afterEach(() => {
  process.env = {...env.envStart}
  jest.resetModules()
  env = new Env({}, {}, 'push')
})

it('Make sure that I can throw an error', () => {
  let error = require('../UtilsHelper').getErrorString()
  expect(JSON.stringify(JSON.parse(error))).toBe(JSON.stringify({error:'500/undefined', payload:''}))
})