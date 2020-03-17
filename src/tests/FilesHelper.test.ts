/* eslint global-require: 0, @typescript-eslint/no-var-requires: 0 */
import {Env, p} from './mocks/env'
import { debug as coreDebug } from '@actions/core'
let env:Env // env object

beforeAll(() => { env = new Env({}, {githubToken: 'TestToken'}, 'push') })
afterEach(() => {
  process.env = {...env.envStart}
  jest.resetModules()
  env = new Env({}, {}, 'push')
})
it.each(p.getTestEvents(p.getFormatExtInputs, 'push'))
('Sets %s ext for input "%s" should be "%s"', (inputName, input, expected) => {
  const ext = require('../FilesHelper').getFormatExt(input)
  expect(ext).toBe(expected)
})
it.each(p.getTestEvents(p.formatChangedFilesInput, 'push'))
('Formats %o', (inputName, input, expected) => {
  const ext = require('../FilesHelper').formatChangedFiles(inputName.format, input)
  expect(ext).toBe(expected)
})
it.each([1,2,3,4,5])
('#%i Correctly sorts GithubFile array into ChangedFiles object', (inputName) => {
  console.log(process.env.HOME)
  const fileStatus = ['added', 'removed', 'modified'] as string[]
  p.normalFileArray[Math.floor(Math.random() * p.normalFileArray.length)]
  let githubFiles:any[] = []
  let stats = {files: 0, added: 0, removed: 0, modified: 0} as {[key:string]: number}
  p.normalFileArray.forEach(file => {
    const fStatus = fileStatus[Math.floor(Math.random() * fileStatus.length)] as string
    stats.files++ // increment number of files
    stats[fStatus]++ // increment status
    githubFiles.push({
      filename: file,
      status: fStatus})
  })
  const ext = require('../FilesHelper').sortChangedFiles(githubFiles)
  const coreDebug = require('@actions/core').debug
  expect(coreDebug).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(githubFiles, null, 2)))
  let retStats = {files: 0, added: 0, removed: 0, modified: 0} as {[key:string]: number}
  Object.keys(ext).forEach(key => {
    retStats[key] = ext[key].length // add status total
  })
  expect(retStats).toStrictEqual(stats)
})