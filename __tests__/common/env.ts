// imports
import { resolve as _resolve } from 'path'
import * as _Context from '@actions/github/lib/context'
import * as core from '@actions/core'
import { IInferred } from '../../src/InputHelper'
import { weirdFileArray, normalFileArray } from '../common/files'
// exports
export { Context } from '@actions/github/lib/context'
export { resolve as resolve } from 'path'




// InputHelper inputs
export const inputTestInputs: any[] = [
  { inputs: ['githubRepo', 'trilom-test/file-changes-action', 'trilom-test/file-changes-action'], events: "all"},
  { inputs: ['githubToken', '12345abcde', '12345abcde'], events: "all"},
  { inputs: ['pushBefore', 'abcd1234', 'abcd1234'], events: "all"},
  { inputs: ['pushAfter', '1234abcd', '1234abcd'], events: "all"},
  { inputs: ['prNumber', '1', 1], events: "all"},
  { inputs: ['output', 'json', 'json'], events: "all"},
  { inputs: ['fileOutput', 'json', 'json'], events: "all"}
]
export const inferTestInputs: any[] = [
  { inputs: ['Sets PUSH inferred outputs with pr inputs and PUSH inputs and PULL_REQUEST event', 
    { event: 'pull_request', before: '1234abcd', after: 'abcd1234', pr: 3 }, 
    { event_type: 'push', before: '1234abcd', after: 'abcd1234' } as IInferred], 
    events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  { inputs: ['Sets PULL_REQUEST inferred outputs with single PUSH input and PULL_REQUEST event, ALSO WARN weird', 
    { event: 'pull_request', before: '1234abcd', after: '', pr: 2 }, 
    { event_type: 'pull_request', pr: 2 } as IInferred], 
    events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  { inputs: ['Sets PULL_REQUEST inferred outputs with no PUSH inputs and PULL_REQUEST event', 
    { event: 'pull_request', before: '', after: '', pr: 4 }, 
    { event_type: 'pull_request', pr: 4 } as IInferred], 
    events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  { inputs: ['Sets PULL_REQUEST inferred outputs with pr input and PUSH event', 
    { event: 'push', before: 'abcd12345', after: '12345abcd', pr: 1 }, 
    { event_type: 'pull_request', pr: 1 } as IInferred], 
    events: ['push', 'push_merge']},
  { inputs: ['Sets PUSH inferred outputs with no pr input and PUSH event', 
    { event: 'push', before: 'abcd1234', after: '1234abcd', pr: NaN }, 
    { event_type: 'push', before: 'abcd1234', after: '1234abcd' } as IInferred], 
    events: ['push', 'push_merge']},
  { inputs: ['Sets PUSH inferred outputs with PUSH and PULL_REQUEST inputs NOT PUSH or PULL_REQUEST event, ALSO WARN all', 
    { event: 'schedule', before: 'abcd12345', after: '12345abcd', pr: 1 }, 
    { event_type: 'push', before: 'abcd12345', after: '12345abcd' } as IInferred], 
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  { inputs: ['Sets PULL_REQUEST inferred outputs with single PUSH and PULL_REQUEST inputs NOT PUSH or PULL_REQUEST event, ALSO WARN weird', 
    { event: 'schedule', before: '', after: 'abcd12345', pr: 3 }, 
    { event_type: 'pull_request', pr: 3 } as IInferred], 
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  { inputs: ['Sets PULL_REQUEST inferred outputs with PULL_REQUEST input NOT PUSH or PULL_REQUEST event', 
    { event: 'schedule', before: '', after: '', pr: 44 }, 
    { event_type: 'pull_request', pr: 44 } as IInferred], 
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  { inputs: ['Sets PUSH inferred outputs with PUSH inputs NOT PUSH or PULL_REQUEST event', 
    { event: 'schedule', before: 'abcd12345', after: '12345abcd', pr: NaN }, 
    { event_type: 'push', before: 'abcd12345', after: '12345abcd', pr: 44 } as IInferred], 
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  { inputs: ['Throws ERROR with no inputs NOT PUSH or PULL_REQUEST event', 
    { event: 'schedule', before: '', after: '', pr: NaN }, 
    {} as IInferred], 
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']}
]
// FilesHelper inputs
export const ChangedFilesInputs: any[] = [
  {
    inputs: ['Set output string to specified output format for ChangedFiles.getOutput',
      [
        { format: 'json', changedFiles: normalFileArray },
        { format: ' ', changedFiles: normalFileArray },
        { format: ',', changedFiles: normalFileArray },
        { format: 'json', changedFiles: normalFileArray },
      { format: 'json'}],
    events: "push"
  }
]
export const writeOutputInputs: any[] = [
  { inputs: ['Sets core.setOutput outputs with specified format', 
    { format: 'json', changedFiles: {} },
    {}], 
    events: "push" }
]
// GithubHelper inputs
// main inputs
export const defaultVars: any = {
  GITHUB_TOKEN: 'abcd1234',
  HOME: _resolve(__dirname, 'workspace'),
  GITHUB_WORKSPACE: _resolve(__dirname, 'workspace/github'),
  GITHUB_REPOSITORY: "trilom-test/file-changes-action",
  GITHUB_ACTION: 'file-changes-action',
  GITHUB_EVENT_PATH: _resolve(__dirname, `payloads/events/push.json`)
}

export const testEvents: string[] = [
  'issue_comment_created',
  'issue_comment_edited',
  'pull_request_opened',
  'pull_request_reopened',
  'pull_request_synchronize',
  'push_merge',
  'push',
  'schedule'
]

export function getTestEvents(inputs: any, event: string): any[][] {
  let ret: any[][] = []
  inputs.forEach(test => {
    if (typeof test.events === 'string' && test.events === 'all') ret.push(test.inputs)        // add for all events
    else if (typeof test.events === 'string' && test.events === event) ret.push(test.inputs)   // add for named event
    else if (Array.isArray(test.events) && test.events.includes(event)) ret.push(test.inputs)  // add for named event in list
  })
  return ret
}

export class Env {
  context: _Context.Context                     // context object
  _inputs: any = {}                             // mock object for action inputs
  _inputsOriginal: any                          // storage for action inputs
  set inputs(inputs: any | undefined) {         // mock object setter for action inputs
    if (typeof inputs === 'undefined') this._inputs
    for (const key in inputs)
      this._inputs[key] = inputs[key as keyof typeof inputs]
  }  
  get inputs() {                                // mock object getter for action inputs
    return this._inputs
  }
  _envDefault: any = process.env                // storage for original process.env
  _envOriginal: any                             // storage for process.env inputs
  _issue: any = {}                              // mock object for context.issue
  _issueOriginal: any = {}                      // original context.issue
  _repo: any = {}                               // mock object for context.repo
  _repoOriginal: any = {}                       // original context.repo
  // set mocks
  inputSpy: jest.SpyInstance                    // mock for core.getInput
  repoSpy: jest.SpyInstance                     // mock for context.repo
  issueSpy: jest.SpyInstance                    // mock for context.issue
  logSpy: jest.SpyInstance                      // mock for console.log
  debugSpy: jest.SpyInstance                    // mock for core.debug
  infoSpy: jest.SpyInstance                     // mock for core.info
  warningSpy: jest.SpyInstance                  // mock for core.warning
  errorSpy: jest.SpyInstance                    // mock for core.error
  
  reset(
    envVars: any = {},                          // pass in envVars
    inputs: any = {},                           // pass in inputs for action
    envVarsOriginal: boolean = true,            // bool (true) to include original passed in envVars with this resetted object
    inputsOriginal: boolean = true,             // bool (true) to include original pass in action inputs with this resetted object
    init?: boolean): void {                     // bool (false) to return before restting repo and issue context.issue and context.repo
    // if (process.env['GITHUB_EVENT_PATH']?.includes('pull_request')) {
    //   console.error(`before add original GITHUB_TOKEN ${JSON.stringify(process.env['GITHUB_TOKEN'])}, original inputs ${JSON.stringify(inputs)}, default GITHUB_TOKEN ${JSON.stringify(this._envDefault['GITHUB_TOKEN'])}, original original GITHUB_TOKEN ${JSON.stringify(this._envOriginal['GITHUB_TOKEN'])}`)
    // }
    if (envVarsOriginal) envVars = { ...this._envOriginal, ...envVars }
    if (inputsOriginal) inputs = { ...this._inputsOriginal, ...inputs }
    // if (process.env['GITHUB_EVENT_PATH']?.includes('pull_request')) {
    //   console.error(`after add original GITHUB_TOKEN ${JSON.stringify(process.env['GITHUB_TOKEN'])}, original inputs ${JSON.stringify(inputs)}, default GITHUB_TOKEN ${JSON.stringify(this._envDefault['GITHUB_TOKEN'])}, original original GITHUB_TOKEN ${JSON.stringify(this._envOriginal['GITHUB_TOKEN'])}`)
    // }
    // reset mocks
    process.env = { ...this._envDefault, ...envVars }  // set action process.env variables
    this._inputs = { ...inputs }                       // set action inputs
    if (init) return                                   // if init then return to copy original repo/issue for mocks
    this._issue = this._issueOriginal                  // reset issue mock 
    this._repo = this._repoOriginal
    // if (process.env['GITHUB_EVENT_PATH']?.includes('pull_request')) {
    //   console.error(`RESET\ngithubToken: ${process.env['githubToken']}\nGITHUB_TOKEN: ${process.env['GITHUB_TOKEN']}\ninput: ${inputs['githubToken']}`)
    // }
    
  }

  constructor(envVars: any = {}, inputs: any = {}) {
    // console.error(`Creating Env object...\nenvVars:${JSON.stringify(envVars)}\ninputs:${JSON.stringify(inputs)}`)
    this._envOriginal = { ...envVars }                 // store original input env
    this._inputsOriginal = { ...inputs }               // store original action inputs
    this.reset(envVars, inputs, true, true, true)        // set env vars and inputs
    this.context = new _Context.Context()       // create context with env vars
    this._issue = this._issueOriginal = this.context.issue || { repo: 'file-changes-action', owner: 'trilom'}   // copy init var for context.issue
    this._repo = this._repoOriginal = this.context.repo || { repo: 'file-changes-action', owner: 'trilom' }     // copy init var for context.repo
    // create mocks
    this.inputSpy = jest.spyOn(core, 'getInput').mockImplementation((name: string) => this._inputs[name]);
    this.issueSpy = jest.spyOn(this.context, 'issue', 'get').mockImplementation(() => this._issue)
    this.repoSpy = jest.spyOn(this.context, 'repo', 'get').mockImplementation(() => this._repo)
    this.debugSpy = jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    this.infoSpy = jest.spyOn(core, 'info').mockImplementation(jest.fn())
    this.warningSpy = jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    this.errorSpy = jest.spyOn(core, 'error').mockImplementation(jest.fn())
    this.logSpy = jest.spyOn(console, 'log').mockImplementation(line => {
      // uncomment to debug
      process.stderr.write('log:' + line + '\n');
    });
  }
}