// Imports
import { Inferred } from 'typings/Inferred'
import { TestInput } from 'typings/TestInput'
import * as p from '../octokit/payloads'

export function getTestEvents(inputs: any, event: string): any[][] {
  const ret: any[][] = []
  inputs.forEach((test: any) => {
    if (typeof test.events === 'string' && test.events === 'all') ret.push(test.inputs)        // add for all events
    else if (typeof test.events === 'string' && test.events === event) ret.push(test.inputs)   // add for named event
    else if (Array.isArray(test.events) && test.events.includes(event)) ret.push(test.inputs)  // add for named event in list
  })
  return ret
}
/**
 * Events to Test
 */
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

/**
 * main Test inputs
 */
export const mainTestInputs: TestInput[] = [

]
/**
 * GithubHelper Test inputs
 */
export const initClientTestInputs: TestInput[] = [
  { inputs: ['calls the Github client constructor with a token', '12345abcde', '12345abcde'], events: 'all' }
]
export const getChangedPRFilesTestInputs: TestInput[] = [
  { inputs: ['gets changed files for a pull request', 
    { owner: 'trilom', repo: 'file-changes-action', pullNumber: 80 },
    p.OctokitPaginatePrResponse], events: 'all'},
  { inputs: ['throws an error with no pull request', 
    { owner: 'trilom', repo: 'file-changes-action', pullNumber: NaN },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid repo for pull request', 
    { owner: 'trilom', repo: 'file-chandkdk-action-thatdoesntreallyexist', pullNumber: 80 },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid owner for pull request', 
    { owner: 'this-isntareal-githubowner', repo: 'file-changes-action', pullNumber: 80 },
    {}], events: 'all'}
]
export const getChangedPushFilesTestInputs: TestInput[] = [
  { inputs: ['gets changed files for a push',
    { owner: 'trilom', repo: 'file-changes-action', before: 'abcd1234', after: '1234abcd' },
    p.OctokitPaginatePushResponse], events: 'all'},
  { inputs: ['throws an error with no before for a push', 
    { owner: 'trilom', repo: 'file-changes-action', before: '', after: '1234abcd' },
    {}], events: 'all'},
  { inputs: ['throws an error with no after for a push', 
    { owner: 'trilom', repo: 'file-changes-action', before: '1234abcd', after: '' },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid repo for a push', 
    { owner: 'trilom', repo: 'file-chandkdk-action-thatdoesntreallyexist', before: 'abcd1234', after: '1234abcd' },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid owner for a push', 
    { owner: 'this-isntareal-githubowner', repo: 'file-changes-action', before: 'abcd1234', after: '1234abcd' },
    {}], events: 'all'}
]
export const getChangedFilesTestInputs: TestInput[] = [
  { inputs: ['gets changed files for a push',
    { repo: 'trilom/file-changes-action', ...{ before: 'abcd1234', after: '1234abcd' } as Inferred },
    p.OctokitPaginatePushResponse], events: 'all'},
  { inputs: ['throws an error with a malformed owner/repo for a push', 
    { repo: 'trilom/testing/afew/backslash', ...{ before: 'abcd1234', after: '1234abcd' } as Inferred },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid owner for a push', 
    { repo: 'trilom-NOTREAL/backslash', ...{ before: 'abcd1234', after: '1234abcd' } as Inferred },
    {}], events: 'all'},
  { inputs: ['throws an error with no after for a push',  
    { repo: 'trilom/cloudformation', ...{ before: 'abcd1234' } as Inferred },
    {}], events: 'all'},
  { inputs: ['throws an error with no before for a push', 
    { repo: 'trilom/cloudformation', ...{ after: 'abcd1234' } as Inferred },
    {}], events: 'all'},
  { inputs: ['gets changed files for a pull request',
    { repo: 'trilom/file-changes-action', ...{ pr: 80 } as Inferred },
    p.OctokitPaginatePrResponse], events: 'all'},
  { inputs: ['throws an error with a malformed owner/repo for a pr', 
    { repo: 'trilom/testing/afew/backslash', ...{ pr: 80 } as Inferred },
    {}], events: 'all'},
  { inputs: ['throws an error with invalid owner for a pr', 
    { repo: 'trilom-NOTREAL/backslash', ...{ pr: 80 } as Inferred },
    {}], events: 'all'},
  { inputs: ['throws an error with no pull request', 
    { repo: 'trilom/cloudformation', ...{ } as Inferred },
    {}], events: 'all'}
]
/**
 * InputHelper Test inputs
 */
export const inputTestInputs: TestInput[] = [
  { inputs: ['githubRepo', 'trilom-test/file-changes-action', 'trilom-test/file-changes-action'], events: 'all' },
  { inputs: ['githubToken', 'InputTestToken', 'InputTestToken'], events: "all" },
  { inputs: ['pushBefore', 'abcd1234', 'abcd1234'], events: "all" },
  { inputs: ['pushAfter', '1234abcd', '1234abcd'], events: "all" },
  { inputs: ['prNumber', '1', 1], events: "all" },
  { inputs: ['output', 'json', 'json'], events: "all" },
  { inputs: ['fileOutput', 'json', 'json'], events: "all" }
]
export const inferTestInputs: TestInput[] = [
  { inputs: ['sets PUSH inferred outputs with pr inputs and PUSH inputs and PULL_REQUEST event',
    { event: 'pull_request', before: '1234abcd', after: 'abcd1234', pr: 3 },
    { before: '1234abcd', after: 'abcd1234' } as Inferred],
  events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  {inputs: ['sets PULL_REQUEST inferred outputs with single PUSH input and PULL_REQUEST event, ALSO WARN weird',
    { event: 'pull_request', before: '1234abcd', after: '', pr: 2 },
    { pr: 2 } as Inferred],
  events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  {inputs: ['sets PULL_REQUEST inferred outputs with no PUSH inputs and PULL_REQUEST event',
    { event: 'pull_request', before: '', after: '', pr: 4 },
    { pr: 4 } as Inferred],
  events: ['pull_request_opened', 'pull_request_reopened', 'pull_request_synchronize']},
  {inputs: ['sets PULL_REQUEST inferred outputs with pr input and PUSH event',
    { event: 'push', before: 'abcd12345', after: '12345abcd', pr: 1 },
    { pr: 1 } as Inferred],
  events: ['push', 'push_merge']},
  {inputs: ['sets PUSH inferred outputs with no pr input and PUSH event',
    { event: 'push', before: 'abcd1234', after: '1234abcd', pr: NaN },
    { before: 'abcd1234', after: '1234abcd' } as Inferred],
  events: ['push', 'push_merge']},
  {inputs: ['sets PUSH inferred outputs with PUSH and PULL_REQUEST inputs NOT PUSH or PULL_REQUEST event, ALSO WARN all',
    { event: 'schedule', before: 'abcd12345', after: '12345abcd', pr: 1 },
    { before: 'abcd12345', after: '12345abcd' } as Inferred],
  events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  {inputs: ['sets PULL_REQUEST inferred outputs with single PUSH and PULL_REQUEST inputs NOT PUSH or PULL_REQUEST event, ALSO WARN weird',
    { event: 'schedule', before: '', after: 'abcd12345', pr: 3 },
    { pr: 3 } as Inferred],
  events: ['issue_comment_created', 'issue_comment_edited', 'schedule']},
  {
    inputs: ['sets PULL_REQUEST inferred outputs with PULL_REQUEST input NOT PUSH or PULL_REQUEST event',
      { event: 'schedule', before: '', after: '', pr: 44 },
      { pr: 44 } as Inferred],
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']
  },
  {
    inputs: ['sets PUSH inferred outputs with PUSH inputs NOT PUSH or PULL_REQUEST event',
      { event: 'schedule', before: 'abcd12345', after: '12345abcd', pr: NaN },
      { before: 'abcd12345', after: '12345abcd', pr: 44 } as Inferred],
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']
  },
  {
    inputs: ['throws ERROR with no inputs NOT PUSH or PULL_REQUEST event',
      { before: '', after: '', pr: NaN },
      {} as Inferred],
    events: ['issue_comment_created', 'issue_comment_edited', 'schedule']
  }
]
/**
 * FilesHelper Test inputs
 */
export const sortChangedFilesInputs: TestInput[] = [
  { inputs: ['json', 'json', '.json'], events: 'push' },
  { inputs: ['csv', ',', '.csv'], events: 'push' },
  { inputs: ['txt', ' ', '.txt'], events: 'push' },
  { inputs: ['txt', '_<br />&nbsp;&nbsp;_', '.txt'], events: 'push' }
]
export const getOutputInputs: TestInput[] = [
  {
    inputs: ['set output string to specified output format for ChangedFiles Object',
      [
        {
          inputs: [`sets json payloads to JSON.stringify()`,
            { format: 'json', changedFiles: p.normalFileArray }, 'json'], events: "push"
        },
        {
          inputs: [`sets single spaced payloads to files.join(" ")`,
            { format: ' ', changedFiles: p.normalFileArray }, ' '], events: "push"
        },
        {
          inputs: [`sets comma spaced payloads to files.join(",")`,
            { format: ',', changedFiles: p.normalFileArray }, ','], events: "push"
        },
        {
          inputs: [`sets _<br />&nbsp;&nbsp;_ spaced payloads to files.join("_<br />&nbsp;&nbsp;_")`,
            { format: '_<br />&nbsp;&nbsp;_', changedFiles: p.normalFileArray }, '_<br />&nbsp;&nbsp;_'], events: "push"
        }
      ], {}
    ],
    events: "push"
  }
]
export const writeOutputInputs: TestInput[] = [
  {
    inputs: ['sets core.setOutput outputs with specified format',
      { format: 'json', changedFiles: {} },
      {}],
    events: "push"
  }
]
export const getFormatExtInputs: TestInput[] = [
  { inputs: ['json', 'json', '.json'], events: 'push' },
  { inputs: ['csv', ',', '.csv'], events: 'push' },
  { inputs: ['txt', ' ', '.txt'], events: 'push' },
  { inputs: ['txt', '_<br />&nbsp;&nbsp;_', '.txt'], events: 'push' }
]
export const formatChangedFilesInput : TestInput[] = [
  { inputs: [ {type:'normal',  format:'json'}, p.normalFileArray, JSON.stringify(p.normalFileArray)], events: 'push' },
  { inputs: [ {type:'normal',  format:','}, p.normalFileArray, p.normalFileArray.join(',')], events: 'push' },
  { inputs: [ {type:'normal',  format:' '}, p.normalFileArray, p.normalFileArray.join(' ')], events: 'push' },
  { inputs: [ {type:'normal',  format:'_<br />&nbsp;&nbsp;_'}, p.normalFileArray, p.normalFileArray.join('_<br />&nbsp;&nbsp;_')], events: 'push' },
  { inputs: [ {type:'weird',  format:'json'}, p.weirdFileArray, JSON.stringify(p.weirdFileArray)], events: 'push' },
  { inputs: [ {type:'weird',  format:','}, p.weirdFileArray, p.weirdFileArray.join(',')], events: 'push' },
  { inputs: [ {type:'weird',  format:' '}, p.weirdFileArray, p.weirdFileArray.join(' ')], events: 'push' },
  { inputs: [ {type:'weird',  format:'_<br />&nbsp;&nbsp;_'}, p.weirdFileArray, p.weirdFileArray.join('_<br />&nbsp;&nbsp;_')], events: 'push' }
]
/**
 * UtilsHelper Test inputs
 */