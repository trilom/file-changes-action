import {mkdirSync, existsSync, readFileSync, rmdirSync, unlinkSync} from 'fs'
import {Env, p, getTestEvents, getTestFiles} from './mocks/env'

let env: Env
let originalWrite: (str: string) => boolean
let originalConsoleLog: (str: string) => void
let processStdoutMock: jest.SpyInstance
let consoleLogMock: jest.SpyInstance
let output = ''

function cleanupTest(path: string, ext: string):void {
  ['files', 'files_modified', 'files_added', 'files_removed'].forEach(type => {
    unlinkSync(`${path}/${type}${ext}`)
  })
  rmdirSync(path)
}

describe('Testing main.ts...', () => {
  describe.each(p.testEvents)('...with %s event...', event => {
    /**
     * @function run
     */
    describe('...with function run...', () => {
      describe.each(getTestEvents(p.getFormatExtInputs, 'push'))(
        '...with fileOutput %s...',
        (fileOutputName, fileOutputInput, fileOutputExpected) => {
          describe.each(getTestEvents(p.getFormatExtInputs, 'push'))(
            '...with output %o...',
            (outputName, outputInput, outputExpected) => {
              describe.each(getTestEvents(p.mainInputs, event))(
                '...with %s event inputs non mocked...',
                (eventName, eventInput, eventExpected) => {
                  beforeAll(() => {
                    // originalWrite = process.stdout.write
                    // originalConsoleLog = console.log
                    consoleLogMock = jest.spyOn(console, 'log').mockImplementation((
                      message:string
                    ) => {
                      output += ` ${message}`
                    })
                    processStdoutMock = jest.spyOn(process.stdout, 'write').mockImplementation((
                      command:string | Uint8Array, 
                      encoding?: string, 
                      cb?:() => void) => {
                      output += ` ${command}`
                      return false
                    })
                  })
                  beforeEach(() => {
                    env = new Env(
                      {
                        HOME: `./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}`
                      },
                      {
                        githubRepo: 'trilom/file-changes-action',
                        githubToken: process.env.GITHUB_TOKEN || process.env.INPUT_GITHUBTOKEN || '',
                        output: outputInput,
                        fileOutput: fileOutputInput,
                        ...eventInput
                      },
                      event,
                      false
                    )
                  })
                  afterEach(() => {
                    process.env = env.envStart
                    // process.stdout.write = originalWrite
                    // console.log = originalConsoleLog
                    output = ''
                    jest.resetModules()
                  })
                  afterAll(() => {
                    // jest.unmock('process')
                    // jest.unmock('console')
                  })
                  it('...no-mock', async () => {
                    mkdirSync(process.env.HOME || '', {recursive: true})
                    await expect(require('../main').run()).resolves.toBe(undefined)
                    expect(output).toContain('::set-output name=files')
                    expect(output).toContain('::set-output name=files_added')
                    expect(output).toContain('::set-output name=files_modified')
                    expect(output).toContain('::set-output name=files_removed')
                    expect(existsSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files${fileOutputExpected}`)).toBeTruthy()
                    expect(existsSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_added${fileOutputExpected}`)).toBeTruthy()
                    expect(existsSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_modified${fileOutputExpected}`)).toBeTruthy()
                    expect(existsSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_removed${fileOutputExpected}`)).toBeTruthy()
                    if (fileOutputExpected === '.json') {
                      expect(JSON.parse(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files${fileOutputExpected}`, 'utf8'))).toHaveLength(73)
                      expect(JSON.parse(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_added${fileOutputExpected}`, 'utf8'))).toHaveLength(52)
                      expect(JSON.parse(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_modified${fileOutputExpected}`, 'utf8'))).toHaveLength(13)
                      expect(JSON.parse(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_removed${fileOutputExpected}`, 'utf8'))).toHaveLength(8)
                    } else {
                      expect(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files${fileOutputExpected}`, 'utf8').split(fileOutputInput)).toHaveLength(73)
                      expect(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_added${fileOutputExpected}`, 'utf8').split(fileOutputInput)).toHaveLength(52)
                      expect(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_modified${fileOutputExpected}`, 'utf8').split(fileOutputInput)).toHaveLength(13)
                      expect(readFileSync(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}/files_removed${fileOutputExpected}`, 'utf8').split(fileOutputInput)).toHaveLength(8)
                    }
                    cleanupTest(`./src/tests/outputs/${event}/${eventName}/o_${outputName}f_${fileOutputName}`, fileOutputExpected)
                  }, 10000)
                }
              )
            }
          )
        }
      )
    })
  })
})