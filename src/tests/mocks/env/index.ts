import {Context} from '@actions/github/lib/context'
import {CoreMock} from 'typings/CoreMock'
import {OctokitMock} from 'typings/OctokitMock'
import {GitHubMock} from 'typings/GitHubMock'
import {FsMock} from 'typings/FsMock'
import {GitHubFile} from 'typings/GitHubFile'
import {resolve as _resolve} from 'path'
import {mock as mockCore} from '../core'
import {mock as mockGitHub} from '../github'
import {mock as mockFs} from '../fs'
import * as octokitPayloads from '../octokit/payloads'
import * as envPayloads from '../../payloads'

const payloads = {...octokitPayloads, ...envPayloads}
// export payloads and class
export {payloads, payloads as p}

export function eventName(e: string): string {
  if (e.includes('push')) return 'push'
  if (e.includes('pull_request')) return 'pull_request'
  if (e.includes('issue_comment')) return 'issue_comment'
  return e.trim()
}

export function getTestEvents(inputs: any, event: string): any[][] {
  const ret: any[][] = []
  inputs.forEach((test: any) => {
    if (typeof test.events === 'string' && test.events === 'all')
      ret.push(test.inputs)
    // add for all events
    else if (typeof test.events === 'string' && test.events === event)
      ret.push(test.inputs)
    // add for named event
    else if (Array.isArray(test.events) && test.events.includes(event))
      ret.push(test.inputs) // add for named event in list
  })
  return ret
}

export function getTestFiles(
  files: string[] = octokitPayloads.normalFileArray,
  stats: {files: number; [key: string]: number} = {
    files: 0,
    added: 0,
    removed: 0,
    renamed: 0,
    modified: 0
  },
  limit: number = octokitPayloads.normalFileArray.length
): {files: GitHubFile[]; stats: {[key: string]: number}} {
  const s = stats
  const statuses = Object.keys(stats).filter(key => key !== 'files')
  return {
    files: (files
      .map(file => {
        const fStatus = statuses[
          Math.floor(Math.random() * statuses.length)
        ] as string
        s.files += 1
        s[fStatus] += 1
        return ({[fStatus]: file, status: fStatus} as unknown) as GitHubFile
      })
      .filter((file, i) => limit > i) as unknown) as GitHubFile[],
    stats: s
  }
}

export function formatInput(inputs: {
  [key: string]: string
}): {[key: string]: string} {
  return Object.fromEntries(
    Object.entries(inputs).map(input => {
      const t = [
        input[0].replace(
          input[0],
          `INPUT_${input[0].replace(/ /g, '_').toUpperCase()}`
        ),
        input[1]
      ]
      return t
    })
  )
}

export class Env {
  public envDefault: {[key: string]: string} = {
    GITHUB_TOKEN: 'EnvDefaultToken',
    GITHUB_WORKSPACE: _resolve(__dirname, '../../workspace/github'),
    GITHUB_REPOSITORY: 'trilom-test/file-changes-action',
    GITHUB_ACTION: 'file-changes-action'
  }

  public envStart: {[key: string]: string | undefined} = {...process.env} // store shallow copy of process.env on init

  // set mocks
  coreMock: CoreMock = {} as CoreMock

  githubMock: GitHubMock = {} as GitHubMock

  octokitMock: OctokitMock = {} as OctokitMock

  fsMock: FsMock = {} as FsMock

  context: Context = {} as Context

  event = 'push'

  constructor(
    envVars: {[key: string]: string}, // any additional env vars on top of process.env
    inputs: {[key: string]: string},
    event?: string, // any additional inputs
    mock = true
  ) {
    this.setEnv(event || this.event, envVars, inputs) // set env vars with event input
    if (mock) {
      this.coreMock = mockCore() // mock core
      ;({
        github: this.githubMock,
        octokit: this.octokitMock,
        context: this.context
      } = mockGitHub()) // mock github
      this.fsMock = mockFs() // mock fs
    }
  }

  setEnv(
    event: string,
    envVars: {[key: string]: string},
    inputs: {[key: string]: string}
  ): void {
    this.event = event
    const eventPayload = _resolve(__dirname, `./events/${this.event}.json`)
    this.setInput({
      ...this.envDefault, // add default vars
      ...{
        GITHUB_EVENT_PATH: eventPayload,
        GITHUB_EVENT_NAME: eventName(this.event)
      }, // add event payload passed in
      ...envVars,
      ...formatInput(inputs) // add in passed in vars
    })
  }

  setInput(inputs: {[key: string]: string}): void {
    process.env = {...this.envStart, ...inputs}
  }

  updateInput(inputs: {[key: string]: string}, mock = true): void {
    process.env = {...process.env, ...formatInput(inputs)}
    if (mock) {
      ;({
        github: this.githubMock,
        octokit: this.octokitMock,
        context: this.context
      } = mockGitHub())
    }
  }
}
