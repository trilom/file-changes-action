// imports
import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { resolve as _resolve } from 'path'
import {mocked} from 'ts-jest/utils'
import { octokitMock } from '../octokit/octokit'
// join all payloads
import * as octokitPayloads from '../../payloads/octokit'
import * as envPayloads from '../../payloads/env'

const payloads = {...octokitPayloads, ...envPayloads}
// export payloads and class
export { payloads, payloads as p }

function eventName(e:string):string {
  if (e.includes('push')) return 'push'
  if (e.includes('pull_request')) return 'pull_request'
  if (e.includes('issue_comment')) return 'issue_comment'
  return e.trim()
}

function formatInput(inputs:{[key:string]: string}):{[key:string]: string}{
  return Object.fromEntries(Object.entries(inputs).map(input => {
    const t = [
      input[0].replace(input[0], `INPUT_${input[0].replace(/ /g, '_').toUpperCase()}`),
      input[1]]
    return t}))
}

export class Env 
{
  constructor(
    envVars: {[key:string]: string} = {}, // any additional env vars on top of process.env
    inputs: {[key:string]: string} = {},
    event = 'push') // any additional inputs
  {
    // console.log(`I am initing for event ${event}`)
    this.setEnv(event, envVars, inputs) // set env vars with event input
    this.setMocks() // set mocks
  }

  public envDefault: {[key:string]: string} = {
    GITHUB_TOKEN: 'EnvDefaultToken',
    GITHUB_WORKSPACE: _resolve(__dirname, '../../workspace/github'),
    GITHUB_REPOSITORY: "trilom-test/file-changes-action",
    GITHUB_ACTION: 'file-changes-action'
  }

  public envStart: {[key:string]: string | undefined} = {...process.env}  // store shallow copy of process.env on init

  // set mocks
  contextMock!: Context
  
  coreMock!: any

  githubMock!: GitHub
  
  octokitMock: GitHub = octokitMock as unknown as GitHub

  event = 'push'

  setEnv(
    event: string = this.event,
    envVars: {[key:string]: string},
    inputs: {[key:string]: string}):void
  {
    this.event = event
    const eventPayload = _resolve(__dirname, `../../payloads/events/${this.event}.json`)
    this.setInput({
      ...this.envDefault, // / add default vars
      ...{
        GITHUB_EVENT_PATH: eventPayload,
        GITHUB_EVENT_NAME: eventName(this.event)
      }, // add event payload passed in
      ...envVars,
      ...formatInput(inputs) // add in passed in vars
    }  
    )
  }

  setMocks():void {
    this.setGithubMock()
    this.setCoreMock()
  }

  setInput(inputs:{[key:string]: string}):void {
    process.env = { ...this.envStart, ...inputs} 
  }

  updateInput(inputs:{[key:string]: string}):void {
    process.env = { ...process.env, ...formatInput(inputs)}
    this.setGithubMock()
  }

  setCoreMock():void {
    this.coreMock = {
      getInput: jest.fn((name: string, options?: core.InputOptions) => process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]),
      debug: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    }
    jest.mock('@actions/core', () => this.coreMock)
  }
  
  setGithubMock():void {
    this.githubMock =  {
      ...this.octokitMock
    } as unknown as GitHub
    this.contextMock = new Context()
    jest.mock('@actions/github', () => (
      { GitHub: jest.fn(() =>  this.githubMock),
        context: this.contextMock}))
  }
}