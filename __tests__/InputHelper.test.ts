import * as core from '@actions/core'
import { Env, resolve, defaultVars, testEvents, inputTestInputs, inferTestInputs, getTestEvents, Context } from './common/env'
import { getInputs, inferInput, IInferred } from '../src/InputHelper'

let env: Env // env object
let envVars: any
let context: Context
const inputs: any = { githubToken: "1234abcd" }

describe.each(testEvents)('Testing github action event %s...', event => {
  // create a brand new context object for each event test set
  beforeAll(() => {
    let inputs: any = { githubToken: "1234abcd" }
    let envVars: any = { ...defaultVars, ...{GITHUB_EVENT_PATH: resolve(__dirname, `payloads/events/${event}.json`)}}
    env = new Env(envVars, inputs)
    context = env.context
  })
  // reset mocks and context object after each test
  afterEach(() => {
    env.resetEnv()
  })
  // reset mock after each event test set
  afterAll(() => {
    env.resetEnv({}, {}, false, false)                        
  })
  it('Sets correct default input parameters.', () => {
    let data = getInputs(context)
    // evaluate outputs
    if (event.includes('push')) {
      expect(data.prNumber).toBe(NaN)
      expect(data.pushAfter).toBe(context.payload.after)
      expect(data.pushBefore).toBe(context.payload.before)
    }
    if (event.includes('pull_request') || event.includes('issue_comment')) {
      expect(data.prNumber).toBe(context.issue.number)
      if (event === 'pull_request_synchronize') {
        expect(data.pushAfter).toBe(context.payload.after)
        expect(data.pushBefore).toBe(context.payload.before)
      } else {
        expect(data.pushAfter).toBeFalsy()
        expect(data.pushBefore).toBeFalsy()
      }
    }
    expect(data.githubToken).toBe(env.inputs.githubToken)
    expect(data.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
    expect(data.output).toBe('json')
    expect(data.fileOutput).toBe('json')
    expect(core.error).not.toHaveBeenCalled()
  })
  it('Throws error with no token (undefined) process.env["GITHUB_TOKEN"] or (undefined) input githubToken', () => {
    env.resetEnv({}, {}, false, false) // no process.env token and token input
    expect(() => {
      getInputs(context)
    }).toThrowError('Received no token, a token is a requirement.')
  })
  it('Throws error with empty string ("") process.env["GITHUB_TOKEN"] or empty string ("") input githubToken', () => {
    // empty  process.env token
    env.resetEnv({ GITHUB_TOKEN: '' }, { githubToken: '' }, true, true) // empty process.env token and token input
    expect(() => {
      getInputs(context)
    }).toThrowError('Received no token, a token is a requirement.')
  })
  // test getInputs function
  it.each(getTestEvents(inputTestInputs, event))('Sets %s input "%s" should be %p', (inputName, input, expected) => {
    env.resetEnv({}, { [inputName]: input })
    let data = getInputs(context)
    // evaluate outputs
    if (event.includes('push')) {
      expect(data.prNumber).toBe((inputName === 'prNumber') ? expected : NaN)
      expect(data.pushAfter).toBe((inputName === 'pushAfter') ? expected : context.payload.after )
      expect(data.pushBefore).toBe((inputName === 'pushBefore') ? expected : context.payload.before)
    }
    if (event.includes('pull_request') || event.includes('issue_comment')) {
      expect(data.prNumber).toBe((inputName === 'prNumber') ? expected : context.issue.number)
      if (event === 'pull_request_synchronize') {
        expect(data.pushAfter).toBe((inputName === 'pushAfter') ? expected : context.payload.after )
        expect(data.pushBefore).toBe((inputName === 'pushBefore') ? expected : context.payload.before)
      } else {
        expect(data.pushAfter).toBe((inputName === 'pushAfter') ? expected : false )
        expect(data.pushBefore).toBe((inputName === 'pushBefore') ? expected : false )
      }
    }
    expect(data.githubToken).toBe((inputName === 'githubToken') ? expected : env.inputs.githubToken)
    expect(data.githubRepo).toBe((inputName === 'githubRepo') ? expected : process.env['GITHUB_REPOSITORY'])
    expect(data.output).toBe((inputName === 'output') ? expected : 'json')
    expect(data.fileOutput).toBe((inputName === 'fileOutput') ? expected : 'json')
    expect(data[inputName]).toBe(expected)
    expect(core.error).not.toHaveBeenCalled()
  })
  // test inferInput function
  it.each(getTestEvents(inferTestInputs, event))('%s', (title, input, expected) => {
    if (title.includes('ERROR')) {
      expect(() => {
        inferInput(input.event, input.before, input.after, input.pr)  
      }).toThrowError(`from ${input.event}, but received no in`)
    } else {
      let data = inferInput(input.event, input.before, input.after, input.pr)
      Object.keys(data).forEach(key => expect(data[key]).toBe(expected[key]))
    }
    // evaluate outputs
    if (title.includes('WARN weird')) expect(core.warning).toHaveBeenCalledWith(expect.stringContaining(`received a before(${input.before}) or after(${input.after}) value.`))
    if (title.includes('WARN all')) expect(core.warning).toHaveBeenCalledWith(expect.stringContaining(`but received a before(${input.before}), after(${input.after}), and PR(${input.pr}).`))
    if (title.includes('ERROR single')) expect(core.error).toHaveBeenCalledWith(expect.stringContaining(`from ${input.event}, but only received a before(${input.before}) or after(${input.after})`))
    else if (title.includes('ERROR with no inputs')) expect(core.error).toHaveBeenCalledWith(expect.stringContaining(`from ${input.event}, but received no in`))
    else expect(core.error).not.toHaveBeenCalled()
  })
})
