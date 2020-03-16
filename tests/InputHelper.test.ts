import { Env, p } from './mocks/env/env'
let env: Env // env object

describe.each(p.testEvents)('Testing %s event...', event => {
  beforeAll(() => env = new Env({}, {githubToken: 'TestToken'}, event))
  afterEach(() => {
    process.env = {...env.envStart}
    jest.resetModules()
    env = new Env({}, {}, event)
  })
  it('Sets correct default input parameters.', () => {
    let {payload, issue} = env.contextMock
    let { prNumber, pushAfter, pushBefore, githubToken, githubRepo, output, fileOutput } = require('../src/InputHelper').getInputs()
    let getInput = require('@actions/core').getInput
    // evaluate outputs
    if (event.includes('push')) {
      expect(prNumber).toBe(NaN)
      expect(pushAfter).toBe(payload.after)
      expect(pushBefore).toBe(payload.before)
    }
    if (event.includes('pull_request') || event.includes('issue_comment')) {
      expect(prNumber).toBe(issue.number)
      if (event === 'pull_request_synchronize') {
        expect(pushAfter).toBe(payload.after)
        expect(pushBefore).toBe(payload.before)
      } else {
        expect(pushAfter).toBeFalsy()
        expect(pushBefore).toBeFalsy()
      }
    }
    expect(githubToken).toBe(process.env.INPUT_GITHUBTOKEN)
    expect(githubRepo).toBe(process.env.GITHUB_REPOSITORY)
    expect(output).toBe('json')
    expect(fileOutput).toBe('json')
    expect(getInput).toHaveBeenCalledTimes(7)
  })
  it('Throws error with no token (undefined) process.env["GITHUB_TOKEN"] \
or (undefined) input githubToken', () => {
    delete process.env.GITHUB_TOKEN
    delete process.env.INPUT_GITHUBTOKEN
    let getInput = require('@actions/core').getInput
    expect(() => {
      require('../src/InputHelper').getInputs()
    }).toThrowErrorMatchingSnapshot()
    expect(getInput).toHaveBeenCalledTimes(1)
  })
  it('Throws error with empty string ("") process.env["GITHUB_TOKEN"] \
or empty string ("") input githubToken', () => {
    env.updateInput({ githubToken: '' })
    process.env.GITHUB_TOKEN = ''
    let getInput = require('@actions/core').getInput
    expect(() => {
      require('../src/InputHelper').getInputs()
    }).toThrowErrorMatchingSnapshot()
    expect(getInput).toHaveBeenCalledTimes(1)
  })
  // test getInputs function
  it.each(p.getTestEvents(p.inputTestInputs, event))
  ('Sets %s input "%s" should be %p', (inputName, input, expected) => {
    env.updateInput({[inputName]: input})
    let {payload, issue} = env.contextMock
    let { prNumber, pushAfter, pushBefore, githubToken, githubRepo, output, fileOutput } = require('../src/InputHelper').getInputs()
    let getInput = require('@actions/core').getInput
    // evaluate outputs
    if (event.includes('push')) {
      expect(prNumber).toBe((inputName === 'prNumber') ? expected : NaN)
      expect(pushAfter).toBe((inputName === 'pushAfter') ? expected : payload.after )
      expect(pushBefore).toBe((inputName === 'pushBefore') ? expected : payload.before)
    }
    if (event.includes('pull_request') || event.includes('issue_comment')) {
      expect(prNumber).toBe((inputName === 'prNumber') ? expected : issue.number)
      if (event === 'pull_request_synchronize') {
        expect(pushAfter).toBe((inputName === 'pushAfter') ? expected : payload.after )
        expect(pushBefore).toBe((inputName === 'pushBefore') ? expected : payload.before)
      } else {
        expect(pushAfter).toBe((inputName === 'pushAfter') ? expected : false )
        expect(pushBefore).toBe((inputName === 'pushBefore') ? expected : false )
      }
    }
    expect(githubToken).toBe((inputName === 'githubToken') ? expected : 'EnvDefaultToken')
    expect(githubRepo).toBe((inputName === 'githubRepo') ? expected : process.env.GITHUB_REPOSITORY)
    expect(output).toBe((inputName === 'output') ? expected : 'json')
    expect(fileOutput).toBe((inputName === 'fileOutput') ? expected : 'json')
    expect(getInput).toHaveBeenCalledTimes(7)
  })
  // test inferInput function
  it.each(p.getTestEvents(p.inferTestInputs, event))
  ('%s', (title, input, expected) => {
    let error = require('@actions/core').error
    let warning = require('@actions/core').warning
    if (title.includes('ERROR')) {
      expect(() => {
        require('../src/InputHelper').inferInput(input.before, input.after, input.pr)  
      }).toThrowErrorMatchingSnapshot()
    } else {
      let data = require('../src/InputHelper').inferInput(input.before, input.after, input.pr)
      Object.keys(data).forEach((key) => expect(data[key]).toBe(expected[key]))
      expect(error).not.toHaveBeenCalled()
    }
    // evaluate outputs
    if (title.includes('WARN weird')) 
      expect(warning).toHaveBeenCalledWith(expect.stringContaining(`received a before(${input.before}) or after(${input.after}) value.`))
    if (title.includes('WARN all')) 
      expect(warning).toHaveBeenCalledWith(expect.stringContaining(`but received a before(${input.before}), after(${input.after}), and PR(${input.pr}).`))
    else 
      expect(error).not.toHaveBeenCalled()
  })
})
